import portfolioStrip from "@/assets/portfolio-strip.png";

const PortfolioStrip = () => {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <img 
            src={portfolioStrip} 
            alt="Portfolio examples: Alameda County Waste Management Authority, Active Shooter Awareness training video, Police community engagement" 
            className="max-w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default PortfolioStrip;
