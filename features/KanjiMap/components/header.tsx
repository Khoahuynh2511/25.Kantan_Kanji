"use client";

import Link from "next/link";
import { cn } from "@/features/KanjiMap/lib/utils";
import LogoSVG from "./logo";

export const KanjiMapHeader = ({
  className,
}: {
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between h-12 shrink-0 border-b",
        className,
      )}
    >
      <div className="flex items-center h-full">
        <Link href="/kanji-map" className="flex h-full items-center gap-2">
          <LogoSVG className="h-full py-2 px-4 w-14 inline-block" />
          <h1 className="text-lg font-extrabold text-nowrap">Kanji Map</h1>
        </Link>
      </div>
    </div>
  );
};
