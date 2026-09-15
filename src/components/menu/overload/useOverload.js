import { useEffect, useRef, useState } from 'react';

// Overload indicator — the home menu's playful warning that a Multi
// selection is getting big (rendered by OverloadCount):
// - heat: 0 at or below OVERLOAD_START questions, rising linearly to 1 at
//   OVERLOAD_MAX (and staying there).
// - surgeId: bumps each time the count *grows* while overloaded, so the
//   visual can replay its shake (as a React key). Deselecting only cools
//   things down, it never surges.
export const OVERLOAD_START = 50;
export const OVERLOAD_MAX = 250;

export function overloadHeat(count) {
  if (count <= OVERLOAD_START) return 0;
  return Math.min((count - OVERLOAD_START) / (OVERLOAD_MAX - OVERLOAD_START), 1);
}

export function useOverload(count) {
  const [surgeId, setSurgeId] = useState(0);
  // Starts at 0 so a selection that jumps straight past OVERLOAD_START
  // (e.g. one Select all) surges on its first appearance too.
  const prevCount = useRef(0);
  useEffect(() => {
    if (count > prevCount.current && count > OVERLOAD_START) setSurgeId((n) => n + 1);
    prevCount.current = count;
  }, [count]);
  return { heat: overloadHeat(count), surgeId };
}
