import { useNavigate } from "react-router-dom";
import { AlertTriangle, Crown, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UsageLimitBannerProps {
  plan: string;
  trialExpired: boolean;
  trialDaysLeft: number | null;
  pageCount: number;
  maxPages: number;
  campaignCount: number;
  maxCampaigns: number;
  canCreatePage: boolean;
  canCreateCampaign: boolean;
  isUnlimited: boolean;
}

const UsageLimitBanner = ({
  plan, trialExpired, trialDaysLeft,
  pageCount, maxPages, campaignCount, maxCampaigns,
  canCreatePage, canCreateCampaign, isUnlimited,
}: UsageLimitBannerProps) => {
  const navigate = useNavigate();

  // Trial expired — compact alert
  if (trialExpired) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
          <p className="text-sm text-foreground">Your free trial has expired — <span className="text-muted-foreground">upgrade to continue.</span></p>
        </div>
        <Button size="sm" className="h-7 text-xs" onClick={() => navigate("/pricing")}>
          <Crown className="w-3 h-3 mr-1" />Upgrade
        </Button>
      </div>
    );
  }

  // Trial active, expiring soon — single line
  if (plan === "trial" && trialDaysLeft !== null && trialDaysLeft <= 3) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <p className="text-sm text-foreground">
            {trialDaysLeft === 0 ? "Trial expires today" : `${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} left`}
            <span className="text-muted-foreground ml-2">{pageCount}/{maxPages} pages · {campaignCount}/{maxCampaigns} campaigns</span>
          </p>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate("/pricing")}>View Plans</Button>
      </div>
    );
  }

  // Approaching limits — compact single line
  const pageUsagePercent = isUnlimited ? 0 : (pageCount / maxPages) * 100;
  const campaignUsagePercent = isUnlimited ? 0 : (campaignCount / maxCampaigns) * 100;
  const nearLimit = !isUnlimited && (pageUsagePercent >= 80 || campaignUsagePercent >= 80);

  if (nearLimit) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary shrink-0" />
          <p className="text-sm text-foreground">
            Approaching limits
            <span className="text-muted-foreground ml-2">{pageCount}/{maxPages} pages · {campaignCount}/{maxCampaigns} campaigns</span>
          </p>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate("/pricing")}>Upgrade</Button>
      </div>
    );
  }

  return null;
};

export default UsageLimitBanner;
