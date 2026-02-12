import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Hammer, Copy, ArrowRight, CheckCircle2, X } from "lucide-react";
import { useState } from "react";

type OnboardingState = "no-pages" | "has-draft" | "first-publish" | "active" | null;

interface DashboardOnboardingProps {
  /** User's own template count */
  templateCount: number;
  /** Set of template IDs that are live (linked to campaigns with pages) */
  liveTemplateIds: Set<string>;
  /** Number of campaigns with at least one personalized page */
  activeCampaignCount: number;
  /** Total personalized links generated */
  totalLinks: number;
  /** Callback when user dismisses onboarding */
  onDismiss?: () => void;
  /** Callback to navigate to campaigns tab */
  onGoToCampaigns?: () => void;
}

function getOnboardingState(props: DashboardOnboardingProps): OnboardingState {
  const { templateCount, liveTemplateIds, activeCampaignCount, totalLinks } = props;

  // State 4: Active user — campaign exists with links
  if (activeCampaignCount > 0 && totalLinks > 0) return "active";

  // State 3: First publish — has live template but no campaign links yet
  if (liveTemplateIds.size > 0 && totalLinks === 0) return "first-publish";

  // State 1: No pages exist
  if (templateCount === 0) return "no-pages";

  // State 2: Has templates but none are live
  if (templateCount > 0 && liveTemplateIds.size === 0) return "has-draft";

  return null;
}

export default function DashboardOnboarding(props: DashboardOnboardingProps) {
  const [dismissed, setDismissed] = useState(false);
  const state = getOnboardingState(props);

  if (dismissed || state === "active" || state === null) return null;

  const handleDismiss = () => {
    setDismissed(true);
    props.onDismiss?.();
  };

  if (state === "no-pages") {
    return (
      <div className="relative rounded-xl border border-border bg-card p-8">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="max-w-xl">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Let's build your first personalized page.
          </h2>

          {/* 3-step indicator */}
          <div className="flex items-center gap-3 mb-6">
            {["Choose a template", "Customize", "Publish"].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {i + 1}
                </span>
                <span className="text-sm text-muted-foreground">{step}</span>
                {i < 2 && (
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 ml-1" />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link to="/builder">
              <Button>
                <Copy className="w-4 h-4 mr-2" />
                Start with Template
              </Button>
            </Link>
            <Link to="/builder">
              <Button variant="outline">
                <Hammer className="w-4 h-4 mr-2" />
                Start from Scratch
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (state === "has-draft") {
    return (
      <div className="relative flex items-center justify-between rounded-lg border border-border bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <p className="text-sm text-foreground">
            Your page is almost ready.{" "}
            <span className="text-muted-foreground">
              Publish to start generating personalized links.
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link to="/builder">Open Draft</Link>
          </Button>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground/50 hover:text-muted-foreground transition-colors p-1"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (state === "first-publish") {
    return (
      <div className="relative flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-6 py-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Your page is live.
            </p>
            <p className="text-sm text-muted-foreground">
              Ready to send personalized versions?
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={props.onGoToCampaigns}>
            Create Campaign
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            Later
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
