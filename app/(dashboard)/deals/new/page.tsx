import { PageHeader } from "@/components/shared/PageHeader";
import { DealForm } from "@/components/deals/DealForm";

export default function NewDealPage() {
  return (
    <div>
      <PageHeader
        title="New Deal"
        breadcrumbs={[{ label: "Deals", href: "/deals" }, { label: "New Deal" }]}
      />
      <div className="max-w-2xl mx-auto">
        <div className="card mt-6 overflow-hidden">
          <DealForm />
        </div>
      </div>
    </div>
  );
}
