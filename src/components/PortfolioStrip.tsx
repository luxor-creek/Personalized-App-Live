import portfolioStrip from "@/assets/portfolio-strip.png";

const PortfolioStrip = () => {
  return (
    <section className="bg-background">
      <div className="w-full">
        <img 
          src={portfolioStrip} 
          alt="Portfolio examples: Alameda County Waste Management Authority, Active Shooter Awareness training video, Police community engagement" 
          className="w-full h-auto"
        />
      </div>
    </section>
  );
};

export default PortfolioStrip;
