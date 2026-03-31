const Footer = () => {
  return (
    <footer className="border-t border-border py-12 mt-24">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Alfredo Quintana</p>
          <div className="flex items-center gap-6">
            <a 
              href="https://x.com/alfredoq14" 
              target="_blank" 
              rel="noopener noreferrer"
              className="link-underline"
            >
              X
            </a>
            <a 
              href="https://github.com/Qalfredo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="link-underline"
            >
              GitHub
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="link-underline"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
