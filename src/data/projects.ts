export interface Project {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
}

export const projects: Project[] = [
  {
    slug: "practical-llm-applications",
    title: "Practical LLM Applications Beyond Chatbots",
    excerpt: "Moving past the hype to explore where large language models actually deliver value in data workflows.",
    content: `
The discourse around LLMs often oscillates between unbounded hype and dismissive skepticism. The reality, as usual, is more nuanced.

After a year of integrating LLMs into various data workflows, I've developed a clearer picture of where they shine and where they struggle.

## Where LLMs Excel

**Unstructured to Structured**: Extracting structured data from messy text—emails, documents, logs—is where LLMs provide immediate value. Tasks that would require complex regex or custom NLP now take a well-crafted prompt.

**Data Quality Narratives**: Generating human-readable summaries of data quality issues. Instead of a dashboard of numbers, stakeholders get context.

**Code Generation for Analytics**: Not replacing analysts, but accelerating them. SQL generation, pandas transformations, visualization code—LLMs as pair programmers.

## Where They Struggle

- Anything requiring precise numerical computation
- Tasks needing consistent, deterministic outputs
- Situations where hallucination risk is unacceptable

## The Integration Challenge

The technical implementation is often the easy part. The harder questions are organizational: How do you validate LLM outputs at scale? How do you handle the probabilistic nature of responses in systems that expect determinism?

These are the problems worth solving.
    `,
    date: "November 2024",
    category: "AI",
  },
];

export const getProjectBySlug = (slug: string): Project | undefined => {
  return projects.find((p) => p.slug === slug);
};

