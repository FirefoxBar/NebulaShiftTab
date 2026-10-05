import { createContext, useContext } from 'react';
import type { BaseBackup } from '../general/types';

export interface ImportAndExportContext {
  getExportContent: () => Promise<BaseBackup>;
  startImport: (content: BaseBackup) => void;
}

export const ImportAndExportContext = createContext<ImportAndExportContext>(
  {} as ImportAndExportContext,
);

export const useImportAndExportContext = () =>
  useContext(ImportAndExportContext);
