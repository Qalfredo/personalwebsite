import Layout from "@/components/Layout";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/data/projects";
import { usePageMeta } from "@/lib/usePageMeta";

const Projects = () => {
  usePageMeta({
    title: "Projects & Writing — Alfredo Quintana",
    description:
      "Long-form write-ups on production ML and data engineering at marketplace scale — real-time fraud detection, self-hosted routing, and applied AI.",
    path: "/projects",
  });

  return (
    <Layout>
      <section className="container py-16 md:py-24">
        <div className="mb-12">
          <h1 
            className="font-serif text-4xl md:text-5xl mb-4 opacity-0 animate-fade-in"
            style={{ animationDelay: "0ms" }}
          >
            Projects
          </h1>
          <p 
            className="text-lg text-muted-foreground max-w-2xl opacity-0 animate-fade-in"
            style={{ animationDelay: "100ms" }}
          >
            Long-form write-ups on building production ML and data systems at
            marketplace scale — fraud, routing, and applied AI, with the messy parts
            left in.
          </p>
        </div>

        <div 
          className="opacity-0 animate-fade-in"
          style={{ animationDelay: "200ms" }}
        >
          {projects.map((project) => (
            <ProjectCard
              key={project.slug}
              slug={project.slug}
              title={project.title}
              excerpt={project.excerpt}
              date={project.date}
              category={project.category}
            />
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Projects;

