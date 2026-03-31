import {
  getAllKanji,
  getGraphData,
  getKanjiDataLocal,
  getNavigableRadicalIds,
  getStrokeAnimation,
} from "@/features/KanjiMap/lib";
import {
  aliasIds,
  getKanjiVariants,
  resolveKanjiId,
} from "@/features/KanjiMap/lib/kanji-variants";
import { KanjiMapHeader } from "@/features/KanjiMap/components/header";
import { KanjiPageContent } from "./inner";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id: urlEncodedId } = await params;
  const id = resolveKanjiId(decodeURIComponent(urlEncodedId));
  return {
    title: `${id} - Kanji Map`,
    description: `Explore the kanji ${id} and its composition relationships.`,
  };
}

export async function generateStaticParams() {
  const canonicalIds = getAllKanji().map(({ params: { id } }) => id);
  return [...canonicalIds, ...aliasIds].map((id) => ({ id }));
}

export default async function KanjiMapDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id: urlEncodedId } = await params;
  const requestedId = decodeURIComponent(urlEncodedId);
  const canonicalId = resolveKanjiId(requestedId);
  const kanjiInfo = await getKanjiDataLocal(canonicalId);
  const graphData = await getGraphData(canonicalId);
  const strokeAnimation = await getStrokeAnimation(canonicalId);
  const navigableRadicalIds = getNavigableRadicalIds();

  if (!kanjiInfo) {
    notFound();
  }

  return (
    <div className="size-full flex flex-col">
      <KanjiMapHeader className="w-full" />
      <KanjiPageContent
        requestedId={requestedId}
        canonicalId={canonicalId}
        variantInfo={getKanjiVariants(canonicalId)}
        kanjiInfo={kanjiInfo}
        graphData={graphData}
        strokeAnimation={strokeAnimation}
        navigableRadicalIds={navigableRadicalIds}
      />
    </div>
  );
}
