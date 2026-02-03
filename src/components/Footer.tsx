import kickerLogo from "@/assets/kicker-logo.png";

const Footer = () => {
  return (
    <footer className="py-8 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <img src={kickerLogo} alt="Kicker Video" className="h-6" />

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
