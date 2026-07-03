"use client";

import { isFeatureEnabled } from "@/config/features.config";
import { dopamineWidgets } from "@/config/dopamine.config";
import { useSearch } from "@/features/core-workflow/context/SearchContext";
import { TrustBar } from "./components/TrustBar";
import { RollingEarningsCounter } from "./components/RollingEarningsCounter";
import { EarningsTestimonials } from "./components/EarningsTestimonials";
import { MilestoneTracker } from "./components/MilestoneTracker";

function WorkflowMilestoneTracker() {
  const { history } = useSearch();
  return <MilestoneTracker activityCount={history.length} />;
}

/**
 * Optional dashboard engagement block when `dopamine` is enabled.
 * Mount below main dashboard content — see app/dashboard/page.tsx.
 */
export function DopamineDashboard() {
  const showCounter = dopamineWidgets.earningsCounter;
  const showMilestones = dopamineWidgets.milestoneTracker;
  const workflowMilestones = showMilestones && isFeatureEnabled("core-workflow");

  return (
    <div className="flex flex-col gap-4">
      {dopamineWidgets.trustBar ? <TrustBar /> : null}
      {(showCounter || showMilestones) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {showCounter ? <RollingEarningsCounter /> : null}
          {workflowMilestones ? (
            <WorkflowMilestoneTracker />
          ) : showMilestones ? (
            <MilestoneTracker />
          ) : null}
        </div>
      )}
      {dopamineWidgets.testimonials ? <EarningsTestimonials /> : null}
    </div>
  );
}
