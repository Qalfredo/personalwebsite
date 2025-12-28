import Layout from "@/components/Layout";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/data/projects";

const Projects = () => {
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
            Essays, articles, and notes on technology, design, and the ideas 
            that shape how we build and think.
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

