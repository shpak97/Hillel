import { GuestOrderResultClient } from '@/features/guest/components/GuestOrderResultClient';

type GuestOrderResultPageProps = {
  params: Promise<{ slug: string; orderUuid: string }>;
};

export default async function GuestOrderResultPage({
  params,
}: GuestOrderResultPageProps) {
  const { slug, orderUuid } = await params;

  return <GuestOrderResultClient slug={slug} orderUuid={orderUuid} />;
}
