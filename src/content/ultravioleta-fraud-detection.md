### How our team replaced a brittle rule-based heuristic with a real-time machine learning system at Ridery — and why the hardest part was never the model.

---

Ultraviolet light reveals what's invisible to the naked eye — ink that isn't there under ordinary light, stains no one can see, marks that only show up when you change how you look. That's the idea we set out to build at Ridery, a ride-hailing platform operating across several Latin American cities: a system that could see the fraud that had been slipping past the old checks.

We called it **Ultravioleta**.

This is the story of how it came together — the business problem that forced it into existence, the data problem that turned out to be the real work, the modeling approach, and the production infrastructure that put it in front of live traffic. It's also a story about a team, so I'll credit people where it's due.

*(A note on specifics: this is a public writeup, so I've deliberately kept it at the level of approach and architecture. I don't discuss the actual detection features, thresholds, or anything that would serve as a roadmap for evading the system — for the same reason Stripe, Uber, Airbnb, and Grab keep those details out of their own public fraud writeups.)*

---

## Part 1 — Why a fraud model, and why now

The project didn't begin as a machine learning initiative. It began as a finance problem.

Ridery pays its drivers on a fixed cycle. In a market with a volatile local currency, every day between the moment a rider pays for a trip and the moment the driver is settled is a day of exchange-rate exposure. Over the period we worked on this, that volatility climbed sharply — enough that the gap between money collected and money paid out became something finance was actively working to shrink.

One mitigation had already shipped: moving the payout cycle from twice a week to three times a week cut the monthly currency loss by roughly **70%**. But the logical endpoint of that strategy is *immediate* payouts — pay the driver the moment the trip ends, and the exchange-rate risk essentially disappears.

And that's where it hit a wall.

If you pay drivers instantly, there's no longer a window in which anyone can review a suspicious trip before the money leaves. Faster payouts without better fraud detection don't reduce risk — they just make losses faster and less recoverable. **Immediate payouts were only viable if fraud could be caught with high confidence, automatically, before settlement.** That requirement is what created Ultravioleta.

---

## Part 2 — The system we were improving on

The fraud detection Ridery relied on before this project was a small set of fixed rules — a simple heuristic that flagged a trip only when a couple of narrow conditions lined up at once.

On paper, that system looked like it caught everything. In reality, that impression was an artifact of how it was measured. The operations team only ever investigated the trips the rules surfaced, so by construction the only fraud anyone ever saw was fraud that fit the rules' narrow shape — and the system's apparent success was measured against that same self-selected set. Anything that didn't match was never flagged, never reviewed, and never counted as a miss.

When we measured the heuristic against a properly built reference set, the fuller picture emerged: it produced a very high rate of false alarms — burying the operations team in manual review — while a substantial amount of genuine fraud went unflagged simply because the rules were never designed to look for it. This isn't a knock on the people who built it; a lean rule set is a completely reasonable first line of defense. It had just reached the limits of what a handful of fixed conditions can do, and the move to instant payouts demanded much more.

---

## Part 3 — Good data beats a good model, every single time

Here's the trap that makes fraud detection genuinely hard, and it's subtle: **the only labels we had came from the exact system we were trying to improve on.**

Every "confirmed fraud" and — more dangerously — every "confirmed legitimate" trip in the historical data was a judgment made by the old heuristic. If that heuristic was blind to a large share of fraud, then the "legitimate" pile was quietly contaminated with real frauds wearing a clean label. Train a model naively on that data and the best it can ever learn is to imitate the blind spot. You don't get a better detector — you get a faster copy of the old one.

So before any serious modeling could happen, we had to build something the company had never actually had: **ground truth we could trust.**

This is where domain expertise did the work that made everything else possible. Our data analyst and in-house fraud expert manually reviewed thousands of historical trips — case by case — translating years of hands-on fraud-investigation experience into a labeled dataset that reflected what fraud *actually* looked like on the platform, not what a few rules happened to catch. There's no clever shortcut for this part. It's casework. It's the least glamorous and most valuable thing on the entire timeline.

