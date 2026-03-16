import { useRafInterval } from 'ahooks';
import { useState } from 'react';
import dayjs from '@/share/dayjs';
import { prefs } from '@/share/prefs';

const Content = () => {
  const [text, setText] = useState('');
  const [text2, setText2] = useState('');

  useRafInterval(
    () => {
      const d = dayjs();
      const format = prefs.get('timeFormat');
      setText(format ? d.format(format) : '');
      const dateFormat = prefs.get('dateFormat');
      setText2(dateFormat ? d.format(dateFormat) : '');
    },
    1000,
    {
      immediate: true,
    },
  );

  return (
    <>
      <div className="content">{text}</div>
      <div className="sub-content">{text2}</div>
    </>
  );
};

export default Content;
