import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link 
          to="/" 
          className="font-serif text-xl tracking-tight hover:opacity-60 transition-opacity"
        >
          Alfredo Quintana
        </Link>
        
        <nav className="flex items-center gap-8">
          <Link 
            to="/" 
            className={`text-sm tracking-wide link-underline ${isActive('/') ? 'after:w-full' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/projects" 
            className={`text-sm tracking-wide link-underline ${isActive('/projects') ? 'after:w-full' : ''}`}
          >
            Projects
          </Link>
          <Link 
            to="/about" 
            className={`text-sm tracking-wide link-underline ${isActive('/about') ? 'after:w-full' : ''}`}
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
