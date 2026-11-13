import { DndContext, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
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
  List,
  Modal,
  Popover,
  SplitButtonGroup,
  Typography,
} from '@douyinfe/semi-ui';
import { useState } from 'react';
import { withErrorBoundary } from '@/components/error-boundary';
import { useSearches } from '@/hooks/use-searches';
import { searchEngines } from '@/share/constant';
import { t } from '@/share/locale';
import { SearchItemAlias } from '@/share/type-alias';
import type { SearchItem } from '@/share/types';
import { SearchEditForm } from './search-edit-form';

import './index.less';

const groupSearchEngines = (keys: string[]) =>
  searchEngines.filter(x => keys.includes(x[SearchItemAlias.key]));

const engineCategories = {
  common: {
    label: t('searchEngineCategoryCommon'),
    items: ['bing-cn', 'baidu', 'qq', '360', 'douyin-so'],
  },
  commonGlobal: {
    label: t('searchEngineCategoryCommonGlobal'),
    items: ['google', 'bing', 'duckduckgo', 'brave'],
  },
  social: {
    label: t('searchEngineCategorySocial'),
    items: ['douyin-web', 'xiaohongshu', 'bilibili', 'youtube'],
  },
  shopping: {
    label: t('searchEngineCategoryShopping'),
    items: ['taobao', 'jd'],
  },
  developer: {
    label: t('searchEngineCategoryDeveloper'),
    items: ['github', 'mdn'],
  },
};

const categoryGroups = Object.values(engineCategories).map(category => ({
  title: category.label,
  engines: groupSearchEngines(category.items),
}));

// 未归类的内置引擎追加到第一个分组，避免新增引擎在快速添加中缺失
const categorizedKeys = new Set(
  Object.values(engineCategories).flatMap(category => category.items),
);
const ungroupedEngines = searchEngines.filter(
  x => !categorizedKeys.has(x[SearchItemAlias.key]),
);
if (categoryGroups.length > 0) {
  categoryGroups[0].engines.push(...ungroupedEngines);
} else if (ungroupedEngines.length > 0) {
  categoryGroups.push({
    title: t('searchEngineCategoryOther'),
    engines: ungroupedEngines,
  });
}

const quickAddGroups = categoryGroups.filter(group => group.engines.length > 0);

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

export const SearchManager = withErrorBoundary(() => {
  const {
    items,
    searches,
    getSearchForEdit,
    saveSearch,
    addDefaultSearch,
    deleteSearch,
    moveSearch,
  } = useSearches();
  const [editingSearch, setEditingSearch] = useState<SearchItem | undefined>();
  const [editingDefaultKey, setEditingDefaultKey] = useState<
    string | undefined
  >();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => {
    setEditingSearch(undefined);
    setEditingDefaultKey(undefined);
    setIsModalOpen(false);
  };

  // 添加搜索
  const handleAddSearch = () => {
    setEditingSearch(undefined);
    setEditingDefaultKey(undefined);
    setIsModalOpen(true);
  };

  // 编辑搜索
  const handleEditSearch = (search: SearchItem) => {
    const editData = getSearchForEdit(search[SearchItemAlias.key]);
    if (!editData) {
      return;
    }
    setEditingSearch({ ...editData.search });
    setEditingDefaultKey(editData.defaultKey);
    setIsModalOpen(true);
  };

  // 删除搜索
  const handleDeleteSearch = (key: string) => {
    const search = searches.find(x => x[SearchItemAlias.key] === key);
    if (!search) {
      return;
    }
    Modal.warning({
      title: t('deleteSearchEngine'),
      content: t('confirmDeleteSearchEngine', search[SearchItemAlias.name]),
      onOk: () => deleteSearch(key),
    });
  };

  // 保存搜索
  const handleSaveSearch = (search: SearchItem) => {
    saveSearch(search, editingDefaultKey);
    closeModal();
  };

  // 拖拽结束处理
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = items.findIndex(
      search => search[SearchItemAlias.key] === active.id,
    );
    const newIndex = items.findIndex(
      search => search[SearchItemAlias.key] === over.id,
    );
    moveSearch(oldIndex, newIndex);
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
        onCancel={closeModal}
        width={600}
        maskClosable={false}
        closeOnEsc={false}
      >
        <SearchEditForm
          initialData={editingSearch || undefined}
          onSave={handleSaveSearch}
          onCancel={closeModal}
        />
      </Modal>

      <div className="header">
        <Typography.Title heading={6}>
          {t('searchEngine')} ({searches.length})
        </Typography.Title>
        <SplitButtonGroup>
          <Button icon={<IconPlus />} onClick={handleAddSearch}>
            {t('add')}
          </Button>
          <Popover
            trigger="hover"
            position="bottomRight"
            content={
              <div className="quick-add-popover">
                {quickAddGroups.map(group => (
                  <div className="quick-add-group" key={group.title}>
                    <div className="quick-add-group-title">{group.title}</div>
                    <div className="quick-add-group-items">
                      {group.engines.map(engine => (
                        <Button
                          key={engine[SearchItemAlias.key]}
                          theme="outline"
                          type="tertiary"
                          onClick={() => addDefaultSearch(engine)}
                        >
                          {engine[SearchItemAlias.name]}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            <Button type="primary" icon={<IconTreeTriangleDown />} />
          </Popover>
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
});
