import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const assetRegistry = JSON.parse(readFileSync(join(root, "data", "running", "training-assets.json"), "utf8"));

const categoryLabels = {
  governing_body_and_consensus: "Governing body and consensus",
  systematic_reviews_and_meta_analyses: "Systematic reviews and meta-analyses",
  primary_and_practice_evidence: "Primary and practice evidence",
  technical_standards: "Technical standards"
};

export function flattenTrainingAssets(registry = assetRegistry) {
  return Object.entries(registry.categories ?? {})
    .flatMap(([category, entries]) => entries.map((entry, index) => ({
      ...entry,
      category,
      category_label: categoryLabels[category] ?? category,
      ordinal: index + 1
    })));
}

export function assetCategorySummary(registry = assetRegistry) {
  return Object.entries(registry.categories ?? {}).map(([category, entries]) => ({
    category,
    label: categoryLabels[category] ?? category,
    count: entries.length
  }));
}

export function sourceById(id, registry = assetRegistry) {
  return flattenTrainingAssets(registry).find((asset) => asset.id === id);
}

export function sourcesByIds(ids, registry = assetRegistry) {
  const requested = new Set(ids);
  return flattenTrainingAssets(registry).filter((asset) => requested.has(asset.id));
}

export function recommendedSourceAnchors(registry = assetRegistry) {
  const anchorIds = [
    "training-intensity-network-meta-2025",
    "marathon-training-determinants-meta-2020",
    "single-session-spike-2025",
    "world-athletics-distance-nutrition-2019",
    "marathon-pacing-review-2024",
    "recovery-consensus-2018"
  ];
  return sourcesByIds(anchorIds, registry);
}

export function renderAssetSummaryLines(registry = assetRegistry) {
  return [
    registry.meta.title,
    `Last verified / 最近验证: ${registry.meta.last_verified}`,
    `Evidence policy / 证据原则: ${registry.meta.evidence_policy}`,
    "",
    ...assetCategorySummary(registry).map((item) => `${item.label}: ${item.count}`)
  ];
}
