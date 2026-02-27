import { DndContext, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS as cssDndKit } from '@dnd-kit/utilities';
import { IconPlus } from '@douyinfe/semi-icons';
import { Button, List, Modal, Typography } from '@douyinfe/semi-ui';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import { SiteIcon } from '@/components/site-icon';
import {
  SiteIconContext,
  useSiteIconContext,
} from '@/components/site-icon-context';
import usePref from '@/hooks/use-pref';
import { prefs } from '@/share/prefs';
import type { SiteItem } from '@/share/types';
import { SiteEditForm } from './SiteEditForm';

import './index.less';
import { StorageKey } from '@/share/constant';

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
    id: item.id,
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
            <strong>{item.name}</strong>
          </div>
          <div>{item.url}</div>
        </div>
        <div className="item-actions">
          <Button size="small" onClick={() => handleEditSite(item)}>
            编辑
          </Button>
          <Button
            size="small"
            type="danger"
            onClick={() => handleDeleteSite(item.id)}
          >
            删除
          </Button>
        </div>
      </div>
    </div>
  );
};

export const SitesManager: React.FC = () => {
  const [editingSite, setEditingSite] = useState<SiteItem | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sites, setSites] = usePref('sites');

  // 添加站点
  const handleAddSite = () => {
    setEditingSite(undefined);
    setIsModalOpen(true);
  };

  // 编辑站点
  const handleEditSite = (site: SiteItem) => {
    setEditingSite({ ...site });
    setIsModalOpen(true);
  };

  // 删除站点
  const handleDeleteSite = (id: string) => {
    const newSites = [...sites];
    const index = newSites.findIndex(site => site.id === id);
    if (index === -1) {
      return;
    }
    Modal.warning({
      title: '删除站点',
      content: `确定要删除 "${newSites[index].name}" 吗？`,
      onOk: () => {
        chrome.storage.local.remove(`${StorageKey.siteIcon}_${id}`);
        newSites.splice(index, 1);
        setSites(newSites);
      },
    });
  };

  // 保存站点
  const handleSaveSite = (updatedSite: SiteItem) => {
    if (!updatedSite.id) {
      updatedSite.id = nanoid();
    }
    const newSites = [...sites];
    const index = newSites.findIndex(site => site.id === updatedSite.id);

    if (index !== -1) {
      newSites[index] = updatedSite;
    } else {
      // 添加新站点
      newSites.push(updatedSite);
    }

    newSites.forEach(site => {
      if (
        ['local', 'custom'].includes(site.iconType) &&
        site.icon.startsWith('data:image/')
      ) {
        chrome.storage.local.set({
          [`${StorageKey.siteIcon}_${site.id}`]: site.icon,
        });
        site.iconType = 'local';
        site.icon = '';
      }
    });

    console.log('newSites', newSites);

    setSites(newSites);
    setEditingSite(undefined);
    setIsModalOpen(false);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingSite(undefined);
    setIsModalOpen(false);
  };

  // 拖拽结束处理
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sites.findIndex(site => site.id === active.id);
      const newIndex = sites.findIndex(site => site.id === over.id);

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
      <Modal
        title={editingSite?.id ? '编辑站点' : '添加站点'}
        visible={isModalOpen}
        footer={null}
        onCancel={handleCancelEdit}
        width={500}
        maskClosable={false}
        closeOnEsc={false}
      >
        <SiteEditForm
          initialData={editingSite || undefined}
          onSave={handleSaveSite}
          onCancel={handleCancelEdit}
        />
      </Modal>

      <div className="header">
        <Typography.Title heading={6}>
          站点管理 ({sites.length})
        </Typography.Title>
        <Button icon={<IconPlus />} onClick={handleAddSite}>
          添加
        </Button>
      </div>

      <SiteIconContext.Provider value={iconContext}>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext
            items={sites.map(site => site.id)}
            strategy={verticalListSortingStrategy}
          >
            <List
              dataSource={sites}
              split={false}
              renderItem={item => (
                <SortableItem
                  key={item.id}
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
};
