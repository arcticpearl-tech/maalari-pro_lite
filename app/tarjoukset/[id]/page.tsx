import { OfferDetail } from "@/components/OfferDetail";

export const metadata = {
  title: "Tarjous · MaalariPro Lite",
};

export default async function OfferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OfferDetail id={id} />;
}
