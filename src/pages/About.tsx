import Layout from "@/components/Layout";
import Experience from "@/components/Experience";
import { usePageMeta } from "@/lib/usePageMeta";

const About = () => {
  usePageMeta({
    title: "About — Alfredo Quintana",
    description:
      "Senior ML & Data Engineer. I built the data function at Ridery (0→8), replaced Google Maps routing for $800K+/year, shipped a real-time fraud system, and now lead engineering on Ridery Pay. B.Sc. Mathematics; 4+ years teaching data science.",
    path: "/about",
  });

  return (
    <Layout>
      <section className="container py-16 md:py-24 max-w-3xl">
        <h1
          className="font-serif text-4xl md:text-5xl mb-8 opacity-0 animate-fade-in"
          style={{ animationDelay: "0ms" }}
        >
          About
        </h1>

        <div
          className="space-y-6 text-lg text-foreground/80 leading-relaxed opacity-0 animate-fade-in"
          style={{ animationDelay: "100ms" }}
        >
          <p>
            I'm Alfredo Quintana — a Senior ML &amp; Data Engineer working at the
            intersection of data engineering, machine learning, and applied AI.
          </p>

          <p>
            For the past few years I've built the data function at{" "}
            <strong className="font-semibold text-foreground">Ridery</strong>, a Latin
            American ride-hailing marketplace doing millions of trips. I founded and led
            its data team (<strong className="font-semibold text-foreground">0→8 people</strong>),
            built the pipelines behind it (Airflow / Redshift / MongoDB, 10+ sources,
            millions of records/hour), and replaced Google Maps' routing and autocomplete
            with custom systems that saved{" "}
            <strong className="font-semibold text-foreground">$800K+ a year</strong>. With
            the team I shipped <strong className="font-semibold text-foreground">Ultravioleta</strong>,
            a real-time fraud-detection system that scores every trip. Today I'm{" "}
            <strong className="font-semibold text-foreground">technical lead of Ridery Pay</strong>,
            the company's fintech — where I own the full-stack build and ship applied-AI
            features like camera-to-payment extraction and an MCP server that lets AI agents
            initiate payments safely.
          </p>

          <p>
            I hold a{" "}
            <strong className="font-semibold text-foreground">B.Sc. in Mathematics</strong>{" "}
            (Universidad Central de Venezuela) and taught data science there for{" "}
            <strong className="font-semibold text-foreground">4+ years</strong> — I care as
            much about explaining a system clearly as about building it.
          </p>
        </div>

        <div
          className="mt-12 pt-8 border-t border-border opacity-0 animate-fade-in"
          style={{ animationDelay: "200ms" }}
        >
          <h2 className="font-serif text-2xl mb-6">Currently</h2>
          <ul className="space-y-3 text-foreground/80">
            <li className="flex items-start gap-3">
              <span className="text-muted-foreground">→</span>
              <span>
                Technical lead of <strong className="font-medium text-foreground">Ridery Pay</strong> —
                a wallet + BNPL fintech (React + Python full-stack).
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-muted-foreground">→</span>
              <span>
                Building a <strong className="font-medium text-foreground">RAG customer-support agent</strong>{" "}
                (LangChain / LangGraph, hybrid search + reranking) over WhatsApp and SMS.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-muted-foreground">→</span>
              <span>
                Shipping applied-LLM features: <strong className="font-medium text-foreground">Foto Pago</strong>{" "}
                (Gemini vision → payment) and an <strong className="font-medium text-foreground">MCP payments server</strong>.
              </span>
            </li>
          </ul>
        </div>

        <div
          className="mt-12 pt-8 border-t border-border opacity-0 animate-fade-in"
          style={{ animationDelay: "300ms" }}
        >
          <h2 className="font-serif text-2xl mb-6">Experience</h2>
          <Experience />
        </div>

        <div
          className="mt-12 pt-8 border-t border-border opacity-0 animate-fade-in"
          style={{ animationDelay: "400ms" }}
        >
          <h2 className="font-serif text-2xl mb-6">Get in Touch</h2>
          <p className="text-foreground/80 mb-6">
            I'm always open to interesting conversations and collaborations.
          </p>
          <div className="space-y-3">
            <a
              href="mailto:alfredo.quintana.14@gmail.com"
              className="block text-foreground link-underline w-fit"
            >
              alfredo.quintana.14@gmail.com
            </a>
            <a
              href="https://x.com/qalfredoai"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-muted-foreground link-underline w-fit"
            >
              X
            </a>
            <a
              href="https://github.com/Qalfredo"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-muted-foreground link-underline w-fit"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/alfredoquintana/"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-muted-foreground link-underline w-fit"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
