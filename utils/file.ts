import * as fs from 'fs';
import path from 'path';
import glob from 'glob';

export const writeFile = function (filePath: string, content: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    console.log(dir);
    fs.mkdirSync(dir, { recursive: true });
  }
  console.log(dir, filePath);
  fs.writeFileSync(filePath, content);
};

// 输出内容到JS文件
export const writeJsFile = function (
  prc: string,
  content: string,
  fileName: string
) {
  try {
    fs.writeFileSync(
      path.join(process.cwd(), `${fileName}.js`),
      prc + JSON.stringify(content),
      'utf8'
    );
  } catch (e) {
    throw e;
  }
};
// 输出TS片段到TS文件
export const writeTsFile = function (content: string, fileName: string) {
  try {
    fs.writeFileSync(
      path.join(process.cwd(), `${fileName}.ts`),
      content,
      'utf8'
    );
  } catch (e) {
    throw e;
  }
};

// 扫描TS、TSX文件
export const scanFileTs = function (scanPath: string) {
  const tsFiles = glob.sync(path.join(process.cwd(), `${scanPath}/**/*.ts`));
  const tsxFiles = glob.sync(path.join(process.cwd(), `${scanPath}/**/*.tsx`));
  return tsFiles.concat(tsxFiles);
};

// 扫描VUE文件
export const scanFileVue = function (scanPath: string) {
  const entryFiles = glob.sync(
    path.join(process.cwd(), `${scanPath}/**/*.vue`)
  );
  // console.log(entryFiles);
  return entryFiles;
};

// 获取代码文件内容
export const getCode = function (fileName: string) {
  try {
    const code = fs.readFileSync(fileName, 'utf-8');
    // console.log(code);
    return code;
  } catch (e) {
    throw e;
  }
};

// 创建目录
export const mkDir = function (dirName: string) {
  try {
    fs.mkdirSync(path.join(process.cwd(), `/${dirName}`), 0o777);
  } catch (e) {
    throw e;
  }
};

// 删除指定目录及目录下所有文件
export const rmDir = function (dirName: string) {
  try {
    const dirPath = path.join(process.cwd(), `./${dirName}`);
    if (fs.existsSync(dirPath)) {
      // 判断给定的路径是否存在
      const files = fs.readdirSync(dirPath); // 返回文件和子目录的数组
      files.forEach(function (file) {
        var curPath = path.join(dirPath, file);

        if (fs.statSync(curPath).isDirectory()) {
          // 如果是文件夹，则继续
          rmDir(curPath);
        } else {
          fs.unlinkSync(curPath); // 如果是文件，则删除
        }
      });
      fs.rmdirSync(dirPath); // 清除文件夹
    }
  } catch (e) {
    throw e;
  }
};
