import type { SearchResult, Vec } from "../types";
import { key, neighbors } from "../maze";
import { manhattan } from "./heuristics";

// Shared best-first frontier expansion. A* and Greedy Best-First differ only in
// the priority key applied to the frontier — everything else (neighbour
// expansion, path reconstruction, metric collection) is identical, so both
// strategies reuse this single routine.

interface HeapItem {
  cell: Vec;
  priority: number;
}

/** Tiny binary min-heap keyed by `priority`. */
class MinHeap {
  private items: HeapItem[] = [];

  get size(): number {
    return this.items.length;
  }

  push(item: HeapItem): void {
    const a = this.items;
    a.push(item);
    let i = a.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (a[parent].priority <= a[i].priority) break;
      [a[parent], a[i]] = [a[i], a[parent]];
      i = parent;
    }
  }

  pop(): HeapItem | undefined {
    const a = this.items;
    if (a.length === 0) return undefined;
    const top = a[0];
    const last = a.pop()!;
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        let smallest = i;
        if (l < a.length && a[l].priority < a[smallest].priority) smallest = l;
        if (r < a.length && a[r].priority < a[smallest].priority) smallest = r;
        if (smallest === i) break;
        [a[smallest], a[i]] = [a[i], a[smallest]];
        i = smallest;
      }
    }
    return top;
  }
}

/**
 * Best-first graph search over the maze grid.
 * @param priorityOf maps (g, h) → frontier key. A*: g + h; Greedy: h.
 */
export function bestFirstSearch(
  walls: boolean[][],
  start: Vec,
  goal: Vec,
  priorityOf: (g: number, h: number) => number,
): SearchResult {
  const t0 =
    typeof performance !== "undefined" ? performance.now() : Date.now();

  const startK = key(start);
  const goalK = key(goal);

  const gScore = new Map<string, number>([[startK, 0]]);
  const cameFrom = new Map<string, Vec>();
  const frontier = new MinHeap();
  frontier.push({ cell: start, priority: priorityOf(0, manhattan(start, goal)) });

  const closed = new Set<string>();
  let nodesExpanded = 0;
  let reached = false;

  while (frontier.size > 0) {
    const current = frontier.pop()!.cell;
    const curK = key(current);

    if (closed.has(curK)) continue;
    closed.add(curK);
    nodesExpanded++;

    if (curK === goalK) {
      reached = true;
      break;
    }

    const g = gScore.get(curK)!;
    for (const n of neighbors(walls, current)) {
      const nK = key(n);
      const tentativeG = g + 1;
      if (tentativeG < (gScore.get(nK) ?? Infinity)) {
        gScore.set(nK, tentativeG);
        cameFrom.set(nK, current);
        frontier.push({
          cell: n,
          priority: priorityOf(tentativeG, manhattan(n, goal)),
        });
      }
    }
  }

  const path: Vec[] = [];
  if (reached) {
    let cur: Vec | undefined = goal;
    while (cur && key(cur) !== startK) {
      path.push(cur);
      cur = cameFrom.get(key(cur));
    }
    path.reverse();
  }

  const t1 =
    typeof performance !== "undefined" ? performance.now() : Date.now();

  return {
    path,
    metrics: {
      nodesExpanded,
      pathLength: path.length,
      timeMs: t1 - t0,
    },
  };
}
