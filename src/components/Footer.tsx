const Footer = () => {
  return (
    <footer className="py-8 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-display font-bold text-lg text-primary-foreground">K</span>
            </div>
            <span className="font-display text-xl font-semibold text-foreground">
              Kicker<span className="text-primary">Video</span>
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Kicker Video. Professional video production.
          </p>

          <a 
            href="https://kickervideo.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            kickervideo.com
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
