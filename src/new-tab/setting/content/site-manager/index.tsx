import {
  IconArrowLeft,
  IconDelete,
  IconEdit,
  IconExport,
  IconFolder,
  IconPlus,
} from '@douyinfe/semi-icons';
import { Button, Input, List, Modal, Typography } from '@douyinfe/semi-ui';
import { nanoid } from 'nanoid';
import {
  type CSSProperties,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { withErrorBoundary } from '@/components/error-boundary';
import { SiteIcon } from '@/components/site-icon';
import {
  SiteIconContext,
  useSiteIconContext,
} from '@/components/site-icon-context';
import usePref from '@/hooks/use-pref';
import { StorageKey } from '@/share/constant';
import { t } from '@/share/locale';
import { SiteItemAlias } from '@/share/type-alias';
import {
  isSiteDirItem,
  type SiteDirItem,
  type SiteItem,
  type SiteNode,
} from '@/share/types';
import { showSiteEditModal } from './site-edit-modal';

import './index.less';

// ---------------------------------------------------------------------------
// 拖拽参数
// ---------------------------------------------------------------------------

/** 按下后移动超过这个像素数才算拖拽（低于它算点击） */
const DRAG_THRESHOLD = 6;
/** item 中心上下各占 20% 高度 = 合并区；剩下的是排序区 */
const MERGE_RATIO = 0.2;
/** 解除合并的迟滞带：比进入带宽，避免在边界上反复横跳 */
const MERGE_EXIT_RATIO = 0.6;
/** 指针在合并区里停够这么久，才亮出合并（单位 ms） */
const MERGE_DWELL_MS = 220;
/** 一帧之内「唰」地怼进合并区，跳过停留直接亮合并（px/ms）。设 0 = 只用停留触发 */
const MERGE_FAST_SPEED = 1.4;

// ---------------------------------------------------------------------------

const getId = (item: SiteNode) => item[SiteItemAlias.id];

const removeIconCache = (id: string) =>
  chrome.storage.local.remove(`${StorageKey.siteIcon}_${id}`);

// ---------------------------------------------------------------------------
// 自研列表拖拽
//
// 设计要点（都是为了绕开 dnd-kit 的坑）：
// 1. 拖拽过程中【其它 item 完全不动】，只在目标位置画一条插入线。
//    → 想瞄谁就瞄谁，不会追着跑；也就不存在「被顶走又跳回来」。
// 2. 被拖的那一行自己跟着指针走，原地留一个半透明的坑位。
// 3. 合并判定用的是「指针是否落在某个 item 的中部」，因为没人动，这个判定是像素级准的。
// 4. 亮出合并后冻结插入线，松手即合并；移开（带迟滞）就恢复成排序。
// ---------------------------------------------------------------------------

type Layout = { id: string; top: number; height: number };

type DragState = {
  id: string;
  dy: number;
  ins: number;
  layout: Layout[];
  armed: boolean;
  targetId: string | null;
};

type DragSession = {
  id: string;
  pointerId: number;
  startX: number;
  startY: number;
  started: boolean;
  layout: Layout[];
  grab: number;
  dy: number;
  ins: number;
  armed: boolean;
  targetId: string | null;
  hoverId: string | null;
  timer: number | null;
  lastClientY: number;
  lastT: number;
  speed: number;
};

function useDragList({
  ids,
  canMerge,
  onReorder,
  onMerge,
}: {
  ids: string[];
  /** activeId 能不能合并进 targetId */
  canMerge?: (activeId: string, targetId: string) => boolean;
  /** ins 是「去掉 active 之后的数组」里的插入下标 */
  onReorder?: (activeId: string, ins: number) => void;
  onMerge?: (activeId: string, targetId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rowEls = useRef(new Map<string, HTMLElement>());
  const [drag, setDrag] = useState<DragState | null>(null);
  const session = useRef<DragSession | null>(null);

  // 每次渲染刷新，回调里拿到的永远是最新的 props
  const live = useRef({ ids, canMerge, onReorder, onMerge });
  live.current = { ids, canMerge, onReorder, onMerge };

  const flush = useCallback(() => {
    const c = session.current;
    setDrag(
      c && c.started
        ? {
            id: c.id,
            dy: c.dy,
            ins: c.ins,
            layout: c.layout,
            armed: c.armed,
            targetId: c.armed ? c.targetId : null,
          }
        : null,
    );
  }, []);

  const stop = useCallback(() => {
    const c = session.current;
    if (c?.timer) window.clearTimeout(c.timer);
    session.current = null;
    document.body.style.userSelect = '';
    setDrag(null);
  }, []);

  useEffect(() => {
    /** 把 clientY 换算成「相对列表容器的坐标」，天然免疫页面滚动 */
    const toLocal = (clientY: number) => {
      const el = containerRef.current;
      if (!el) return clientY;
      return clientY - el.getBoundingClientRect().top + el.scrollTop;
    };

    const onMove = (e: PointerEvent) => {
      const c = session.current;
      if (!c || e.pointerId !== c.pointerId) return;

      if (!c.started) {
        if (
          Math.hypot(e.clientX - c.startX, e.clientY - c.startY) <
          DRAG_THRESHOLD
        )
          return;
        const el = containerRef.current;
        if (!el) return;
        const cRect = el.getBoundingClientRect();
        // 此刻还没有任何 transform，量到的就是干净的原始布局
        const layout: Layout[] = [];
        for (const id of live.current.ids) {
          const row = rowEls.current.get(id);
          if (!row) continue;
          const r = row.getBoundingClientRect();
          layout.push({
            id,
            top: r.top - cRect.top + el.scrollTop,
            height: r.height,
          });
        }
        const ai = layout.findIndex(l => l.id === c.id);
        if (ai === -1) return;
        c.layout = layout;
        // 指针抓在行内的哪个位置 —— 保持这个相对位置，拖起来不会跳
        c.grab = e.clientY - cRect.top + el.scrollTop - layout[ai].top;
        c.started = true;
        c.lastClientY = e.clientY;
        c.lastT = e.timeStamp || performance.now();
        document.body.style.userSelect = 'none';
      }

      const el = containerRef.current;
      if (!el) return;
      const ai = c.layout.findIndex(l => l.id === c.id);
      if (ai === -1) return;

      const localY = toLocal(e.clientY);
      c.dy = localY - c.grab - c.layout[ai].top;

      const now = e.timeStamp || performance.now();
      c.speed =
        Math.abs(e.clientY - c.lastClientY) / Math.max(now - c.lastT, 1);
      c.lastClientY = e.clientY;
      c.lastT = now;

      // --- 排序：按「被拖行中心」落在第几个坑里来算插入下标 ---
      const center = c.layout[ai].top + c.dy + c.layout[ai].height / 2;
      let ins = 0;
      for (let i = 0; i < c.layout.length; i++) {
        if (i === ai) continue;
        if (center > c.layout[i].top + c.layout[i].height / 2) ins++;
      }

      // --- 合并：指针落在某个 item 的中部？ ---
      let hover: string | null = null;
      if (live.current.canMerge) {
        for (const l of c.layout) {
          if (l.id === c.id) continue;
          if (localY < l.top || localY > l.top + l.height) continue;
          if (
            Math.abs(localY - (l.top + l.height / 2)) <=
            l.height * MERGE_RATIO
          )
            hover = l.id;
          break;
        }
      }

      // 已经亮合并：只有明显移开才解除（迟滞带更宽，边界上不会闪）
      if (c.armed) {
        const t = c.layout.find(l => l.id === c.targetId);
        const stillOn = t && hover === t.id;
        const relaxed =
          !!t &&
          Math.abs(localY - (t.top + t.height / 2)) <=
            t.height * MERGE_EXIT_RATIO;
        if (!stillOn && !relaxed) {
          c.armed = false;
          c.targetId = null;
          if (c.timer) {
            window.clearTimeout(c.timer);
            c.timer = null;
          }
        }
      }

      if (!c.armed) {
        c.ins = ins; // 没合并时插入线才跟着走
        const ok = !!hover && !!live.current.canMerge?.(c.id, hover);
        if (ok) {
          if (MERGE_FAST_SPEED > 0 && c.speed >= MERGE_FAST_SPEED) {
            // 快速怼进来：立刻亮
            c.armed = true;
            c.targetId = hover;
            if (c.timer) {
              window.clearTimeout(c.timer);
              c.timer = null;
            }
          } else if (hover !== c.hoverId) {
            // 停在中部位置：等一会儿再亮（避免只是路过）
            c.hoverId = hover;
            if (c.timer) window.clearTimeout(c.timer);
            const pending = hover;
            c.timer = window.setTimeout(() => {
              const cur = session.current;
              if (!cur || cur !== c) return;
              cur.armed = true;
              cur.targetId = pending;
              cur.timer = null;
              flush();
            }, MERGE_DWELL_MS);
          }
        } else {
          c.hoverId = null;
          if (c.timer) {
            window.clearTimeout(c.timer);
            c.timer = null;
          }
        }
      }

      flush();
    };

    const onUp = (e: PointerEvent) => {
      const c = session.current;
      if (!c || e.pointerId !== c.pointerId) return;
      if (!c.started) return stop();
      const { onReorder, onMerge } = live.current;
      if (c.armed && c.targetId) onMerge?.(c.id, c.targetId);
      else onReorder?.(c.id, c.ins);
      stop();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && session.current) stop();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      window.removeEventListener('keydown', onKey);
    };
  }, [flush, stop]);

  useEffect(() => stop, [stop]);

  const onPointerDown = useCallback((e: ReactPointerEvent, id: string) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    // 行内的按钮/输入框不触发拖拽
    if ((e.target as HTMLElement).closest('button, input, a, [data-no-drag]'))
      return;
    session.current = {
      id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      started: false,
      layout: [],
      grab: 0,
      dy: 0,
      ins: 0,
      armed: false,
      targetId: null,
      hoverId: null,
      timer: null,
      lastClientY: e.clientY,
      lastT: e.timeStamp || performance.now(),
      speed: 0,
    };
  }, []);

  const setRowRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) rowEls.current.set(id, el);
    else rowEls.current.delete(id);
  }, []);

  const rowStyle = useCallback(
    (id: string): CSSProperties =>
      drag && drag.id === id
        ? {
            transform: `translate3d(0, ${drag.dy}px, 0)`,
            position: 'relative',
            zIndex: 1000,
            pointerEvents: 'none',
          }
        : {},
    [drag],
  );

  /** 插入线的 y 坐标；合并态下不画线 */
  const indicatorTop = ((): number | null => {
    if (!drag || drag.armed || !drag.layout.length) return null;
    const rest = drag.layout.filter(l => l.id !== drag.id);
    if (!rest.length) return null;
    if (drag.ins === 0) return rest[0].top;
    const prev = rest[Math.min(drag.ins, rest.length) - 1];
    return prev.top + prev.height;
  })();

  return {
    containerRef,
    drag,
    onPointerDown,
    setRowRef,
    rowStyle,
    indicatorTop,
  };
}

