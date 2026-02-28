import { useRequest } from 'ahooks';
import jsonata from 'jsonata';
import { random } from 'lodash-es';
import { type FC, useState } from 'react';
import './JSONAtaTest.css';

const createJsonAta = (expr: string) => {
  const res = jsonata(expr);
  res.registerFunction(
    'array_rand',
    items => items[Math.floor(Math.random() * items.length)],
  );
  res.registerFunction('json_decode', item => JSON.parse(item));
  res.registerFunction('rand', (min, max) => random(min, max, false));
  return res;
};

interface JSONAtaTestProps {
  lang: {
    inputData: string;
    inputExpr: string;
    executing: string;
    error: string;
    result: string;
  };
}

const JSONAtaTest: FC<JSONAtaTestProps> = ({ lang }) => {
  const [data, setData] = useState('');
  const [expr, setExpr] = useState('');

  const {
    data: result,
    loading,
    error,
  } = useRequest(
    async () => {
      const e = createJsonAta(expr);
      return await e.evaluate(JSON.parse(data));
    },
    {
      manual: false,
      refreshDeps: [data, expr],
      debounceWait: 500,
      onError: e => console.error('run error', e),
    },
  );

  return (
    <div className="jsonata-test">
      <textarea
        value={data}
        onChange={e => setData(e.target.value)}
        placeholder={lang.inputData}
        rows={10}
      />
      <input
        type="text"
        value={expr}
        onChange={e => setExpr(e.target.value)}
        placeholder={lang.inputExpr}
      />
      {loading && (
        <div className="result">
          <div className="content">{lang.executing}</div>
        </div>
      )}
      {error && !loading && (
        <div className="result">
          <div className="title">{lang.error}</div>
          <div className="content">{error.message}</div>
        </div>
      )}
      {!error && !loading && result && (
        <div className="result">
          <div className="title">{lang.result}</div>
          <pre className="content">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default JSONAtaTest;
