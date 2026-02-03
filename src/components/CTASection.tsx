import { Button } from "./ui/button";
import { Mail, Phone, ExternalLink } from "lucide-react";

const CTASection = () => {
  return (
    <section id="contact" className="py-20 lg:py-32 hero-gradient relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Ready to Transform Your
            <span className="text-gradient block mt-2">Recruitment Strategy?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Let's discuss how Kicker Video can help your department attract the next 
            generation of law enforcement professionals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="hero" size="xl" asChild>
              <a href="mailto:hello@kickervideo.com">
                <Mail className="w-5 h-5" />
                Contact Us
              </a>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <a href="https://kickervideo.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-5 h-5" />
                Visit Website
              </a>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-muted-foreground">
            <a 
              href="mailto:hello@kickervideo.com" 
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <Mail className="w-4 h-4" />
              hello@kickervideo.com
            </a>
            <span className="hidden sm:block text-border">|</span>
            <a 
              href="https://kickervideo.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              kickervideo.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
