export const getExportName = () =>
  `nebula-shift-tab-${new Date().toLocaleString().replace(/[^0-9]/g, '-')}.json`;
