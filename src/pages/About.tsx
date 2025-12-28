import Layout from "@/components/Layout";

const About = () => {
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
            I'm Alfredo Quintana—a data professional passionate about transforming raw 
            information into meaningful insights. I work at the intersection of data 
            engineering, analytics, and artificial intelligence.
          </p>

          <p>
            My expertise spans building robust data pipelines, developing machine learning 
            models, and creating visualization systems that make complex data accessible. 
            I believe the best data work combines technical rigor with clear communication.
          </p>

          <p>
            This site is where I share projects, write about data and AI, and connect 
            with others who are navigating this rapidly evolving field.
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
              <span>Building data infrastructure and ML pipelines</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-muted-foreground">→</span>
              <span>Exploring practical applications of LLMs and AI agents</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-muted-foreground">→</span>
              <span>Writing about the craft of working with data</span>
            </li>
          </ul>
        </div>

        <div 
          className="mt-12 pt-8 border-t border-border opacity-0 animate-fade-in"
          style={{ animationDelay: "300ms" }}
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
              href="https://twitter.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="block text-muted-foreground link-underline w-fit"
            >
              Twitter
            </a>
            <a 
              href="https://github.com" 
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
