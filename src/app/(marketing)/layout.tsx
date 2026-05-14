import { SmoothScroll } from "~/components/marketing/SmoothScroll";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <SmoothScroll />
      {children}
    </div>
  );
}
