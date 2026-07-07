export function buildMapPinAccessibleLabel(placeName: string, categoryLabel: string, distanceLabel: string) {
  return [placeName, categoryLabel, distanceLabel].filter(Boolean).join(' · ');
}
