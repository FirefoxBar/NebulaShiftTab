import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
} from 'react';
import {
  type DragContext,
  type DragSessionBase,
  dragFollowStyle,
  useDragSession,
} from './use-drag-session';

// ---------------------------------------------------------------------------
// 合并判定参数
// ---------------------------------------------------------------------------

/** item 中心上下左右各占 15% 的区域 = 合并区 */
const MERGE_RATIO = 0.15;
/** 解除合并的迟滞带：比进入带宽，避免在边界上反复横跳 */
const MERGE_EXIT_RATIO = 0.8;

// ---------------------------------------------------------------------------

type Layout = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

export type DragState = {
  id: string;
  dx: number;
  dy: number;
  /** 「去掉 active 之后」的阅读序插入下标 */
  ins: number;
  /** 已亮出的合并目标 */
  targetId: string | null;
  /** 指针当前悬停的合并候选（未亮出，用于迟滞带） */
  hoverId: string | null;
  /** 排除 active 后其他 item 的位置（阅读序），用于插入指示器 */
  layout: Layout[];
};

interface ListSession extends DragSessionBase {
  id: string;
  /** 拖拽开始时 active item 在容器内的位置（不含 transform） */
  originLeft: number;
  originTop: number;
  originWidth: number;
  originHeight: number;
  armed: boolean;
  hoverId: string | null;
  lastClientX: number;
  lastClientY: number;
  lastTime: number;
  /** 上一事件的位移，用于算指针速度 */
  lastDx: number;
  lastDy: number;
  ins: number;
}

export interface UseDragListOptions {
  /** 是否允许把 activeId 合并进 targetId */
  canMerge?: (activeId: string, targetId: string) => boolean;
  onReorder: (activeId: string, ins: number) => void;
  onMerge?: (activeId: string, targetId: string) => void;
  /**
   * 排序区松手且指针落在该矩形之外时改触发 onDropOutside。
   * 典型场景：从文件夹弹层里把站点拖到弹层外 = 移出文件夹。
   */
  getBoundaryRect?: () => DOMRect | null;
  onDropOutside?: (activeId: string) => void;
}

export interface DragListResult {
  containerRef: (el: HTMLElement | null) => void;
  setItemRef: (id: string, el: HTMLElement | null) => void;
  onPointerDown: (e: ReactPointerEvent, id: string) => void;
  drag: DragState | null;
  /** 拖拽中的 item 应挂的 style */
  rowStyle: (id: string) => CSSProperties | undefined;
  /** 拖拽后的同一次点击不应触发打开/编辑 */
  clickGuard: () => boolean;
}

/** 其他 item 在容器内的位置（阅读序），用于插入下标与合并命中 */
const measure = (ctx: DragContext<string>, excludeId: string): Layout[] => {
  const rect = ctx.containerEl?.getBoundingClientRect();
  if (!rect) return [];
  const out: Layout[] = [];
  ctx.itemEls.forEach((el, id) => {
    if (id === excludeId) return;
    const r = el.getBoundingClientRect();
    out.push({
      id,
      left: r.left - rect.left,
      top: r.top - rect.top,
      width: r.width,
      height: r.height,
    });
  });
  // Map 保持插入序，不一定是视觉序，按阅读序排一次（flex 会换行）
  out.sort((a, b) => (a.top === b.top ? a.left - b.left : a.top - b.top));
  return out;
};

/** 阅读序插入下标：拖拽后的中心点 vs 其他 item 中心点 */
const computeIns = (
  layout: Layout[],
  s: ListSession,
  dx: number,
  dy: number,
): number => {
  const cx = s.originLeft + s.originWidth / 2 + dx;
  const cy = s.originTop + s.originHeight / 2 + dy;
  let ins = 0;
  for (const l of layout) {
    const lcx = l.left + l.width / 2;
    const lcy = l.top + l.height / 2;
    // 中心纵坐标接近 = 同一行，比左右；否则比上下
    const sameRow = Math.abs(lcy - cy) < Math.max(l.height, s.originHeight) / 2;
    const before = sameRow ? lcx < cx : lcy < cy;
    if (before) ins++;
  }
  return ins;
};

