import { formatPath } from '../utils/format';
import path from 'path'
import { parseFile } from '../utils/parse'
import fs from 'fs'
import { MatchPath } from 'tsconfig-paths'
import { EXTENSIONS, INCLUDES } from '../share/constant'
import { minimatch } from 'minimatch';

export interface ImportNode {
  lines: number
  imports: string[]
}
export type Imports = Record<string, ImportNode>

const resolveFilePath = (curPath: string, importPath: string, tsMatch?: MatchPath) => {
  const matchPath = tsMatch?.(importPath)
  if (matchPath) {
    return matchPath
  }

  for (const ext of EXTENSIONS) {
    const fullPath = path.resolve(path.dirname(curPath), `${importPath}${ext}`)
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return fullPath
    }
  }
  return null
}

const isPathValid = (fullPath: string, patterns?: string[]) => {
  return (patterns || INCLUDES).some(pattern => minimatch(fullPath, pattern)) && fs.existsSync(fullPath);
}

export const getImportsByDfs = (filePath: string, imports: Imports, config: {
  includes?: string[];
  tsMatch?: MatchPath;
}) => {
  const importsObject = imports || {}
  const filePathName = formatPath(filePath);
  if (importsObject[filePathName]) {
    return
  }
  if (fs.existsSync(filePathName)) {
    const result = parseFile(filePathName)
    if (result) {
      const lines = result.fileInfo.lines
      const imports: string[] =
        // @ts-ignore
        result.ast?.imports.map((im) => {
          const targetImport = resolveFilePath(filePathName, im.text, config.tsMatch);
          return targetImport && isPathValid(targetImport, config.includes) && formatPath(targetImport);
        }).filter((x: any) => x) || []
      importsObject[filePathName] = {
        lines,
        imports
      }
      imports.forEach((im) => getImportsByDfs(im, importsObject, config))
    }
  }
  return importsObject
}
