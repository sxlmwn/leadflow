import { Loader } from "@/components/ui/loader";

export default function BrandsLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <Loader
        size="lg"
        title="Loading Brand Funnels..."
        subtitle="Retrieving multi-step question schemas, custom styling, and live domains"
      />
    </div>
  );
}
