import Loader from "@/components/ui/loader";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black text-white">
      <Loader
        size="lg"
        title="Loading brand experience..."
        subtitle="Configuring custom theme and questions funnel"
      />
    </div>
  );
}
