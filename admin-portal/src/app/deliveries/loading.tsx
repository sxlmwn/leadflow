import { Loader } from "@/components/ui/loader";

export default function DeliveriesLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <Loader
        size="lg"
        title="Loading Outbound Deliveries..."
        subtitle="Retrieving real-time buyer pings, postbacks, and response latencies"
      />
    </div>
  );
}
