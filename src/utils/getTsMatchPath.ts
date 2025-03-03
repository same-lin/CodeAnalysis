import path from 'path'
import ts from 'typescript'
import * as tsConfigPaths from 'tsconfig-paths'
import * as fs from 'fs'
import { EXTENSIONS } from '../share/constant'

/**
 * 递归查找 tsconfig.json 文件
 * @param startPath 初始查找路径
 * @returns tsconfig.json 的路径或 null 如果未找到
 */
function findTsConfig(startPath: string): string | null {
  let currentDir = path.resolve(startPath)

  while (true) {
    const tsConfigPath = path.join(currentDir, 'tsconfig.json')
    if (fs.existsSync(tsConfigPath)) {
      return tsConfigPath
    }

    const parentDir = path.dirname(currentDir)
    if (parentDir === currentDir) {
      // 已经到达根目录
      break
    }
    currentDir = parentDir
  }

  return null
}

export const getTsMatchPath = (filePath: string) => {
  try {
    // 读取 tsconfig.json 文件并解析
    const configFileName = findTsConfig(filePath)
    if (!configFileName) throw new Error('! Could not find tsconfig.json')

    const configFile = ts.readConfigFile(configFileName, ts.sys.readFile)
    if (configFile.error) throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'))

    const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, './')

    // 获取 baseUrl 和 paths 配置
    const { baseUrl, paths } = parsedConfig.options
    if (!baseUrl || !paths)
      throw new Error("tsconfig.json must contain 'compilerOptions.baseUrl' and 'compilerOptions.paths'")

    // 创建路径映射解析器
    const matchPath = tsConfigPaths.createMatchPath(path.dirname(configFileName), paths)

    // test
    // console.log(matchPath('@utils/util.ts'));

    return (importPath: string) =>{ 
      const result = matchPath(importPath);
      if (result) {
        for(const ext of EXTENSIONS) {
          const matchFullPath = result + ext;
          if (fs.existsSync(matchFullPath)) {
            return matchFullPath;
          }
        }
      }
    }
  } catch (err) {
    console.error(err)
    return undefined;
  }
}
