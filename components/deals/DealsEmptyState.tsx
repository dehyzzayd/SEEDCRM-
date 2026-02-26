import { GitPullRequest, Plus } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import Link from "next/link";

export function DealsEmptyState({ hasFilters }: { hasFilters?: boolean }) {
  if (hasFilters) {
    return (
      <EmptyState
        icon={GitPullRequest}
        title="No deals match your filters"
        description="Try adjusting or clearing your filters to see more deals."
        size="md"
      />
    );
  }

  return (
    <EmptyState
      icon={GitPullRequest}
      title="No deals yet"
      description="Your deal pipeline is empty. Start by logging your first natural gas, power, or crude oil trade."
      hint="Most traders begin by adding a deal in Origination stage before moving it through the pipeline."
      action={
        <Link
          href="/deals/new"
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          Log your first deal
        </Link>
      }
      size="lg"
    />
  );
}