/** 通用可拖拽行：只负责拖拽能力，内容/操作由调用方塞进来 */
const DragRow = ({
  id,
  type,
  merge,
  dragging,
  rowRef,
  style,
  onPointerDown,
  children,
}: {
  id: string;
  type: 'site' | 'dir';
  merge: boolean;
  dragging: boolean;
  rowRef: (el: HTMLElement | null) => void;
  style?: CSSProperties;
  onPointerDown: (e: ReactPointerEvent) => void;
  children: ReactNode;
}) => (
  <div
    ref={rowRef}
    style={style}
    onPointerDown={onPointerDown}
    className={`list-item ${dragging ? 'dragging' : ''} ${
      merge ? 'merge-target' : ''
    }`}
    data-no-drag-children=""
  >
    {children}
    {merge && (
      <span className="merge-badge">
        {type === 'dir' ? t('placeInFolder') : t('mergeIntoFolder')}
      </span>
    )}
  </div>
);

/** 文件夹内部视图：只排序 + 改名，不支持再建文件夹（children 类型已限制） */
const DirPanel = ({
  dir,
  onBack,
  onRename,
  onReorder,
  onEditSite,
  onMoveOut,
  onRemoveChild,
}: {
  dir: SiteDirItem;
  onBack: () => void;
  onRename: (name: string) => void;
  onReorder: (activeId: string, ins: number) => void;
  onEditSite: (site: SiteItem) => void;
  onMoveOut: (site: SiteItem) => void;
  onRemoveChild: (site: SiteItem) => void;
}) => {
  const iconContext = useSiteIconContext();
  const children = dir[SiteItemAlias.children] ?? [];
  const [name, setName] = useState(dir[SiteItemAlias.name]);

  const submitName = () => onRename(name.trim() || dir[SiteItemAlias.name]);

  const list = useDragList({ ids: children.map(getId), onReorder });

  return (
    <SiteIconContext.Provider value={iconContext}>
      <div className="header">
        <Button icon={<IconArrowLeft />} onClick={onBack} />
        <Input
          value={name}
          onChange={setName}
          onBlur={submitName}
          onEnterPress={submitName}
          placeholder={t('folderName')}
        />
      </div>

      <div className="drag-list" ref={list.containerRef}>
        <List
          dataSource={children}
          split={false}
          renderItem={item => {
            const id = getId(item);
            return (
              <DragRow
                key={id}
                id={id}
                type="site"
                merge={false}
                dragging={list.drag?.id === id}
                rowRef={el => list.setRowRef(id, el)}
                style={list.rowStyle(id)}
                onPointerDown={e => list.onPointerDown(e, id)}
              >
                <div className="item-content">
                  <SiteIcon site={item} />
                  <div className="item-info">
                    <div>
                      <strong>{item[SiteItemAlias.name]}</strong>
                    </div>
                    <div className="url">{item[SiteItemAlias.url]}</div>
                  </div>
                  <div className="item-actions">
                    <Button
                      icon={<IconEdit />}
                      onClick={() => onEditSite(item)}
                    />
                    <Button
                      icon={<IconExport />}
                      onClick={() => onMoveOut(item)}
                    />
                    <Button
                      type="danger"
                      icon={<IconDelete />}
                      onClick={() => onRemoveChild(item)}
                    />
                  </div>
                </div>
              </DragRow>
            );
          }}
        />
        {list.indicatorTop !== null && (
          <div className="drop-indicator" style={{ top: list.indicatorTop }} />
        )}
      </div>
    </SiteIconContext.Provider>
  );
};

