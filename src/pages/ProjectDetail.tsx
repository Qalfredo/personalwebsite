import { useParams, Link, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { getProjectBySlug } from "@/data/projects";

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? getProjectBySlug(slug) : undefined;

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <Layout>
      <article className="container py-16 md:py-24 max-w-3xl">
        <Link 
          to="/projects" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground link-underline mb-8 opacity-0 animate-fade-in"
          style={{ animationDelay: "0ms" }}
        >
          ← Back to projects
        </Link>

        <header 
          className="mb-12 opacity-0 animate-fade-in"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="uppercase tracking-wider text-xs">{project.category}</span>
            <span>·</span>
            <time>{project.date}</time>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl leading-tight">
            {project.title}
          </h1>
        </header>

        <div 
          className="prose prose-lg max-w-none opacity-0 animate-fade-in"
          style={{ animationDelay: "200ms" }}
        >
          {project.content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={index} className="font-serif text-2xl md:text-3xl mt-12 mb-6">
                  {paragraph.replace('## ', '')}
                </h2>
              );
            }
            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
              return null;
            }
            if (paragraph.startsWith('- ')) {
              const items = paragraph.split('\n').filter(item => item.startsWith('- '));
              return (
                <ul key={index} className="my-6 space-y-2">
                  {items.map((item, i) => (
                    <li key={i} className="text-foreground/80 leading-relaxed pl-4 border-l-2 border-border">
                      {item.replace('- ', '')}
                    </li>
                  ))}
                </ul>
              );
            }
            if (paragraph.startsWith('**')) {
              const match = paragraph.match(/\*\*(.+?)\*\*(.+)/);
              if (match) {
                return (
                  <p key={index} className="text-foreground/80 leading-relaxed my-4">
                    <strong className="text-foreground">{match[1]}</strong>
                    {match[2]}
                  </p>
                );
              }
            }
            if (paragraph.trim()) {
              return (
                <p key={index} className="text-foreground/80 leading-relaxed my-4">
                  {paragraph}
                </p>
              );
            }
            return null;
          })}
        </div>

        <footer 
          className="mt-16 pt-8 border-t border-border opacity-0 animate-fade-in"
          style={{ animationDelay: "300ms" }}
        >
          <p className="text-sm text-muted-foreground">
            Thanks for reading. Feel free to{" "}
            <a href="mailto:alfredo.quintana.14@gmail.com" className="link-underline">
              reach out
            </a>{" "}
            if you'd like to discuss this piece.
          </p>
        </footer>
      </article>
    </Layout>
  );
};

export default ProjectDetail;

