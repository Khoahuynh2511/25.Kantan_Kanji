import { DrawInput } from "@/features/KanjiMap/components/draw-input";
import { KanjiMapHeader } from "@/features/KanjiMap/components/header";
import { MobileLayout } from "@/features/KanjiMap/components/mobile-layout";
import { SearchInput } from "@/features/KanjiMap/components/search-input";
import { SearchIcon } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kanji Map",
  description:
    "Explore kanji composition relationships with an interactive 2D/3D graph visualization.",
};

export default function KanjiMapPage() {
  return (
    <div className="size-full flex flex-col">
      <KanjiMapHeader className="w-full" />

      {/* Mobile */}
      <div className="w-full grow md:hidden">
        <MobileLayout
          tabs={[
            {
              id: 0,
              label: "漢字",
              content: (
                <div className="relative mt-8 p-4 flex flex-col items-center gap-12">
                  <SearchInput searchPlaceholder="Search kanji..." />
                  <DrawInput />
                </div>
              ),
            },
            {
              id: 1,
              label: "部首",
              content: <div />,
            },
            {
              id: 2,
              label: "例",
              content: <div />,
            },
            {
              id: 3,
              label: "図",
              content: <div />,
            },
            {
              id: 4,
              label: (
                <SearchIcon className="w-4 h-4 inline-block -translate-y-0.5" />
              ),
              content: (
                <div className="relative mt-8 p-4 flex flex-col items-center gap-12">
                  <SearchInput searchPlaceholder="Search kanji..." />
                  <DrawInput />
                </div>
              ),
            },
          ]}
          initialActiveTab={4}
          disabled
        />
      </div>

      {/* Desktop */}
      <div className="w-full grow hidden md:grid grid-cols-1 md:grid-rows-[330px_1fr] overflow-hidden">
        <div className="top grid grid-cols-[252px_1.5fr_1fr] overflow-hidden border-b">
          <div className="flex flex-col items-center gap-2 mt-3">
            <SearchInput searchPlaceholder="Search kanji..." />
            <DrawInput />
          </div>
          <div className="p-4 border-l">
            <p className="text-muted-foreground text-sm mt-2">
              Search for a kanji above or draw it to see its composition graph.
            </p>
          </div>
          <div className="p-4 border-l" />
        </div>
        <div className="bottom grid grid-cols-[2fr_3fr] overflow-hidden">
          <div className="p-4" />
          <div className="p-4 border-l" />
        </div>
      </div>
    </div>
  );
}