export const SitesManager = withErrorBoundary(() => {
  const [sitesValue, setSitesValue] = usePref('sites');
  const sites = (sitesValue ?? []) as SiteNode[];
  const iconContext = useSiteIconContext();

  const [editingDirId, setEditingDirId] = useState<string | null>(null);

  const updateDir = (
    dirId: string,
    updater: (dir: SiteDirItem) => SiteDirItem,
  ) =>
    setSitesValue(
      sites.map(item =>
        getId(item) === dirId && isSiteDirItem(item) ? updater(item) : item,
      ),
    );

  const handleAddSite = () => showSiteEditModal({});
  const handleEditSite = (site: SiteItem) =>
    showSiteEditModal({ initialData: { ...site } });

  const handleDeleteSite = (id: string) => {
    const index = sites.findIndex(site => getId(site) === id);
    if (index === -1) return;
    const target = sites[index];
    Modal.warning({
      title: t('deleteSite'),
      content: t('confirmDeleteSite', target[SiteItemAlias.name]),
      onOk: () => {
        removeIconCache(id);
        setSitesValue(sites.filter(site => getId(site) !== id));
      },
    });
  };

  /** 删除文件夹：把子站点平铺回原位置，避免数据丢失 */
  const handleDeleteDir = (id: string) => {
    const index = sites.findIndex(site => getId(site) === id);
    if (index === -1) return;
    const dir = sites[index];
    if (!isSiteDirItem(dir)) return;
    Modal.warning({
      title: t('deleteFolder'),
      content: t('confirmDeleteFolder', dir[SiteItemAlias.name]),
      onOk: () => {
        const next = [...sites];
        next.splice(index, 1, ...(dir[SiteItemAlias.children] ?? []));
        setSitesValue(next);
      },
    });
  };

  const handleReorder = useCallback(
    (activeId: string, ins: number) => {
      const index = sites.findIndex(item => getId(item) === activeId);
      if (index === -1) return;
      const rest = sites.filter(item => getId(item) !== activeId);
      rest.splice(ins, 0, sites[index]);
      setSitesValue(rest);
    },
    [sites, setSitesValue],
  );

  const handleMerge = useCallback(
    (activeId: string, targetId: string) => {
      const activeIndex = sites.findIndex(item => getId(item) === activeId);
      const mergeIndex = sites.findIndex(item => getId(item) === targetId);
      if (activeIndex === -1 || mergeIndex === -1) return;
      const activeItem = sites[activeIndex];
      const target = sites[mergeIndex];
      if (isSiteDirItem(activeItem)) return; // 文件夹不能塞进文件夹

      if (isSiteDirItem(target)) {
        // 2. 站点 → 已有文件夹
        const next = [...sites];
        next.splice(activeIndex, 1);
        const dirIndex = next.findIndex(item => getId(item) === targetId);
        next[dirIndex] = {
          ...target,
          [SiteItemAlias.children]: [
            ...(target[SiteItemAlias.children] ?? []),
            activeItem,
          ],
        };
        setSitesValue(next);
      } else {
        // 1. 站点 → 站点，新建文件夹（放在被放置项的原位置）
        const dir: SiteDirItem = {
          [SiteItemAlias.id]: nanoid(),
          [SiteItemAlias.name]: t('newFolder'),
          [SiteItemAlias.children]: [target, activeItem],
        };
        const next = [...sites];
        next[mergeIndex] = dir;
        next.splice(activeIndex, 1);
        setSitesValue(next);
      }
    },
    [sites, setSitesValue],
  );

  /** 只有「站点」能发起合并，文件夹不行（保证最多一层） */
  const canMerge = useCallback(
    (activeId: string) => {
      const item = sites.find(site => getId(site) === activeId);
      return !!item && !isSiteDirItem(item);
    },
    [sites],
  );

  const list = useDragList({
    ids: sites.map(getId),
    canMerge: (activeId, targetId) =>
      canMerge(activeId) && activeId !== targetId,
    onReorder: handleReorder,
    onMerge: handleMerge,
  });

  // 文件夹内部操作
  const editingDir = editingDirId
    ? sites.find(item => getId(item) === editingDirId)
    : undefined;

  const renderRootItem = (item: SiteNode) => {
    const id = getId(item);
    const isMerge = Boolean(list.drag?.armed && list.drag.targetId === id);

    if (isSiteDirItem(item)) {
      return (
        <DragRow
          key={id}
          id={id}
          type="dir"
          merge={isMerge}
          dragging={list.drag?.id === id}
          rowRef={el => list.setRowRef(id, el)}
          style={list.rowStyle(id)}
          onPointerDown={e => list.onPointerDown(e, id)}
        >
          <div className="item-content">
            <IconFolder size="large" className="site-icon-container" />
            <div className="item-info">
              <strong>{item[SiteItemAlias.name]}</strong>
            </div>
            <div className="item-actions">
              <Button icon={<IconEdit />} onClick={() => setEditingDirId(id)} />
              <Button
                type="danger"
                icon={<IconDelete />}
                onClick={() => handleDeleteDir(id)}
              />
            </div>
          </div>
        </DragRow>
      );
    }

    return (
      <DragRow
        key={id}
        id={id}
        type="site"
        merge={isMerge}
        dragging={list.drag?.id === id}
        rowRef={el => list.setRowRef(id, el)}
        style={list.rowStyle(id)}
        onPointerDown={e => list.onPointerDown(e, id)}
      >
        <div className="item-content">
          <SiteIcon site={item} />
          <div className="item-info">
            <div>
              <strong>{item[SiteItemAlias.name]}</strong>
            </div>
            <div className="url">{item[SiteItemAlias.url]}</div>
          </div>
          <div className="item-actions">
            <Button icon={<IconEdit />} onClick={() => handleEditSite(item)} />
            <Button
              type="danger"
              icon={<IconDelete />}
              onClick={() => handleDeleteSite(id)}
            />
          </div>
        </div>
      </DragRow>
    );
  };

  return (
    <div className="sites-manager-container">
      {editingDir && isSiteDirItem(editingDir) ? (
        <DirPanel
          dir={editingDir}
          onBack={() => setEditingDirId(null)}
          onRename={name =>
            updateDir(editingDir[SiteItemAlias.id], dir => ({
              ...dir,
              [SiteItemAlias.name]: name,
            }))
          }
          onReorder={(activeId, ins) => {
            const children = editingDir[SiteItemAlias.children] ?? [];
            const index = children.findIndex(
              child => getId(child) === activeId,
            );
            if (index === -1) return;
            const rest = children.filter(child => getId(child) !== activeId);
            rest.splice(ins, 0, children[index]);
            updateDir(editingDir[SiteItemAlias.id], dir => ({
              ...dir,
              [SiteItemAlias.children]: rest,
            }));
          }}
          onEditSite={handleEditSite}
          onMoveOut={site => {
            const dirId = editingDir[SiteItemAlias.id];
            const dirIndex = sites.findIndex(item => getId(item) === dirId);
            const next = [...sites];
            const dir = next[dirIndex] as SiteDirItem;
            next[dirIndex] = {
              ...dir,
              [SiteItemAlias.children]: (
                dir[SiteItemAlias.children] ?? []
              ).filter(child => getId(child) !== getId(site)),
            };
            next.splice(dirIndex + 1, 0, site);
            setSitesValue(next);
          }}
          onRemoveChild={site =>
            Modal.warning({
              title: t('deleteSite'),
              content: t('confirmDeleteSite', site[SiteItemAlias.name]),
              onOk: () => {
                removeIconCache(getId(site));
                updateDir(editingDir[SiteItemAlias.id], dir => ({
                  ...dir,
                  [SiteItemAlias.children]: (
                    dir[SiteItemAlias.children] ?? []
                  ).filter(child => getId(child) !== getId(site)),
                }));
              },
            })
          }
        />
      ) : (
        <>
          <div className="header">
            <Typography.Title heading={6}>
              {t('siteManagement')} ({sites.length})
            </Typography.Title>
            <Button icon={<IconPlus />} onClick={handleAddSite}>
              {t('add')}
            </Button>
          </div>

          <SiteIconContext.Provider value={iconContext}>
            <div className="drag-list" ref={list.containerRef}>
              <List
                dataSource={sites}
                split={false}
                renderItem={renderRootItem}
              />
              {list.indicatorTop !== null && (
                <div
                  className="drop-indicator"
                  style={{ top: list.indicatorTop }}
                />
              )}
            </div>
          </SiteIconContext.Provider>
        </>
      )}
    </div>
  );
});
