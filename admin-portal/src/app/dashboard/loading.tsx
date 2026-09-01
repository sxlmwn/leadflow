import { Loader } from "@/components/ui/loader";

export default function DashboardLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <Loader
        size="lg"
        title="Loading Platform Dashboard..."
        subtitle="Aggregating real-time lead telemetry and conversion rates"
      />
    </div>
  );
}
