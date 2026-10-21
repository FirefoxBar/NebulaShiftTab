import { type ModeShellContent, withModeShell } from '../mode-shell';
import { SiteNodeView } from '../site-node-view';
import { getId } from '../site-ops';

/** `.sites` 基础样式（含文件夹弹层）两种模式共用，常驻加载 */
import './index.less';

const FlexNormal = ({ sites, showName }: ModeShellContent) => (
  <div className="sites">
    {sites.map(site => (
      <SiteNodeView key={getId(site)} site={site} showName={showName} />
    ))}
  </div>
);

export const FlexMode = withModeShell('flex', FlexNormal);

export default FlexMode;
