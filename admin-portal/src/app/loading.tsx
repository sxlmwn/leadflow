import Loader from "@/components/ui/loader";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Loader
        size="lg"
        title="Loading LeadFlow Admin..."
        subtitle="Initializing telemetry and platform workspace"
      />
    </div>
  );
}
