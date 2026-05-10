import MediaHub from "@/components/media/MediaHub";

export const metadata = {
  title: "Media Hub | Ethoss - Visualizing Conservation",
  description: "Explore our collection of high-quality visuals capturing our conservation efforts, community impact, and sustainable destinations across Africa.",
};

export default function MediaHubPage() {
  return (
    <main className="min-h-screen pt-16">
      <MediaHub />
    </main>
  );
}
