import { Select, withField } from '@douyinfe/semi-ui';
import { SelectProps } from '@douyinfe/semi-ui/lib/es/select';
import isEqual from 'fast-deep-equal';
import { useCallback, useEffect, useState } from 'react';
import { hasFlag, packFlags } from '@/share/bool-flags';

interface BoolFlagsEditorProps
  extends Omit<
    SelectProps,
    'optionList' | 'value' | 'defaultValue' | 'onChange'
  > {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  optionList: Array<{
    label: string;
    flag: number;
  }>;
}

export const BoolFlagsEditor: React.FC<BoolFlagsEditorProps> = ({
  value,
  defaultValue,
  onChange,
  optionList,
  ...rest
}) => {
  const [state, setState] = useState<number[]>([]);

  const handleChange = useCallback((value: any) => {
    const v = value as number[];
    setState(v);
    onChange?.(packFlags(...optionList.map(x => v.includes(x.flag))));
  }, []);

  useEffect(() => {
    const newValue = optionList
      .filter(x => hasFlag(value ?? defaultValue ?? 0, x.flag))
      .map(x => x.flag);
    if (!isEqual(newValue, state)) {
      setState(newValue);
    }
  }, [value]);

  console.log(state, optionList, value);

  return (
    <Select
      {...rest}
      value={state}
      onChange={handleChange}
      multiple
      optionList={optionList.map(item => ({
        label: item.label,
        value: item.flag,
      }))}
    />
  );
};

export const BoolFlagsField = withField(BoolFlagsEditor);
