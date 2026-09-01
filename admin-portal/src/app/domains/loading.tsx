import { Loader } from "@/components/ui/loader";

export default function DomainsLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <Loader
        size="lg"
        title="Loading Custom Domains..."
        subtitle="Retrieving DNS propagation statuses and SSL certificates"
      />
    </div>
  );
}
