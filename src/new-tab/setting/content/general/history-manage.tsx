import { IconDelete, IconSetting } from '@douyinfe/semi-icons';
import { Button, Table, Toast } from '@douyinfe/semi-ui';
import Modal from '@/components/modal';
import { useReadStorage } from '@/hooks/use-storage';
import { getSyncStorage } from '@/share/storage';
import { isValidArray } from '@/share/utils';

interface HistoryItem {
  value: string;
}
const Content = () => {
  const history = useReadStorage<HistoryItem[]>(
    chrome.storage.sync,
    'searchHistory',
    [],
    value =>
      value.map((item: string) => ({
        value: item,
      })),
  );

  return (
    <div>
      <Table
        dataSource={history}
        pagination={false}
        size="small"
        columns={[
          {
            title: '搜索历史',
            dataIndex: 'value',
          },
          {
            title: '操作',
            dataIndex: 'action',
            render: (_, record) => (
              <Button
                icon={<IconDelete />}
                onClick={async () => {
                  const currentHistory = await getSyncStorage('searchHistory');
                  if (Array.isArray(currentHistory)) {
                    currentHistory.splice(
                      currentHistory.indexOf(record.value),
                      1,
                    );
                    await chrome.storage.sync.set({
                      searchHistory: currentHistory,
                    });
                  }
                }}
              />
            ),
          },
        ]}
      />
      <Button
        style={{ marginTop: 12 }}
        type="primary"
        disabled={history.length === 0}
        onClick={() => chrome.storage.sync.set({ searchHistory: [] })}
      >
        清空历史记录
      </Button>
    </div>
  );
};

export const HistoryManage = () => {
  return (
    <Button
      icon={<IconSetting />}
      onClick={async () => {
        const history = await getSyncStorage('searchHistory');
        if (!isValidArray(history)) {
          Toast.error('历史记录为空');
          return;
        }
        Modal.confirm({
          title: '搜索历史管理',
          icon: null,
          content: <Content />,
          hasCancel: false,
        });
      }}
    />
  );
};
