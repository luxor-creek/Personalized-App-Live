import { Video, Award, Users, Zap } from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Cinematic Quality",
    description: "Hollywood-grade production value that sets your department apart from the competition."
  },
  {
    icon: Users,
    title: "Authentic Stories",
    description: "We capture the real stories of your officers, building genuine connection with candidates."
  },
  {
    icon: Award,
    title: "Proven Results",
    description: "Our clients see significant increases in qualified applicants within the first month."
  },
  {
    icon: Zap,
    title: "Fast Turnaround",
    description: "From concept to final cut in weeks, not months. We respect your timeline."
  }
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 lg:py-32 bg-card relative">
      {/* Accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-primary rounded-full" />

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Why Departments Choose
            <span className="text-gradient"> Kicker Video</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            We specialize in law enforcement recruitment videos that don't just inform—they inspire. 
            Our team understands the unique challenges of police recruitment in today's climate.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="group p-6 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
