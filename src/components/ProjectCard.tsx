import { Link } from "react-router-dom";

interface ProjectCardProps {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
}

const ProjectCard = ({ slug, title, excerpt, date, category }: ProjectCardProps) => {
  return (
    <Link 
      to={`/projects/${slug}`}
      className="group block py-8 border-b border-border last:border-b-0 transition-colors hover:bg-secondary/50 -mx-4 px-4"
    >
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        <span className="uppercase tracking-wider text-xs">{category}</span>
        <span>·</span>
        <time>{date}</time>
      </div>
      <h3 className="font-serif text-2xl md:text-3xl mb-3 group-hover:underline underline-offset-4">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed max-w-2xl">
        {excerpt}
      </p>
    </Link>
  );
};

export default ProjectCard;