### The moment it all clicked

The proof that this mattered — and it's the single most important result in the project — came from a test.

Early in development, we ran a candidate model against a month of historical trips. It flagged a batch of trips the existing system had on record as **clean**. The obvious interpretation, the one a less careful team would have accepted, is that these were false positives and the model needed more work.

Instead, our fraud expert reviewed those flagged trips by hand.

**About 97% of them were real fraud** — genuine fraudulent trips the old rules had never been built to see. The model wasn't wrong. The *labels* were wrong. It had, in effect, pointed a blacklight at the company's own historical records and lit up fraud that had been sitting there invisibly the whole time.

We corrected those labels and retrained. On the corrected data, the model's ability to identify fraud jumped dramatically — fraud-class precision moved from the low single digits into the high nineties, with recall strong alongside it. Same model architecture. The only thing that changed was the quality of the labels underneath it.

That's the whole thesis of this project in one before-and-after: **no amount of modeling sophistication compensates for untrustworthy labels, and conversely, once the labels are right, even a straightforward model becomes powerful.** For a problem like fraud, building good data isn't the step before the real work. It *is* the real work.

---

## Part 4 — The modeling approach

With trustworthy ground truth in hand, our data science team led the machine learning development — from feature design through to the deployed model.

### The data was rare, and worse, unstable

Fraud was a tiny fraction of all trips — well under a tenth of a percent across a history of tens of millions of trips. And that rate wasn't stable; it swung substantially from month to month. A fraud model can't be tuned to a single assumed prevalence and trusted, because the target itself keeps moving.

Rather than guess, we ran the full pipeline at several different balances of fraud-to-legitimate trips in the training data, and — crucially — evaluated each one **out-of-time**: train on one period, then test on *later* months the model had never seen. This matters enormously for fraud. A random train/test split flatters the model, because patterns from the same period leak across the split. Testing on the future is the only honest measure of whether it will hold up in production.

That comparison surfaced a lesson worth its own paragraph. The most aggressive balance produced eye-catching detection numbers that collapsed the moment you looked at how many of its alerts were actually real — almost none were. It was flagging so indiscriminately that an operations team would drown, and the impressive-looking headline metric was meaningless. **This is exactly why you never read a single detection metric in isolation.** We chose the balance that most closely mirrored real-world fraud prevalence, because it was the only one whose numbers represented a genuine trade-off rather than a degenerate one — and, because it was trained close to the true rate, it generalized far more consistently across the out-of-time months instead of overfitting.

### Features that came from expertise, not guesswork

The model reads a rich set of signals per trip — spanning trip characteristics, behavioral patterns, geolocation consistency, account history, and relationships between the parties on a trip. I'll leave it at that level of description on purpose. What's worth saying is *where those features came from*: nearly every one of them traces back to something the manual fraud review surfaced. Domain expertise didn't just produce the labels — it told us what to look at. That's the part that's hard to replicate and easy to underrate.

### The model itself

**Gradient-boosted decision trees (XGBoost)**, inside a standard preprocessing pipeline, with hyperparameters tuned by randomized search and a training objective chosen to fit the operational reality — in a review-queue system, a missed fraud costs more than a false alarm a human dismisses in seconds. We evaluated class-imbalance techniques and kept only what actually helped. Throughout, we used SHAP to confirm the model's most influential signals matched fraud-analyst intuition rather than shipping a black box no one could interrogate.

### Ultravioleta versus the old heuristic

Re-run the old rule system against the same fully- and correctly-labeled month from the case study, and the contrast is stark. On ground truth good enough to judge it fairly, the old heuristic missed a large share of real fraud **and** generated false alarms on a scale no team could realistically work through. Ultravioleta caught meaningfully more of the real fraud while cutting the review load to something a small team could actually sustain — the exact combination instant payouts required. Its residual, un-caught losses in that month came in at a small fraction of the old system's.

---

