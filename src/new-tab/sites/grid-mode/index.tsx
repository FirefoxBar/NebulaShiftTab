import { type ModeShellContent, withModeShell } from '../mode-shell';
import { SiteNodeView } from '../site-node-view';
import { gridCellKey, useGridLayout } from './use-grid-layout';

import './index.less';

const GridNormal = ({ showName }: ModeShellContent) => {
  const { cells, nodeById } = useGridLayout();

  return (
    <div className="sites sites-grid">
      {cells.map((id, index) => {
        const node = id ? nodeById.get(id) : null;
        const key = gridCellKey(id, index);
        if (!node) {
          return <div key={key} className="grid-cell empty" />;
        }
        return (
          <div className="grid-cell" key={key}>
            <SiteNodeView site={node} showName={showName} />
          </div>
        );
      })}
    </div>
  );
};

export const GridMode = withModeShell('grid', GridNormal);

export default GridMode;
