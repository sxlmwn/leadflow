import { Loader } from "@/components/ui/loader";

export default function BuyersLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <Loader
        size="lg"
        title="Loading Buyer Routing..."
        subtitle="Retrieving active webhook listeners, payout tiers, and scoring criteria"
      />
    </div>
  );
}
