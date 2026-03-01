import {
  Button,
  List,
  Select,
  Slider,
  Typography,
  Upload,
} from '@douyinfe/semi-ui';
import type React from 'react';
import { useState } from 'react';
import Modal from '@/components/modal';
import usePref from '@/hooks/use-pref';
import { DefaultBackgroundEngines, StorageKey } from '@/share/constant';
import { t } from '@/share/locale';
import type { PrefValue } from '@/share/types';
import { CustomBg } from './custom-bg';

import './index.less';
import { BackgroundItemAlias } from '@/share/type-alias';

type BackgroundType = PrefValue['background']['type'];

export const BackgroundSetting: React.FC = () => {
  const [type, setType] = useState<BackgroundType>('builtin');
  const [background, setBackground] = usePref('background', {
    onInitial: (value: PrefValue['background']) => {
      setType(value.type);
    },
  });

  // 更新背景设置的辅助函数
  const updateBackground = (updates: Partial<typeof background>) => {
    setBackground({
      ...background,
      ...updates,
    });
  };

  // 处理本地图片上传
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const base64String = e.target?.result as string;
      chrome.storage.local.set({
        [StorageKey.bg]: base64String,
      });
      chrome.storage.local.remove(StorageKey.bgLastUpdate);
      updateBackground({
        type: 'image',
      });
    };
    reader.readAsDataURL(file);
    return false; // 阻止自动上传
  };

  return (
    <div className="background-setting">
      <List className="setting-list">
        <List.Item
          main={
            <div className="list-item">
              <Typography.Text className="title">
                {t('backgroundType')}
              </Typography.Text>
            </div>
          }
          extra={
            <Select
              value={type}
              placeholder={t('selectBackgroundType')}
              onChange={v => setType(v as BackgroundType)}
              style={{ width: '150px' }}
            >
              <Select.Option value="builtin">
                {t('builtinWallpaper')}
              </Select.Option>
              <Select.Option value="image">{t('localImage')}</Select.Option>
              <Select.Option value="custom">{t('custom')}</Select.Option>
            </Select>
          }
        />

        {type === 'builtin' && (
          <List.Item
            main={
              <div className="list-item">
                <Typography.Text className="title">
                  {t('builtinWallpaper')}
                </Typography.Text>
              </div>
            }
            extra={
              <Select
                value={background.key}
                placeholder={t('selectBuiltinWallpaper')}
                onChange={v =>
                  updateBackground({ type: 'builtin', key: v as string })
                }
                style={{ width: '200px' }}
              >
                {DefaultBackgroundEngines.map(engine => (
                  <Select.Option
                    key={engine[BackgroundItemAlias.key]}
                    value={engine[BackgroundItemAlias.key]}
                  >
                    {engine[BackgroundItemAlias.name]}
                  </Select.Option>
                ))}
              </Select>
            }
          />
        )}

        {type === 'image' && (
          <List.Item
            main={
              <div className="list-item">
                <Typography.Text className="title">
                  {t('localImage')}
                </Typography.Text>
              </div>
            }
            extra={
              <Upload
                accept="image/*"
                showUploadList={false}
                customRequest={({ file, onSuccess }) => {
                  handleImageUpload(file.fileInstance!);
                  onSuccess('success');
                }}
              >
                <Button>{t('selectImage')}</Button>
              </Upload>
            }
          />
        )}

        {type === 'custom' && (
          <List.Item
            main={
              <div className="list-item">
                <Typography.Text className="title">
                  {t('customBackground')}
                </Typography.Text>
              </div>
            }
            extra={
              <Button
                onClick={() => {
                  const m = Modal.info({
                    title: t('customBackground'),
                    content: (
                      <CustomBg
                        initialValue={background.value}
                        onSubmit={v => {
                          updateBackground({ type: 'custom', value: v });
                          m.destroy();
                        }}
                        onCancel={() => m.destroy()}
                      />
                    ),
                    footer: null,
                    icon: null,
                    closeOnEsc: false,
                    maskClosable: false,
                  });
                }}
              >
                {t('configure')}
              </Button>
            }
          />
        )}

        <List.Item
          main={
            <div className="list-item">
              <Typography.Text className="title">
                {t('backgroundDarkness')}
              </Typography.Text>
              <Typography.Text type="quaternary" className="content">
                {t('higherValueDarker')}
              </Typography.Text>
            </div>
          }
          extra={
            <div style={{ width: '200px', paddingLeft: '10px' }}>
              <Slider
                value={background.dark}
                min={0}
                max={99}
                onChange={v => updateBackground({ dark: v as number })}
                showTip={true}
              />
            </div>
          }
        />
      </List>
    </div>
  );
};
