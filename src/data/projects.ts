import ultravioletaArticle from "@/content/ultravioleta-fraud-detection.md?raw";
import osrmProductionArticle from "@/content/osrm-production-deployment.md?raw";

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
    slug: "ultravioleta-fraud-detection",
    title: "Ultravioleta: Making Invisible Fraud Visible",
    excerpt:
      "How our team replaced a brittle rule-based heuristic with a real-time machine learning system at Ridery — and why the hardest part was never the model.",
    content: ultravioletaArticle,
    date: "August 2026",
    category: "Machine Learning",
  },
  {
    slug: "osrm-production-deployment",
    title: "How We Cut Routing Costs by ~99% by Deploying OSRM",
    excerpt:
      "A production guide to replacing Google Maps Distance Matrix with a self-hosted OSRM stack for ride-hailing workloads at scale.",
    content: osrmProductionArticle,
    date: "March 2026",
    category: "Data Engineering",
  },
];

export const getProjectBySlug = (slug: string): Project | undefined => {
  return projects.find((p) => p.slug === slug);
};
