import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link2, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface LifetimeStats {
  totalLinks: number;
  totalCampaigns: number;
  lastCampaignName: string | null;
  lastCampaignLinks: number;
  avgLinksPerCampaign: number;
}

export default function LifetimeLinksMetric({ userId }: { userId: string | undefined }) {
  const [stats, setStats] = useState<LifetimeStats>({
    totalLinks: 0,
    totalCampaigns: 0,
    lastCampaignName: null,
    lastCampaignLinks: 0,
    avgLinksPerCampaign: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    if (!userId) return;
    try {
      // Get all campaigns for this user
      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("id, name, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!campaigns || campaigns.length === 0) {
        setStats({ totalLinks: 0, totalCampaigns: 0, lastCampaignName: null, lastCampaignLinks: 0, avgLinksPerCampaign: 0 });
        setLoading(false);
        return;
      }

      // Get total personalized pages count across all campaigns
      const { count: totalLinks } = await supabase
        .from("personalized_pages")
        .select("*, campaigns!inner(user_id)", { count: "exact", head: true })
        .eq("campaigns.user_id", userId);

      // Get campaigns that have at least one page (successful runs)
      const campaignCounts = await Promise.all(
        campaigns.map(async (c) => {
          const { count } = await supabase
            .from("personalized_pages")
            .select("*", { count: "exact", head: true })
            .eq("campaign_id", c.id);
          return { ...c, linkCount: count || 0 };
        })
      );

      const activeCampaigns = campaignCounts.filter((c) => c.linkCount > 0);
      const total = totalLinks || 0;
      const campaignCount = activeCampaigns.length;
      const lastCampaign = activeCampaigns[0] || null;
      const avg = campaignCount > 0 ? Math.round(total / campaignCount) : 0;

      setStats({
        totalLinks: total,
        totalCampaigns: campaignCount,
        lastCampaignName: lastCampaign?.name || null,
        lastCampaignLinks: lastCampaign?.linkCount || 0,
        avgLinksPerCampaign: avg,
      });
    } catch (err) {
      console.error("Error fetching lifetime stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  const formatted = (n: number) => n.toLocaleString();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="group text-right cursor-pointer rounded-lg border border-border/50 bg-card/50 px-5 py-3.5 transition-colors hover:bg-card hover:border-border">
          <div className="flex items-center gap-2.5">
            <Link2 className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold text-primary tabular-nums">
              {formatted(stats.totalLinks)}
            </span>
            <span className="text-base text-muted-foreground">
              Personalized Links Generated
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
          </div>
          {stats.totalCampaigns > 0 ? (
            <p className="text-xs text-muted-foreground mt-0.5">
              Across {stats.totalCampaigns} campaign{stats.totalCampaigns !== 1 ? "s" : ""}
              {stats.lastCampaignName && (
                <span className="ml-1.5 text-muted-foreground/70">
                  · Last campaign: {formatted(stats.lastCampaignLinks)} links
                </span>
              )}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              Generate your first campaign to get started.
            </p>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="p-4 space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Lifetime Stats</h4>
          <div className="space-y-2.5">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Total personalized links</span>
              <span className="text-sm font-semibold tabular-nums">{formatted(stats.totalLinks)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Total campaigns</span>
              <span className="text-sm font-semibold tabular-nums">{stats.totalCampaigns}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Avg links per campaign</span>
              <span className="text-sm font-semibold tabular-nums">{formatted(stats.avgLinksPerCampaign)}</span>
            </div>
            {stats.lastCampaignName && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">Most recent campaign</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{stats.lastCampaignName}</p>
                <p className="text-xs text-muted-foreground">{formatted(stats.lastCampaignLinks)} links generated</p>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
