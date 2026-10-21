import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

/** 按下后移动超过这个像素数才算拖拽（低于它算点击） */
const DRAG_THRESHOLD = 6;
/** 拖拽热区里不该起拖的可交互元素 */
const NO_DRAG_SELECTOR = 'button, input, textarea, a, [data-no-drag]';

/** 所有拖拽会话共有的字段 */
export interface DragSessionBase {
  pointerId: number;
  started: boolean;
  startX: number;
  startY: number;
}

/** 传给回调的当前容器 / 元素表（只在回调执行的那一刻有意义） */
export interface DragContext<K> {
  containerEl: HTMLElement | null;
  itemEls: Map<K, HTMLElement>;
}

export interface UseDragSessionOptions<
  K,
  TSession extends DragSessionBase,
  TDrag,
> {
  /** pointerdown 时创建会话；共有的 4 个字段由本 hook 补齐 */
  createSession: (
    e: ReactPointerEvent,
    key: K,
  ) => Omit<TSession, keyof DragSessionBase>;
  /** 跨过阈值、真正开始拖拽这一刻（list 在这里量 active item 的原始位置） */
  onStart?: (s: TSession, ctx: DragContext<K>) => void;
  /** 指针移动（只会发生在 started 之后）。返回 undefined 表示本次不更新 drag */
  onMove: (
    e: PointerEvent,
    s: TSession,
    ctx: DragContext<K>,
  ) => TDrag | undefined;
  /**
   * 松手结算（commit=true）或 Escape 取消（commit=false）。
   * 只在真正开始拖拽（跨过阈值）后才会回调，session 已清空。
   */
  onStop: (
    s: TSession,
    commit: boolean,
    e: PointerEvent | undefined,
    ctx: DragContext<K>,
  ) => void;
}

export interface DragSessionResult<K, TDrag> {
  drag: TDrag | null;
  containerRef: (el: HTMLElement | null) => void;
  setItemRef: (key: K, el: HTMLElement | null) => void;
  onPointerDown: (e: ReactPointerEvent, key: K) => void;
  /** 拖拽后的同一次点击不应触发打开/编辑 */
  clickGuard: () => boolean;
}

/** 被拖元素跟随指针的通用 style（grid 多一个半透明占位） */
export const dragFollowStyle = (
  dx: number,
  dy: number,
  extra?: CSSProperties,
): CSSProperties => ({
  transform: `translate3d(${dx}px, ${dy}px, 0)`,
  zIndex: 999,
  pointerEvents: 'none',
  position: 'relative',
  ...extra,
});

/**
 * 指针拖拽的公共骨架：会话生命周期、阈值判定、window 监听绑定/解绑、
 * Escape 取消、拖后吞掉同一次点击、卸载清理。
 * 「谁算命中区」「松手怎么结算」由调用方的 onMove / onStop 决定。
 */
export function useDragSession<K, TSession extends DragSessionBase, TDrag>({
  createSession,
  onStart,
  onMove,
  onStop,
}: UseDragSessionOptions<K, TSession, TDrag>): DragSessionResult<K, TDrag> {
  const containerElRef = useRef<HTMLElement | null>(null);
  const itemEls = useRef(new Map<K, HTMLElement>());
  const sessionRef = useRef<TSession | null>(null);
  const clickGuardRef = useRef(false);
  const [drag, setDrag] = useState<TDrag | null>(null);

  // 回调随渲染更新，事件处理器里永远读最新的
  const latest = useRef({ createSession, onStart, onMove, onStop });
  latest.current = { createSession, onStart, onMove, onStop };

  const unbind = useCallback(() => {
    window.removeEventListener('pointermove', handleMove);
    window.removeEventListener('pointerup', handleUp);
    window.removeEventListener('pointercancel', handleUp);
    window.removeEventListener('keydown', handleKey);
    document.body.style.userSelect = '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stop = useCallback((commit: boolean, e?: PointerEvent) => {
    const s = sessionRef.current;
    sessionRef.current = null;
    unbind();
    if (s) {
      // 取消（Escape）：不吞点击，按下照常触发；结算才吞
      clickGuardRef.current = s.started ? commit : false;
      if (s.started) {
        latest.current.onStop(s, commit, e, {
          containerEl: containerElRef.current,
          itemEls: itemEls.current,
        });
      }
    }
    setDrag(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMove(e: PointerEvent) {
    const s = sessionRef.current;
    if (!s || e.pointerId !== s.pointerId) return;

    if (!s.started) {
      const dist = Math.hypot(e.clientX - s.startX, e.clientY - s.startY);
      if (dist < DRAG_THRESHOLD) return;
      s.started = true;
      clickGuardRef.current = true;
      document.body.style.userSelect = 'none';
      latest.current.onStart?.(s, {
        containerEl: containerElRef.current,
        itemEls: itemEls.current,
      });
    }

    const next = latest.current.onMove(e, s, {
      containerEl: containerElRef.current,
      itemEls: itemEls.current,
    });
    if (next !== undefined) setDrag(next);
  }

  function handleUp(e: PointerEvent) {
    const s = sessionRef.current;
    if (!s || e.pointerId !== s.pointerId) return;
    stop(true, e);
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape') stop(false);
  }

  const onPointerDown = useCallback((e: ReactPointerEvent, key: K) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest(NO_DRAG_SELECTOR)) return;
    clickGuardRef.current = false;
    e.preventDefault();

    sessionRef.current = {
      ...latest.current.createSession(e, key),
      pointerId: e.pointerId,
      started: false,
      startX: e.clientX,
      startY: e.clientY,
    } as TSession;

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    window.addEventListener('keydown', handleKey);
    // handleMove/handleUp/handleKey 是每次渲染的闭包，但只在注册时用到
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      unbind();
    },
    [unbind],
  );

  const clickGuard = useCallback(() => {
    if (clickGuardRef.current) {
      clickGuardRef.current = false;
      return true;
    }
    return false;
  }, []);

  const containerRef = useCallback((el: HTMLElement | null) => {
    containerElRef.current = el;
  }, []);

  const setItemRef = useCallback((key: K, el: HTMLElement | null) => {
    if (el) {
      itemEls.current.set(key, el);
    } else {
      itemEls.current.delete(key);
    }
  }, []);

  return {
    drag,
    containerRef,
    setItemRef,
    onPointerDown,
    clickGuard,
  };
}
