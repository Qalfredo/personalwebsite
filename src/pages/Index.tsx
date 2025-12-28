import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/data/projects";

const Index = () => {
  const recentProjects = projects.slice(0, 3);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="max-w-3xl">
          <h1 
            className="font-serif text-5xl md:text-7xl leading-[1.1] mb-8 opacity-0 animate-fade-in"
            style={{ animationDelay: "0ms" }}
          >
            Alfredo Quintana
          </h1>
        <p 
          className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8 opacity-0 animate-fade-in"
          style={{ animationDelay: "100ms" }}
        >
          Data professional turning complex information into actionable insights. 
          I build data systems, explore AI applications, and write about the evolving 
          landscape of analytics and machine learning.
        </p>
          <div 
            className="flex items-center gap-6 opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            <Link 
              to="/projects" 
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-80 transition-opacity"
            >
              View my projects
              <span aria-hidden>→</span>
            </Link>
            <Link 
              to="/about" 
              className="text-sm link-underline"
            >
              Learn more about me
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container">
        <div className="border-t border-border" />
      </div>

      {/* Recent Projects */}
      <section className="container py-16 md:py-24">
        <div 
          className="flex items-center justify-between mb-12 opacity-0 animate-fade-in"
          style={{ animationDelay: "300ms" }}
        >
          <h2 className="font-serif text-3xl md:text-4xl">Recent Projects</h2>
          <Link to="/projects" className="text-sm link-underline text-muted-foreground">
            View all →
          </Link>
        </div>
        <div 
          className="opacity-0 animate-fade-in"
          style={{ animationDelay: "400ms" }}
        >
          {recentProjects.map((project) => (
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

      {/* CTA Section */}
      <section className="container py-16 md:py-24">
        <div 
          className="border border-border p-8 md:p-12 text-center opacity-0 animate-fade-in"
          style={{ animationDelay: "500ms" }}
        >
          <h2 className="font-serif text-2xl md:text-3xl mb-4">Let's connect</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            I'm always interested in thoughtful conversations about ideas, 
            projects, and collaboration.
          </p>
          <a 
            href="mailto:alfredo.quintana.14@gmail.com" 
            className="inline-flex items-center gap-2 text-sm link-underline"
          >
            alfredo.quintana.14@gmail.com
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
