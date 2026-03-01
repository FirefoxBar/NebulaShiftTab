import { IconRefresh } from '@douyinfe/semi-icons';
import { Button } from '@douyinfe/semi-ui';
import { useRequest } from 'ahooks';
import { refreshBackground } from '@/share/api';

export const RefreshButton = () => {
  const { loading, run } = useRequest(refreshBackground, {
    manual: true,
  });

  return <Button onClick={run} icon={<IconRefresh />} loading={loading} />;
};
