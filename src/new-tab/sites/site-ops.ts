import { nanoid } from 'nanoid';
import { StorageKey } from '@/share/constant';
import { t } from '@/share/locale';
import { prefs } from '@/share/prefs';
import { SiteItemAlias } from '@/share/type-alias';
import {
  isSiteDirItem,
  type SiteDirItem,
  type SiteItem,
  type SiteNode,
} from '@/share/types';

export const getId = (item: SiteNode) => item[SiteItemAlias.id];

export const removeIconCache = (id: string) =>
  chrome.storage.local.remove(`${StorageKey.siteIcon}_${id}`);

export const getSites = (): SiteNode[] => prefs.get('sites') ?? [];

export const setSites = (sites: SiteNode[]) => prefs.set('sites', sites);

/** 以最新值为准做一次更新，避免闭包里的 stale sites */
export const updateSites = (updater: (sites: SiteNode[]) => SiteNode[]) =>
  setSites(updater(getSites()));

export const findNode = (sites: SiteNode[], id: string) =>
  sites.find(item => getId(item) === id);

// ---------------------------------------------------------------------------
// 根级排序 / 合并
// ---------------------------------------------------------------------------

/** ins 是「去掉 active 之后的数组」里的插入下标 */
export const reorderRoot = (activeId: string, ins: number) =>
  updateSites(sites => {
    const index = sites.findIndex(item => getId(item) === activeId);
    if (index === -1) return sites;
    const rest = sites.filter(item => getId(item) !== activeId);
    rest.splice(ins, 0, sites[index]);
    return rest;
  });

/** 只有「站点」能发起合并，文件夹不行（保证最多一层） */
export const canMergeRoot = (activeId: string, targetId: string) => {
  if (activeId === targetId) return false;
  const active = findNode(getSites(), activeId);
  return !!active && !isSiteDirItem(active);
};

export interface MergeNodesResult {
  sites: SiteNode[];
  /** 新建出来的文件夹 id；目标本身就是文件夹时为 undefined */
  dirId?: string;
}

/**
 * 把 src 并进 dst（根级拖拽合并与 grid 拖放共用的三条规则）：
 * - dst 是文件夹 → src 追加为它的子项；
 * - dst 是站点 → 在 dst 的位置新建文件夹装下两者；
 * - src 是文件夹 → 不允许（保证最多一层）。
 * 条件不满足时返回 null。
 */
export const mergeNodes = (
  sites: SiteNode[],
  srcId: string,
  dstId: string,
): MergeNodesResult | null => {
  if (srcId === dstId) return null;
  const srcIndex = sites.findIndex(item => getId(item) === srcId);
  const dstIndex = sites.findIndex(item => getId(item) === dstId);
  if (srcIndex === -1 || dstIndex === -1) return null;

  const srcNode = sites[srcIndex];
  const dstNode = sites[dstIndex];
  if (isSiteDirItem(srcNode)) return null;

  const next = [...sites];
  if (isSiteDirItem(dstNode)) {
    // 站点 → 已有文件夹
    next.splice(srcIndex, 1);
    const dirIndex = next.findIndex(item => getId(item) === dstId);
    next[dirIndex] = {
      ...dstNode,
      [SiteItemAlias.children]: [
        ...(dstNode[SiteItemAlias.children] ?? []),
        srcNode,
      ],
    };
    return { sites: next };
  }

  // 站点 → 站点，新建文件夹（放在被放置项的原位置）
  const dir: SiteDirItem = {
    [SiteItemAlias.id]: nanoid(),
    [SiteItemAlias.name]: t('newFolder'),
    [SiteItemAlias.children]: [dstNode, srcNode],
  };
  next[dstIndex] = dir;
  next.splice(srcIndex, 1);
  return { sites: next, dirId: dir[SiteItemAlias.id] };
};

export const mergeRoot = (activeId: string, targetId: string) =>
  updateSites(sites => mergeNodes(sites, activeId, targetId)?.sites ?? sites);

// ---------------------------------------------------------------------------
// 文件夹
// ---------------------------------------------------------------------------

export const updateDirNode = (
  dirId: string,
  updater: (dir: SiteDirItem) => SiteDirItem,
) =>
  updateSites(sites =>
    sites.map(item =>
      getId(item) === dirId && isSiteDirItem(item) ? updater(item) : item,
    ),
  );

export const renameDir = (dirId: string, name: string) =>
  updateDirNode(dirId, dir => ({ ...dir, [SiteItemAlias.name]: name }));

export const reorderInDir = (dirId: string, activeId: string, ins: number) =>
  updateDirNode(dirId, dir => {
    const children = dir[SiteItemAlias.children] ?? [];
    const index = children.findIndex(child => getId(child) === activeId);
    if (index === -1) return dir;
    const rest = children.filter(child => getId(child) !== activeId);
    rest.splice(ins, 0, children[index]);
    return { ...dir, [SiteItemAlias.children]: rest };
  });

/** 把站点从文件夹里拿出来，插到文件夹后面 */
export const moveOutOfDir = (dirId: string, siteId: string) =>
  updateSites(sites => {
    const dirIndex = sites.findIndex(item => getId(item) === dirId);
    if (dirIndex === -1) return sites;
    const dir = sites[dirIndex];
    if (!isSiteDirItem(dir)) return sites;
    const child = (dir[SiteItemAlias.children] ?? []).find(
      c => getId(c) === siteId,
    );
    if (!child) return sites;
    const next = [...sites];
    next[dirIndex] = {
      ...dir,
      [SiteItemAlias.children]: (dir[SiteItemAlias.children] ?? []).filter(
        c => getId(c) !== siteId,
      ),
    };
    next.splice(dirIndex + 1, 0, child);
    return next;
  });

export const removeChildFromDir = (dirId: string, siteId: string) =>
  updateDirNode(dirId, dir => ({
    ...dir,
    [SiteItemAlias.children]: (dir[SiteItemAlias.children] ?? []).filter(
      c => getId(c) !== siteId,
    ),
  }));

// ---------------------------------------------------------------------------
// 删除（确认弹窗由调用方处理，这里只做数据）
// ---------------------------------------------------------------------------

export const deleteSiteNode = (id: string) => {
  removeIconCache(id);
  updateSites(sites =>
    sites
      .filter(item => getId(item) !== id)
      .map(item =>
        isSiteDirItem(item)
          ? {
              ...item,
              [SiteItemAlias.children]: (
                item[SiteItemAlias.children] ?? []
              ).filter(c => getId(c) !== id),
            }
          : item,
      ),
  );
};

/** 删除文件夹：把子站点平铺回原位置，避免数据丢失 */
export const deleteDirNode = (id: string) =>
  updateSites(sites => {
    const index = sites.findIndex(item => getId(item) === id);
    if (index === -1) return sites;
    const dir = sites[index];
    if (!isSiteDirItem(dir)) return sites;
    const next = [...sites];
    next.splice(index, 1, ...(dir[SiteItemAlias.children] ?? []));
    return next;
  });

export type { SiteItem, SiteDirItem, SiteNode };
