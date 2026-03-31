> **Attribution note:** OSRM (Project-OSRM/osrm-backend) is an open-source routing engine written in C++ by 180+ contributors, originally developed at the University of Karlsruhe. This article documents the production deployment, data pipeline, Python client, and cost analysis, not the routing engine itself. All routing engine code belongs to the Project-OSRM contributors (BSD-2-Clause license). If this article sends a few more stars to their repo, that's the best possible outcome.

---

## Section 1: The API Bill That Couldn't Scale

Google Maps Distance Matrix API pricing is straightforward: $5.00 per 1,000 elements. For low-volume use cases, it barely registers. For a ride-hailing company running millions of distance matrix requests every month, it becomes one of the most expensive line items in your infrastructure budget.

At Ridery, a ride-hailing platform operating in Venezuela, every dispatch decision requires a distance matrix call. Every time the system evaluates which available driver is closest to a rider, that's a matrix call. Every time it estimates arrival times across a set of candidates, that's a matrix call. At scale, these calls accumulate fast, and Google Maps charges every single one.

The moment we looked closely at the bill, the question was obvious: is there a production-grade open-source alternative that can handle this volume?

The answer turned out to be yes. And it had been sitting on GitHub for years with 7.5k stars.

## Section 2: What is OSRM?

OSRM stands for Open Source Routing Machine. The project lives at [github.com/Project-OSRM/osrm-backend](https://github.com/Project-OSRM/osrm-backend). It is written in C++ and maintained by 180+ contributors, with roots in research from the University of Karlsruhe. Mapbox and several major logistics companies run it in production.

**To be explicit:** we did not write OSRM. We deployed it, integrated it, and benchmarked it for our specific context. All credit to the Project-OSRM contributors.

What OSRM provides:

- A clean HTTP API with exactly the endpoints a ride-hailing system needs: `/table` (distance matrix), `/route` (turn-by-turn routing), `/nearest` (coordinate snapping), `/match` (GPS trace matching)
- Road network data sourced entirely from OpenStreetMap, free, global, community-maintained, and available for every country on Earth via [Geofabrik](https://download.geofabrik.de/)
- Official Docker images at `ghcr.io/project-osrm/osrm-backend`, actively maintained by the project

**Two preprocessing pipelines:**

- **Contraction Hierarchies (CH)**, `osrm-contract`. Faster at query time. Recommended by the OSRM documentation for distance matrix workloads.
- **Multi-Level Dijkstra (MLD)**, `osrm-partition` + `osrm-customize`. More flexible, supports live traffic updates, but slightly slower per query.

For our use case, a high-volume distance matrix service, we use CH. The official OSRM README explicitly recommends this choice, and the performance difference at query time is significant.

## Section 3: Road Networks as Graphs, The Math

This section is the reason engineers outside ride-hailing will find this article interesting. Most tutorials treat OSRM as a black box. Understanding the algorithm explains *why* it can answer routing queries faster than any external API, and why choosing CH over MLD is not arbitrary.

### The Graph Model

A road network is a directed weighted graph:

`G = (V, E, w)`

Where:

- **V** = intersections (nodes)
- **E ⊆ V × V** = road segments (directed edges)
- **w: E → R+** = edge weight, travel time in seconds

Roads are directed because one-way streets and turn restrictions exist everywhere. Edge weights encode speed limits and turn penalties from the `car.lua` routing profile, not just straight-line distance. The shortest-path problem: given source *s* and target *t*, find the path that minimizes total travel time.

### Dijkstra's Algorithm

Dijkstra's algorithm (1959) solves this using a min-heap priority queue:

```text
dist[s] <- 0;  dist[v] <- infinity  for all v != s
push (0, s) onto priority queue

while queue is not empty:
    (d, u) <- pop minimum
    if u already settled: skip
    mark u settled
    for each neighbour v:
        if dist[u] + w(u,v) < dist[v]:
            dist[v] <- dist[u] + w(u,v)
            push (dist[v], v)
```

Time complexity: **O((V+E) log V)**. Each node and edge is processed once; the log factor comes from the heap. This is elegant and correct.

[IMAGE: Dijkstra step-by-step visualization on toy graph from notebook 02_osrm_math_graphs.ipynb]

### The Scale Problem

Venezuela's road network, extracted from OpenStreetMap, contains millions of nodes and edges. At that scale, a single Dijkstra query takes seconds. A distance matrix, N origins x M destinations, requires N separate Dijkstra runs. For millions of matrix elements per month, this is not remotely acceptable for real-time dispatch.

This is the gap Contraction Hierarchies fill.

## Section 4: Contraction Hierarchies, Why Queries Are Fast

This is the core technical contribution of the article. No one explains CH well online. This is what gets it shared.

The Contraction Hierarchies algorithm was introduced by Geisberger, Sanders, Schultes, and Delling in 2008 (*Contraction Hierarchies: Faster and Simpler Hierarchical Routing in Road Networks*, WEA 2008). OSRM implements it directly. What follows is an accessible walkthrough, not a re-implementation.

### The Core Insight: Not All Intersections Are Equal

A rural cul-de-sac with two road connections matters much less than a highway interchange connecting six major routes. CH exploits this by assigning an *importance* rank to every node in the graph, then preprocessing the graph in order of importance.

**Node importance** is measured by several factors from the original paper:

- **Edge difference**: how many shortcut edges need to be added when this node is removed, minus the edges removed. Nodes that require few shortcuts are cheapest to contract.
- **Deleted neighbors**: nodes surrounded by already-contracted nodes are prioritized.
- **Search space size**: the size of the local Dijkstra search needed to verify shortcuts.

### Node Contraction

Contraction means removing a node from the graph. When node *v* is contracted:

For every pair *(u, w)* where the shortest path u -> w passes through v: add a shortcut edge u -> w with weight = w(u,v) + w(v,w).

This preserves all shortest paths in the reduced graph. Nodes that happen to be on few shortest paths require very few shortcuts. Major highway interchanges require many.

[IMAGE: Before/after contraction, toy graph before and after removing a low-importance node from notebook 02_osrm_math_graphs.ipynb]

### Building the Hierarchy

After contracting all nodes in order of importance, each node has a rank (its contraction order). Low-ranked nodes are local streets. High-ranked nodes are major highways.

### Query Time: Bidirectional Dijkstra Upward

With the hierarchy built, queries become extremely efficient:

Run **bidirectional Dijkstra** from source and target simultaneously, but each side only relaxes edges going **upward** in the hierarchy (to higher-ranked nodes). The two frontier searches meet somewhere near the top of the hierarchy.

Instead of exploring millions of nodes, each query touches only a few hundred. Result: **under 1 millisecond per query**, regardless of country size.

The `02_osrm_math_graphs.ipynb` notebook in the repo walks through this entire algorithm with NetworkX visualizations, building the toy graph, running Dijkstra step-by-step, contracting nodes one by one, and finally showing the CH query on the resulting hierarchy.

**Attribution again, because it matters:** This is what the Project-OSRM team built and what their C++ implementation runs at production scale. The notebook is a pedagogical walkthrough. If you want to understand the algorithm in detail, read the original Geisberger et al. paper, it is linked in the repo README.

## Section 5: Deployment Walkthrough, What We Actually Did

Here is the exact pipeline we run in production, documented in `01_local_deploy_walkthrough.md` and `04_aws_deploy_walkthrough.md` in the repo.

### Step 1: Download OSM Data

```bash
curl -L -o data/venezuela-latest.osm.pbf \
  https://download.geofabrik.de/south-america/venezuela-latest.osm.pbf
```

Geofabrik provides free country-level OpenStreetMap extracts, updated daily. Venezuela is ~107 MB. This is the only data source. No licensing fees, no usage quotas.

### Step 2: Extract the Road Graph

```bash
docker run --rm \
  -v "$(pwd)/data:/data" \
  ghcr.io/project-osrm/osrm-backend:latest \
  osrm-extract -p /opt/car.lua /data/venezuela-latest.osm.pbf
```

`osrm-extract` parses the `.pbf` file and builds OSRM's internal graph representation. The `car.lua` profile (bundled in the Docker image) encodes speed limits, turn penalties, and access rules for motor vehicles. Runtime for Venezuela: 2 to 5 minutes.

### Step 3: Build the Contraction Hierarchy

```bash
docker run --rm \
  -v "$(pwd)/data:/data" \
  ghcr.io/project-osrm/osrm-backend:latest \
  osrm-contract /data/venezuela-latest.osrm
```

This is the slow step, 20 to 60 minutes for Venezuela. It runs completely offline. The result is `venezuela-latest.osrm.hsgr`, the contracted graph. Once built, it never needs to be rebuilt unless OSM data is refreshed.

### Step 4: Start the HTTP API

Using Docker Compose (from `docker/docker-compose.yml`):

```yaml
services:
  osrm:
    image: ghcr.io/project-osrm/osrm-backend:latest
    container_name: osrm-routed
    command: osrm-routed --algorithm ch /data/venezuela-latest.osrm
    ports:
      - "5001:5000"
    volumes:
      - ../data:/data
    restart: unless-stopped
    mem_limit: 4g
```

```bash
docker-compose -f docker/docker-compose.yml up -d
```

OSRM is now serving on port 5001. The CH graph loads into memory (~2.5 to 3 GB for Venezuela) and stays there.

### Step 5: The Python Client

`client/osrm_client.py` wraps the three OSRM endpoints used in production:

```python
from client import OSRMClient

client = OSRMClient("http://localhost:5001")

# Distance matrix, this is the direct replacement for Google Maps Distance Matrix API
locations = [
    (10.4806, -66.9036),  # Caracas
    (10.1620, -67.9936),  # Valencia
    (10.2469, -67.5958),  # Maracay
]

distances, durations = client.distance_matrix(locations)
# distances: numpy array, shape (N, N), metres
# durations: numpy array, shape (N, N), seconds

print((distances / 1000).round(1))   # km
print((durations / 60).round(1))     # minutes
```

The key design detail: OSRM's HTTP API uses `(longitude, latitude)` order, the opposite of the common `(lat, lon)` convention. The `OSRMClient` accepts `(lat, lon)` tuples and handles the swap internally. This is the most common source of silent errors when calling OSRM directly.

### Memory Note (Not in the Official Docs)

Venezuela's `.osm.pbf` is 107 MB. But `osrm-routed` needs ~2.5 to 3 GB of RAM to start, because it memory-maps the preprocessed Contraction Hierarchy graph, which is significantly larger than the raw input file.

A `t3.medium` (4 GB RAM, ~$33/month on AWS on-demand) is the minimum viable instance. Trying to run this on 2 GB will fail, often silently. Size your instance before deploying to production.

## Section 6: Benchmark Results

The `03_distance_comparison.ipynb` notebook in the repo runs OSRM and Google Maps Distance Matrix against the same set of Caracas locations, commercial centers, hospitals, and landmarks, and compares both cost and routing accuracy.

### Cost Comparison

| Metric | Google Maps API | OSRM (self-hosted) |
| --- | --- | --- |
| Cost per 1,000 elements | $5.00 | ~$0.03 (infra only) |
| Rate limits | Yes (quotas) | None |
| Data ownership | No | Yes, stays on your infra |
| Live traffic | Yes | No (static OSM) |

For our deployment at Ridery: after migrating to OSRM in early 2023, Google Maps Distance Matrix costs dropped by ~99%. The infrastructure to run it, a single `t3.medium` EC2 instance, costs less than 1% of what we were paying the API.

The remaining Google Maps spend covers geocoding, map tiles, and other services OSRM does not replace. For those, the API still makes sense. For distance matrices at scale, OSRM is in a completely different cost category.

### Accuracy

Comparing OSRM and Google Maps routing outputs on Caracas test pairs: route distances are closely correlated. The main difference is that Google Maps incorporates live traffic data, while OSRM uses static road speeds from OSM. For trip dispatch, where you need relative travel time comparisons rather than absolute real-time ETAs, OSRM's static estimates are more than sufficient.

For real-time ETA display to riders, a small traffic adjustment layer on top of OSRM estimates is worth considering. For the core dispatch optimization problem, static routing is the right tool.

## Section 7: Limitations and When to Keep Google Maps

This section is what makes the article trustworthy. OSRM is excellent for specific use cases and wrong for others. Do not oversell it.

**OSM data quality varies by region.** In Venezuela, coverage is good for Caracas and major cities. Rural areas can be sparse or outdated. If your use case extends to remote areas, verify OSM coverage before switching.

**No live traffic.** OSRM uses static road speeds from OSM tags. It cannot account for accidents, construction, or rush-hour congestion in real time. For applications where live traffic awareness is critical, consumer navigation and real-time ETA for riders on-screen, OSRM alone is insufficient. Options: OSRM with custom speed profiles updated from traffic data, or a different engine (Valhalla, GraphHopper).

**Requires operational overhead.** OSRM needs a server, monitoring, and a data refresh pipeline. For very low query volumes, where the Google Maps free tier covers your usage, adding a self-hosted service is not worth the engineering cost.

**OSM data needs periodic re-extraction.** As OpenStreetMap contributors update road data, OSRM's graph goes stale. The `data/download_and_preprocess.sh` script and the update procedure in `docs/architecture.md` make this straightforward, but it needs to be scheduled. We run a monthly refresh for Venezuela.

**The anomaly window.** During periods when OSRM was unavailable (server issues, updates), our system fell back to Google Maps automatically. These windows are visible in our usage data as cost spikes. Lesson: monitor your OSRM deployment. Add a health check and a fallback for when it is unreachable.

**What Google Maps still wins on:** Geocoding, places search, map tiles, live navigation UI. OSRM does none of these. It does one thing, routing and distance matrices, and it does that extremely well.

## Section 8: Conclusion and Resources

Three things you can take from this:

**The cost reduction is real and dramatic.** Google Maps Distance Matrix is the right tool for low-volume use cases. At scale, millions of queries per month, self-hosting OSRM reduces costs by ~99%. The infrastructure that replaces it fits on a small cloud instance.

**Data ownership matters.** Every Google Maps API call sends your users' location data to Google's servers. With OSRM, all trip coordinates stay on your infrastructure. For a ride-hailing company in a market with data sensitivity concerns, this is not a small consideration.

**The math is beautiful and worth understanding.** Contraction Hierarchies is one of those algorithms where the idea is simple enough to explain in a whiteboard session but powerful enough to make country-scale routing viable in real time. If you deploy OSRM and understand what `osrm-contract` is actually doing, you will make better decisions about pipeline choice, instance sizing, and data freshness.

**None of this would be possible without the Project-OSRM contributors.** The routing engine, the Docker images, the `car.lua` profile, the API design, all of it comes from 180+ engineers who built and maintained this as open-source software. [Star their repo](https://github.com/Project-OSRM/osrm-backend). It is one of the most useful pieces of open-source infrastructure in the logistics and mobility space.

### Companion resources

- **GitHub repo:** [github.com/Qalfredo/osrm-production-deploy-and-math](https://github.com/Qalfredo/osrm-production-deploy-and-math), the complete deployment setup: Docker Compose, data pipeline, Python client, and both Jupyter notebooks. If you want to deploy OSRM for your own region, the only thing you need to change is the Geofabrik download URL. Every country has an extract.
- **Notebook 01:** `01_local_deploy_walkthrough.md`, full local deployment guide, step-by-step
- **Notebook 02:** `02_osrm_math_graphs.ipynb`, Dijkstra and Contraction Hierarchies, visualized with NetworkX
- **Notebook 03:** `03_distance_comparison.ipynb`, OSRM vs Google Maps, accuracy and cost side-by-side
- **Notebook 04:** `04_aws_deploy_walkthrough.md`, single-instance EC2 deployment using AWS CLI

*What's next: a comparison of OSRM, Valhalla, and GraphHopper, when to use each engine. Or: incorporating live traffic data into OSRM routing using custom speed profiles.*
