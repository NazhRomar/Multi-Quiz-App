import { useEffect, useRef, useState } from 'react';

// Overload indicator — the home menu's playful warning that a Multi
// selection is getting big. One source of truth for every Overload visual
// (OverloadCount, OverloadVignette):
// - limit: App Settings → Overload Warning (appSettings.overloadLimit, 0 =
//   off). The selection size where everything maxes out.
// - heat: 0 until the warm-up start (OVERLOAD_WARMUP of the limit — 50 at
//   the default 250), rising linearly to 1 at the limit and staying there.
// - surgeId: bumps each time the count *grows* while overloaded, so the
//   visuals can replay their shake/pulse (as a React key). Deselecting only
//   cools things down, it never surges.
export const OVERLOAD_LIMITS = [100, 150, 200, 250, 300, 400, 500];
const OVERLOAD_WARMUP = 0.2;

export function overloadHeat(count, limit) {
  if (!limit) return 0;
  const start = limit * OVERLOAD_WARMUP;
  if (count <= start) return 0;
  return Math.min((count - start) / (limit - start), 1);
}

export function useOverload(count, limit) {
  const [surgeId, setSurgeId] = useState(0);
  // Starts at 0 so a selection that jumps straight into the warm-up range
  // (e.g. one Select all) surges on its first appearance too.
  const prevCount = useRef(0);
  const heat = overloadHeat(count, limit);
  useEffect(() => {
    if (count > prevCount.current && heat > 0) setSurgeId((n) => n + 1);
    prevCount.current = count;
  }, [count, heat]);
  return { heat, surgeId };
}
