import { IconUndo } from '@douyinfe/semi-icons';
import {
  Button,
  InputNumber,
  Slider as SemiSlider,
  Tooltip,
} from '@douyinfe/semi-ui';
import { ComponentProps, FC } from 'react';
import { t } from '@/share/locale';

import './slider.less';

type BaseSliderProps = ComponentProps<typeof SemiSlider>;

type SliderProps = Omit<
  BaseSliderProps,
  'value' | 'onChange' | 'defaultValue'
> &
  Required<Pick<BaseSliderProps, 'min' | 'max'>> & {
    value: number;
    onChange: (value: number) => void;
    defaultValue?: number;
  };

export const Slider: FC<SliderProps> = props => {
  const { min, max, value, onChange, className = '', defaultValue } = props;

  return (
    <div className={`slider ${className}`}>
      <SemiSlider
        {...props}
        onChange={onChange as BaseSliderProps['onChange']}
      />
      <div className="input">
        <InputNumber
          value={value}
          min={min}
          max={max}
          onChange={v => onChange(v as number)}
          size="small"
        />
        {typeof defaultValue === 'number' && (
          <Tooltip content={t('restoreDefault')}>
            <Button
              icon={<IconUndo />}
              size="small"
              onClick={() => onChange(defaultValue)}
            />
          </Tooltip>
        )}
      </div>
    </div>
  );
};
