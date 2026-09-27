import { useState } from "react";
import { loadGameAssets } from "@/lib/gameAssets";
import type { AssetKind } from "@/lib/gameAssets";
import { useAsync } from "@/lib/useAsync";
import { cn } from "@/lib/utils";

function monogram(name: string) {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function GameIcon({ name, kind, className }: { name: string; kind: AssetKind; className?: string }) {
  const assets = useAsync(loadGameAssets, "game-assets");
  const [failed, setFailed] = useState(false);
  const src = assets.data?.[kind].get(name.toLowerCase());

  return (
    <span
      className={cn(
        "grid size-7 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted/40 text-[10px] font-semibold text-muted-foreground",
        className,
      )}
      aria-hidden="true"
    >
      {src && !failed ? (
        <img src={src} alt="" loading="lazy" className="size-full object-cover" onError={() => setFailed(true)} />
      ) : (
        monogram(name)
      )}
    </span>
  );
}

export default GameIcon;
