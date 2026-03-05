import { DndContext, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS as cssDndKit } from '@dnd-kit/utilities';
import {
  IconDelete,
  IconEdit,
  IconPlus,
  IconTreeTriangleDown,
} from '@douyinfe/semi-icons';
import {
  Button,
  Dropdown,
  List,
  Modal,
  SplitButtonGroup,
  Typography,
} from '@douyinfe/semi-ui';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import usePref from '@/hooks/use-pref';
import { t } from '@/share/locale';
import { prefs } from '@/share/prefs';
import { SearchItemAlias } from '@/share/type-alias';
import type { SearchItem } from '@/share/types';
import { SearchEditForm } from './search-edit-form';

import './index.less';
import { searchEngines } from '@/share/constant';

// 拖拽项组件
const SortableItem = ({
  item,
  handleEditSearch,
  handleDeleteSearch,
}: {
  item: SearchItem;
  handleEditSearch: (search: SearchItem) => void;
  handleDeleteSearch: (key: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item[SearchItemAlias.key],
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
        <div className="item-info">{item[SearchItemAlias.name]}</div>
        <div className="item-actions">
          <Button onClick={() => handleEditSearch(item)} icon={<IconEdit />} />
          <Button
            type="danger"
            onClick={() => handleDeleteSearch(item[SearchItemAlias.key])}
            icon={<IconDelete />}
          />
        </div>
      </div>
    </div>
  );
};

export const SearchManager: React.FC = () => {
  const [editingSearch, setEditingSearch] = useState<SearchItem | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searches, setSearches] = usePref('searches');

  // 添加搜索
  const handleAddSearch = () => {
    setEditingSearch(undefined);
    setIsModalOpen(true);
  };

  // 编辑搜索
  const handleEditSearch = (search: SearchItem) => {
    setEditingSearch({ ...search });
    setIsModalOpen(true);
  };

  // 删除搜索
  const handleDeleteSearch = (key: string) => {
    const newSearches = [...searches];
    const index = newSearches.findIndex(
      search => search[SearchItemAlias.key] === key,
    );
    if (index === -1) {
      return;
    }
    Modal.warning({
      title: t('deleteSearchEngine'),
      content: t(
        'confirmDeleteSearchEngine',
        newSearches[index][SearchItemAlias.name],
      ),
      onOk: () => {
        newSearches.splice(index, 1);
        setSearches(newSearches);
      },
    });
  };

  // 保存搜索
  const handleSaveSearch = (updatedSearch: SearchItem) => {
    if (!updatedSearch[SearchItemAlias.key]) {
      updatedSearch[SearchItemAlias.key] = nanoid();
    }
    const newSearches = [...searches];
    const index = newSearches.findIndex(
      search =>
        search[SearchItemAlias.key] === updatedSearch[SearchItemAlias.key],
    );

    if (index !== -1) {
      newSearches[index] = updatedSearch;
    } else {
      // 添加新搜索
      newSearches.push(updatedSearch);
    }

    setSearches(newSearches);
    setEditingSearch(undefined);
    setIsModalOpen(false);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingSearch(undefined);
    setIsModalOpen(false);
  };

  // 拖拽结束处理
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = searches.findIndex(
        search => search[SearchItemAlias.key] === active.id,
      );
      const newIndex = searches.findIndex(
        search => search[SearchItemAlias.key] === over.id,
      );

      const newSearches = arrayMove(searches, oldIndex, newIndex);
      setSearches(newSearches);
      prefs.set('searches', newSearches);
    }
  };

  // 初始化鼠标传感器
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 1 },
    }),
  );

  return (
    <div className="searches-manager-container">
      <Modal
        title={
          editingSearch?.[SearchItemAlias.key]
            ? t('editSearchEngine')
            : t('addSearchEngine')
        }
        visible={isModalOpen}
        footer={null}
        onCancel={handleCancelEdit}
        width={600}
        maskClosable={false}
        closeOnEsc={false}
      >
        <SearchEditForm
          initialData={editingSearch || undefined}
          onSave={handleSaveSearch}
          onCancel={handleCancelEdit}
        />
      </Modal>

      <div className="header">
        <Typography.Title heading={6}>
          {t('searchManagement')} ({searches.length})
        </Typography.Title>
        <SplitButtonGroup>
          <Button icon={<IconPlus />} onClick={handleAddSearch}>
            {t('add')}
          </Button>
          <Dropdown
            menu={searchEngines.map(x => ({
              node: 'item',
              name: x[SearchItemAlias.name],
              onClick: () =>
                handleSaveSearch({ ...x, [SearchItemAlias.key]: '' }),
            }))}
            trigger="click"
            position="bottomRight"
          >
            <Button type="primary" icon={<IconTreeTriangleDown />} />
          </Dropdown>
        </SplitButtonGroup>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext
          items={searches.map(search => search[SearchItemAlias.key])}
          strategy={verticalListSortingStrategy}
        >
          <List
            dataSource={searches}
            split={false}
            renderItem={item => (
              <SortableItem
                key={item[SearchItemAlias.key]}
                item={item}
                handleEditSearch={handleEditSearch}
                handleDeleteSearch={handleDeleteSearch}
              />
            )}
          />
        </SortableContext>
      </DndContext>
    </div>
  );
};