/** 指针（容器内坐标）落在某 item 的 `ratio` 中心带里 */
const findHover = (
  layout: Layout[],
  x: number,
  y: number,
  ratio: number,
): string | null => {
  for (const l of layout) {
    if (
      x >= l.left &&
      x <= l.left + l.width &&
      y >= l.top &&
      y <= l.top + l.height &&
      Math.abs(x - (l.left + l.width / 2)) <= l.width * ratio &&
      Math.abs(y - (l.top + l.height / 2)) <= l.height * ratio
    ) {
      return l.id;
    }
  }
  return null;
};

const useDragList = ({
  canMerge,
  onReorder,
  onMerge,
  getBoundaryRect,
  onDropOutside,
}: UseDragListOptions): DragListResult => {
  const session = useDragSession<string, ListSession, DragState>({
    createSession: (e, id) => ({
      id,
      originLeft: 0,
      originTop: 0,
      originWidth: 0,
      originHeight: 0,
      armed: false,
      hoverId: null,
      lastClientX: e.clientX,
      lastClientY: e.clientY,
      lastTime: e.timeStamp,
      lastDx: 0,
      lastDy: 0,
      ins: 0,
    }),

    // 拖拽开始时记录 active item 的原始位置（此刻还没挂 transform）
    onStart: (s, ctx) => {
      const rect = ctx.containerEl?.getBoundingClientRect();
      const ai = ctx.itemEls.get(s.id);
      if (rect && ai) {
        const ar = ai.getBoundingClientRect();
        s.originLeft = ar.left - rect.left;
        s.originTop = ar.top - rect.top;
        s.originWidth = ar.width;
        s.originHeight = ar.height;
      }
    },

    onMove: (e, s, ctx) => {
      const rect = ctx.containerEl?.getBoundingClientRect();
      if (!rect || !ctx.itemEls.get(s.id)) return undefined;
      // 相对原始位置的位移（transform 用的就是这个）
      const dx = e.clientX - s.startX;
      const dy = e.clientY - s.startY;
      const local = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      s.lastClientX = e.clientX;
      s.lastClientY = e.clientY;

      const layout = measure(ctx, s.id);
      const ins = computeIns(layout, s, dx, dy);
      s.ins = ins;

      // 合并区：指针落在某 item 矩形内且接近中心
      const enter = findHover(layout, local.x, local.y, MERGE_RATIO);
      const withinExit = findHover(layout, local.x, local.y, MERGE_EXIT_RATIO);

      if (enter && canMerge?.(s.id, enter)) {
        if (s.hoverId !== enter) {
          s.hoverId = enter;
          s.armed = true;
        }
      } else if (!withinExit || !canMerge?.(s.id, withinExit)) {
        // 出迟滞带才解除，带内保持原状态
        s.hoverId = null;
        s.armed = false;
      }
      s.lastTime = e.timeStamp;
      s.lastDx = dx;
      s.lastDy = dy;

      return {
        id: s.id,
        dx,
        dy,
        ins,
        targetId: s.armed ? s.hoverId : null,
        hoverId: s.hoverId,
        layout,
      };
    },

    onStop: (s, commit) => {
      if (!commit) return;
      const boundary =
        !s.armed && onDropOutside && getBoundaryRect ? getBoundaryRect() : null;
      const outside =
        boundary &&
        (s.lastClientX < boundary.left ||
          s.lastClientX > boundary.right ||
          s.lastClientY < boundary.top ||
          s.lastClientY > boundary.bottom);

      if (s.armed && s.hoverId && onMerge) {
        onMerge(s.id, s.hoverId);
      } else if (outside && onDropOutside) {
        onDropOutside(s.id);
      } else {
        onReorder(s.id, s.ins);
      }
    },
  });

  const rowStyle = useCallback(
    (id: string): CSSProperties | undefined => {
      const drag = session.drag;
      if (!drag || drag.id !== id) return undefined;
      return dragFollowStyle(drag.dx, drag.dy);
    },
    [session.drag],
  );

  return { ...session, rowStyle };
};

export default useDragList;