## Part 5 — The end-to-end system: from notebook to live decisions

A fraud model in a notebook is a prototype. Turning it into something that decides on live trips, in real time, across a production platform is the other half of the job — and we took the model all the way there.

Here's the full path, end to end:

```
 Trip completes on the platform
              │
              ▼
 ┌─────────────────────────────────────────────┐
 │  AWS Lambda  (VPC-attached, app account)     │
 │  • pulls the account/trip history it needs    │
 │    from the data warehouse                    │
 │  • rebuilds the model's features live,        │
 │    in milliseconds                            │
 └─────────────────────────────────────────────┘
              │
              │  cross-account role assumption
              │  (STS, external-ID scoped)
              ▼
 ┌─────────────────────────────────────────────┐
 │  Amazon SageMaker real-time endpoint          │
 │  (separate, isolated ML account)              │
 │  • XGBoost container + custom inference        │
 │  • returns a fraud probability + a flag        │
 └─────────────────────────────────────────────┘
              │
              ▼
 ┌─────────────────────────────────────────────┐
 │  S3 audit log — every scored trip's inputs     │
 │  and prediction, for audit AND as fuel for     │
 │  the next round of relabeling + retraining     │
 └─────────────────────────────────────────────┘
```

A few decisions here are worth calling out, because they're the parts that don't show up in a demo but decide whether a system survives in production.

**Features are recomputed live, and identically to training.** When a trip completes, the function rebuilds the model's inputs in real time, per trip. Keeping training and serving logic consistent is one of the quiet ways ML systems fail; here it was a first-class concern.

**The model lives in its own AWS account.** We deliberately isolated the SageMaker endpoint in a separate account from the main application, reached through a scoped cross-account role assumption with an external ID and a resource policy that allowlists exactly the calling role. This keeps the ML infrastructure decoupled from the application's blast radius — at the very real cost of a great deal of IAM and networking work. If your model and the service calling it don't share a trust boundary, budget serious time for this. On our project it rivaled the machine learning itself.

**Everything is infrastructure-as-code.** The whole stack — the function, networking, the audit store, secrets management, the cross-account trust — is defined in AWS CDK (TypeScript), so the deployment is reviewable, repeatable, and auditable rather than a pile of console clicks no one can reconstruct.

**The loop closes.** That final audit log is the part people underestimate. Every scored trip becomes a new candidate for review, which feeds the next round of expert labeling, which improves the next model. It's the same discipline from Part 3, made continuous: production traffic constantly generates fresh cases, expert review keeps turning them into trustworthy labels, and the ground truth — the thing the whole system rests on — keeps getting better. Fraud detection isn't a model you ship once. It's a pipeline that has to keep learning, because the adversary keeps changing.

---

## What I'd take to the next one

If you're ever building a model on top of a system that is currently *generating* the very labels you'll train on, a few things from this project generalize:

- **Distrust your positive class — and distrust your negative class more.** If the incumbent detector is weak, its "confirmed clean" bucket is quietly full of the exact thing you're hunting. You won't know how badly until someone with real domain expertise goes and looks.
- **Always evaluate out-of-time.** A rare, adversarial, drifting target makes any random-split number look better than it deserves. Test on the future.
- **Watch for degenerate trade-offs, not headline metrics.** A model that appears to catch everything while flagging half the world isn't a good model; it's an unusable one. The only way to see that is to read your metrics together, never one at a time.
- **"Real-time" and "cross-account" are not free.** If the model and the app live in different trust boundaries, the networking and IAM work is a real, substantial part of the build — plan for it up front.

And the one that matters most, the one this whole project is really about:

> **A great model on bad data will faithfully reproduce your blind spots. Fix the data, and an ordinary model starts revealing things no one could see before.**

That's Ultravioleta. A blacklight for fraud that was always there — we just finally built something that could see it.

---

*Ultravioleta was a team effort — fraud-domain analysis and manual relabeling to give the project trustworthy ground truth, machine learning development, and deployment to production on AWS.*
