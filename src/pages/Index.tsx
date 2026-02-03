import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import heroThumbnail from "@/assets/hero-thumbnail.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection thumbnailUrl={heroThumbnail} />
      <AboutSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
