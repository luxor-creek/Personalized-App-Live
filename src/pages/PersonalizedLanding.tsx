import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PersonalizedHeroSection from "@/components/PersonalizedHeroSection";
import LogoCarousel from "@/components/LogoCarousel";
import AboutSection from "@/components/AboutSection";
import PortfolioStrip from "@/components/PortfolioStrip";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import heroThumbnail from "@/assets/hero-thumbnail.jpg";

interface PersonalizedPageData {
  id: string;
  first_name: string;
  last_name: string | null;
  company: string | null;
  custom_message: string | null;
}

const PersonalizedLanding = () => {
  const { token } = useParams<{ token: string }>();
  const [pageData, setPageData] = useState<PersonalizedPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPageData = async () => {
      if (!token) {
        setError("Invalid page link");
        setLoading(false);
        return;
      }

      try {
        // Fetch the personalized page data
        const { data, error: fetchError } = await supabase
          .from("personalized_pages")
          .select("id, first_name, last_name, company, custom_message")
          .eq("token", token)
          .single();

        if (fetchError || !data) {
          setError("Page not found");
          setLoading(false);
          return;
        }

        setPageData(data);

        // Record the page view
        await supabase.from("page_views").insert({
          personalized_page_id: data.id,
          user_agent: navigator.userAgent,
        });
      } catch (err) {
        console.error("Error fetching page:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PersonalizedHeroSection 
        thumbnailUrl={heroThumbnail}
        firstName={pageData?.first_name}
        company={pageData?.company || undefined}
        customMessage={pageData?.custom_message || undefined}
      />
      <LogoCarousel />
      <AboutSection />
      <PortfolioStrip />
      <CTASection />
      <Footer />
    </div>
  );
};

export default PersonalizedLanding;
