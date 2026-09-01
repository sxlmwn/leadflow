import { Loader } from "@/components/ui/loader";

export default function LeadsLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <Loader
        size="lg"
        title="Loading Lead Audit Stream..."
        subtitle="Retrieving verified records, compliance tokens, and buyer assignments"
      />
    </div>
  );
}
