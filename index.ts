import * as ts from 'typescript';
import * as tsConfigPaths from 'tsconfig-paths';
import * as fs from 'fs';
import path from 'path';

const PROJECT_DIR = path.resolve(__dirname, './vue-project');

// 读取 tsconfig.json 文件并解析
const configFileName = ts.findConfigFile(
  PROJECT_DIR,
  ts.sys.fileExists,
  'tsconfig.json'
);

if (!configFileName) throw new Error('! Could not find tsconfig.json');

const configFile = ts.readConfigFile(configFileName, ts.sys.readFile);
console.log(configFile);

if (configFile.error)
  throw new Error(
    ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n')
  );

const parsedConfig = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  './'
);

console.log(parsedConfig.options);

// 获取 baseUrl 和 paths 配置
const { baseUrl, paths } = parsedConfig.options;
if (!baseUrl || !paths)
  throw new Error(
    "tsconfig.json must contain 'compilerOptions.baseUrl' and 'compilerOptions.paths'"
  );
console.log(baseUrl, paths);
// 创建路径映射解析器
const matchPath = tsConfigPaths.createMatchPath(
  path.resolve(PROJECT_DIR, baseUrl),
  paths
);

// 解析示例模块路径
const modulePath = '@utils/util.ts';
const resolvedPath = matchPath(modulePath);

if (resolvedPath) {
  console.log(`Resolved path for module '${modulePath}': ${resolvedPath}`);
} else {
  console.log(
    `Could not resolve path for module '${modulePath}' : ${resolvedPath}`
  );
}
