import { Fragment, type ReactNode } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { getProjectBySlug } from "@/data/projects";

const INLINE_PATTERN =
  /(\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;

const renderInline = (text: string): ReactNode[] => {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(INLINE_PATTERN)) {
    const index = match.index ?? 0;

    if (index > lastIndex) {
      nodes.push(text.slice(lastIndex, index));
    }

    if (match[2] && match[3]) {
      nodes.push(
        <a
          key={`link-${index}`}
          href={match[3]}
          target="_blank"
          rel="noreferrer"
          className="text-foreground underline underline-offset-4"
        >
          {match[2]}
        </a>,
      );
    } else if (match[4]) {
      nodes.push(
        <code
          key={`code-${index}`}
          className="rounded bg-secondary px-1.5 py-0.5 text-[0.9em] text-foreground"
        >
          {match[4]}
        </code>,
      );
    } else if (match[5]) {
      nodes.push(
        <strong key={`strong-${index}`} className="font-semibold text-foreground">
          {match[5]}
        </strong>,
      );
    } else if (match[6]) {
      nodes.push(
        <em key={`em-${index}`} className="italic">
          {match[6]}
        </em>,
      );
    }

    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
};

const isTableSeparator = (line: string) =>
  /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?\s*$/.test(line);

const parseTableRow = (line: string) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

const isSpecialBlockStart = (line: string, nextLine?: string) => {
  const trimmed = line.trim();

  return (
    trimmed === "" ||
    trimmed.startsWith("```") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith(">") ||
    trimmed.startsWith("- ") ||
    trimmed.startsWith("[IMAGE:") ||
    /^---+$/.test(trimmed) ||
    (trimmed.includes("|") && Boolean(nextLine && isTableSeparator(nextLine)))
  );
};

const renderMarkdown = (content: string) => {
  const lines = content.trim().split("\n");
  const nodes: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }

      index += 1;
      nodes.push(
        <pre
          key={`codeblock-${index}`}
          className="my-8 overflow-x-auto border border-border bg-secondary/60 p-4 text-sm leading-relaxed text-foreground"
        >
          <code data-language={language || undefined}>{codeLines.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    if (trimmed.startsWith("[IMAGE:") && trimmed.endsWith("]")) {
      nodes.push(
        <aside
          key={`image-${index}`}
          className="my-8 border border-dashed border-border bg-secondary/40 p-4 text-sm text-muted-foreground"
        >
          {trimmed.slice(1, -1)}
        </aside>,
      );
      index += 1;
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      nodes.push(<hr key={`hr-${index}`} className="my-10 border-border" />);
      index += 1;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{2,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];

      if (level === 2) {
        nodes.push(
          <h2 key={`h2-${index}`} className="mt-14 font-serif text-2xl leading-tight md:text-3xl">
            {renderInline(text)}
          </h2>,
        );
      } else {
        nodes.push(
          <h3 key={`h3-${index}`} className="mt-10 font-serif text-xl leading-tight md:text-2xl">
            {renderInline(text)}
          </h3>,
        );
      }

      index += 1;
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];

      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }

      nodes.push(
        <blockquote
          key={`quote-${index}`}
          className="my-8 border-l-2 border-foreground pl-5 text-foreground/80"
        >
          <p className="leading-relaxed">{renderInline(quoteLines.join(" "))}</p>
        </blockquote>,
      );
      continue;
    }

    if (trimmed.startsWith("- ")) {
      const items: string[] = [];

      while (index < lines.length && lines[index].trim().startsWith("- ")) {
        items.push(lines[index].trim().slice(2));
        index += 1;
      }

      nodes.push(
        <ul key={`list-${index}`} className="my-6 space-y-3">
          {items.map((item, itemIndex) => (
            <li key={`item-${itemIndex}`} className="border-l-2 border-border pl-4 leading-relaxed text-foreground/80">
              {renderInline(item)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (trimmed.includes("|") && isTableSeparator(lines[index + 1] ?? "")) {
      const header = parseTableRow(lines[index]);
      index += 2;
      const rows: string[][] = [];

      while (index < lines.length && lines[index].includes("|")) {
        rows.push(parseTableRow(lines[index]));
        index += 1;
      }

      nodes.push(
        <div key={`table-${index}`} className="my-8 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                {header.map((cell, cellIndex) => (
                  <th key={`head-${cellIndex}`} className="px-3 py-3 font-medium text-foreground">
                    {renderInline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`} className="border-b border-border/70 align-top">
                  {row.map((cell, cellIndex) => (
                    <td key={`cell-${rowIndex}-${cellIndex}`} className="px-3 py-3 text-foreground/80">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    const paragraphLines = [trimmed];
    index += 1;

    while (index < lines.length && !isSpecialBlockStart(lines[index], lines[index + 1])) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    const paragraphText = paragraphLines.join(" ");
    const isStandaloneEmphasis =
      /^\*(?!\*)(.+)\*$/.test(paragraphText) && !paragraphText.includes("**");

    nodes.push(
      <p
        key={`paragraph-${index}`}
        className={isStandaloneEmphasis ? "my-6 italic text-muted-foreground" : "my-5 leading-relaxed text-foreground/80"}
      >
        {renderInline(paragraphText)}
      </p>,
    );
  }

  return nodes;
};

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
          className="max-w-none opacity-0 animate-fade-in"
          style={{ animationDelay: "200ms" }}
        >
          {renderMarkdown(project.content).map((node, nodeIndex) => (
            <Fragment key={nodeIndex}>{node}</Fragment>
          ))}
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
