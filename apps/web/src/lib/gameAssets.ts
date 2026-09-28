// Hero and item art from deadlock-api's asset endpoints, keyed by lowercase name.
// Field names are read defensively: anything missing falls back to a monogram.

const ASSETS_URL = "https://api.deadlock-api.com/v1/assets";

const HERO_IMAGE_KEYS = ["icon_image_small_webp", "icon_image_small", "icon_hero_card_webp", "icon_hero_card"];
const ITEM_IMAGE_KEYS = ["shop_image_webp", "shop_image", "image_webp", "image"];

export type AssetKind = "hero" | "item";
export type AssetIndex = Record<AssetKind, Map<string, string>>;

type RawAsset = { name?: unknown; image?: unknown; images?: Record<string, unknown> } & Record<string, unknown>;

function pickImage(asset: RawAsset, keys: string[]) {
  const sources = { ...asset, ...asset.images };
  for (const key of keys) {
    const value = sources[key];
    if (typeof value === "string" && value.startsWith("http")) return value;
  }
  return null;
}

async function loadIndex(path: string, keys: string[]) {
  const index = new Map<string, string>();
  try {
    const response = await fetch(`${ASSETS_URL}/${path}`);
    if (!response.ok) return index;
    const assets: RawAsset[] = await response.json();
    for (const asset of assets) {
      const image = pickImage(asset, keys);
      if (typeof asset.name === "string" && image) index.set(asset.name.toLowerCase(), image);
    }
  } catch {
    // Offline or blocked: callers render monograms.
  }
  return index;
}

let cached: Promise<AssetIndex> | null = null;

export function loadGameAssets() {
  cached ??= Promise.all([
    loadIndex("heroes?only_active=true", HERO_IMAGE_KEYS),
    loadIndex("items", ITEM_IMAGE_KEYS),
  ]).then(([hero, item]) => ({ hero, item }));
  return cached;
}
