import path from 'path';
import { parseFile } from '../utils/parse';
import fs from 'fs';

export interface ImportNode {
  lines: number;
  imports: string[];
}
export type Imports = Record<string, ImportNode>;

export const getImportsByDfs = (filePath: string, imports?: Imports) => {
  const importsObject = imports || {};
  if (importsObject[filePath]) {
    return;
  }
  if (fs.existsSync(filePath)) {
    const result = parseFile(filePath);
    if (result) {
      const lines = result.fileInfo.lines;
      const imports: string[] =
        // @ts-ignore
        result.ast?.imports.map((im) =>
          path.resolve(path.dirname(filePath), im.text)
        ) || [];
      importsObject[filePath] = {
        lines,
        imports,
      };
      imports.forEach((im) => getImportsByDfs(im, importsObject));
    }
  }
  return importsObject;
};
