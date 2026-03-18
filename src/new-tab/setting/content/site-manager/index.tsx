import { DndContext, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS as cssDndKit } from '@dnd-kit/utilities';
import { IconDelete, IconEdit, IconPlus } from '@douyinfe/semi-icons';
import { Button, List, Modal, Typography } from '@douyinfe/semi-ui';
import { withErrorBoundary } from '@/components/error-boundary';
import { SiteIcon } from '@/components/site-icon';
import {
  SiteIconContext,
  useSiteIconContext,
} from '@/components/site-icon-context';
import usePref from '@/hooks/use-pref';
import { StorageKey } from '@/share/constant';
import { t } from '@/share/locale';
import { prefs } from '@/share/prefs';
import { SiteItemAlias } from '@/share/type-alias';
import type { SiteItem } from '@/share/types';
import { showSiteEditModal } from './site-edit-modal';

import './index.less';

// 拖拽项组件
const SortableItem = ({
  item,
  handleEditSite,
  handleDeleteSite,
}: {
  item: SiteItem;
  handleEditSite: (site: SiteItem) => void;
  handleDeleteSite: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item[SiteItemAlias.id],
  });

  const style = {
    transform: cssDndKit.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`list-item ${isDragging ? 'dragging' : ''}`}
      {...listeners}
      {...attributes}
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
          <Button onClick={() => handleEditSite(item)} icon={<IconEdit />} />
          <Button
            type="danger"
            onClick={() => handleDeleteSite(item[SiteItemAlias.id])}
            icon={<IconDelete />}
          />
        </div>
      </div>
    </div>
  );
};

export const SitesManager = withErrorBoundary(() => {
  const [sites, setSites] = usePref('sites');

  // 添加站点
  const handleAddSite = () => showSiteEditModal({});

  // 编辑站点
  const handleEditSite = (site: SiteItem) =>
    showSiteEditModal({
      initialData: { ...site },
    });

  // 删除站点
  const handleDeleteSite = (id: string) => {
    const newSites = [...sites];
    const index = newSites.findIndex(site => site[SiteItemAlias.id] === id);
    if (index === -1) {
      return;
    }
    Modal.warning({
      title: t('deleteSite'),
      content: t('confirmDeleteSite', newSites[index][SiteItemAlias.name]),
      onOk: () => {
        chrome.storage.local.remove(`${StorageKey.siteIcon}_${id}`);
        newSites.splice(index, 1);
        setSites(newSites);
      },
    });
  };

  // 拖拽结束处理
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sites.findIndex(
        site => site[SiteItemAlias.id] === active.id,
      );
      const newIndex = sites.findIndex(
        site => site[SiteItemAlias.id] === over.id,
      );

      const newSites = arrayMove(sites, oldIndex, newIndex);
      setSites(newSites);
      prefs.set('sites', newSites);
    }
  };

  // 初始化鼠标传感器
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 1 },
    }),
  );

  const iconContext = useSiteIconContext();

  return (
    <div className="sites-manager-container">
      <div className="header">
        <Typography.Title heading={6}>
          {t('siteManagement')} ({sites.length})
        </Typography.Title>
        <Button icon={<IconPlus />} onClick={handleAddSite}>
          {t('add')}
        </Button>
      </div>

      <SiteIconContext.Provider value={iconContext}>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext
            items={sites.map(site => site[SiteItemAlias.id])}
            strategy={verticalListSortingStrategy}
          >
            <List
              dataSource={sites}
              split={false}
              renderItem={item => (
                <SortableItem
                  key={item[SiteItemAlias.id]}
                  item={item}
                  handleEditSite={handleEditSite}
                  handleDeleteSite={handleDeleteSite}
                />
              )}
            />
          </SortableContext>
        </DndContext>
      </SiteIconContext.Provider>
    </div>
  );
});
