import { formatPath } from '../utils/format';
import path from 'path'
import { parseFile } from '../utils/parse'
import fs from 'fs'
import { MatchPath } from 'tsconfig-paths'
import { EXTENSIONS } from '../share/constant'

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

export const getImportsByDfs = (filePath: string, imports?: Imports, tsMatch?: MatchPath) => {
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
          const targetImport = resolveFilePath(filePathName, im.text, tsMatch);
          return targetImport && formatPath(targetImport);
        }).filter((x: any) => x) || []
      importsObject[formatPath(filePathName)] = {
        lines,
        imports
      }
      imports.forEach((im) => getImportsByDfs(im, importsObject))
    }
  }
  return importsObject
}
