import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
} from 'react';
import {
  type DragSessionBase,
  dragFollowStyle,
  useDragSession,
} from '../use-drag-session';

export interface DragGridState {
  /** 被拖的格子下标 */
  from: number;
  /** 当前悬停的格子下标（null = 不在任何格子上） */
  over: number | null;
  dx: number;
  dy: number;
}

interface GridSession extends DragSessionBase {
  index: number;
}

export interface UseDragGridResult {
  containerRef: (el: HTMLElement | null) => void;
  setItemRef: (index: number, el: HTMLElement | null) => void;
  onPointerDown: (e: ReactPointerEvent, index: number) => void;
  drag: DragGridState | null;
  /** 被拖格子应挂的 style */
  cellStyle: (index: number) => CSSProperties | undefined;
  /** 悬停高亮 */
  isOver: (index: number) => boolean;
  /** 拖拽后的同一次点击不应触发打开/编辑 */
  clickGuard: () => boolean;
}

/**
 * 格子 rect 命中检测（elementFromPoint 会被被拖元素挡住，所以手写）。
 * `exclude` 是被拖格子：它跟着指针走，指针永远落在它里面，不排除的话
 * 悬停结果恒等于源格子，松手就永远不会提交。
 */
const hitTest = (
  itemEls: Map<number, HTMLElement>,
  clientX: number,
  clientY: number,
  exclude: number,
): number | null => {
  for (const [index, el] of itemEls) {
    if (index === exclude) continue;
    const r = el.getBoundingClientRect();
    if (
      clientX >= r.left &&
      clientX <= r.right &&
      clientY >= r.top &&
      clientY <= r.bottom
    ) {
      return index;
    }
  }
  return null;
};

/**
 * grid 编辑态的格子拖拽：
 * 按住格子 → 指针跟随 → 悬停检测用格子 rect → 松手结算。
 */
export const useDragGrid = (
  onDrop: (from: number, to: number) => void,
): UseDragGridResult => {
  const session = useDragSession<number, GridSession, DragGridState>({
    createSession: (_e, index) => ({ index }),

    onMove: (e, s, ctx) => {
      const over = hitTest(ctx.itemEls, e.clientX, e.clientY, s.index);
      return {
        from: s.index,
        over: over === s.index ? null : over,
        // 相对原始位置的位移（transform 用的就是这个）
        dx: e.clientX - s.startX,
        dy: e.clientY - s.startY,
      };
    },

    onStop: (s, commit, e, ctx) => {
      if (!commit || !e) return;
      const over = hitTest(ctx.itemEls, e.clientX, e.clientY, s.index);
      if (over !== null && over !== s.index) {
        onDrop(s.index, over);
      }
    },
  });

  const cellStyle = useCallback(
    (index: number): CSSProperties | undefined => {
      const drag = session.drag;
      if (!drag || drag.from !== index) return undefined;
      return dragFollowStyle(drag.dx, drag.dy, { opacity: 0.75 });
    },
    [session.drag],
  );

  const isOver = useCallback(
    (index: number) => Boolean(session.drag && session.drag.over === index),
    [session.drag],
  );

  return { ...session, cellStyle, isOver };
};
