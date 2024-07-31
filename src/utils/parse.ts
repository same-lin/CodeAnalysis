import tsCompiler from 'typescript';
import * as vueCompiler from '@vue/compiler-dom';
import { md5 } from 'js-md5';
import { getCode, writeFile, writeTsFile } from './file';
import path from 'path';

const VUETEMPTSDIR = 'templates-vue-ts';

// 解析ts文件代码，获取ast，checker
export const parseTs = function (fileName: string) {
  // 将ts代码转化为AST
  const program = tsCompiler.createProgram([fileName], {});
  const ast = program.getSourceFile(fileName);
  const checker = program.getTypeChecker();
  return {
    ast,
    checker,
    fileInfo: {
      lines: ast?.text.split('\n').length ?? 0,
    },
  };
};

// 解析vue文件中的ts script片段，解析获取ast，checker
export const parseVue = function (fileName: string) {
  // 获取vue代码
  const vueCode = getCode(fileName);
  // 解析vue代码
  const result = vueCompiler.parse(vueCode);
  const children = result.children as vueCompiler.BaseElementNode[];
  // 获取script片段
  let tsCode = '';
  let baseLine = 0;
  children.forEach((element) => {
    if (element.tag == 'script') {
      // @ts-expect-error
      tsCode = element.children[0].content;
      baseLine = element.loc.start.line - 1;
    }
  });
  // 将ts片段写入临时目录下的ts文件中
  const ts_hash_name = md5.hex(fileName);
  const vue_temp_ts_name = path.join(
    process.cwd(),
    `${VUETEMPTSDIR}/${ts_hash_name}.ts`
  );
  writeFile(vue_temp_ts_name, tsCode);

  // 将ts代码转化为AST
  const program = tsCompiler.createProgram([vue_temp_ts_name], {});
  const ast = program.getSourceFile(vue_temp_ts_name);
  const checker = program.getTypeChecker();
  // console.log(ast);
  return {
    ast,
    checker,
    tsCode,
    fileInfo: {
      lines: children
        .filter((child) => child.tag === 'script' || child.tag === 'template')
        .map((child) => child.loc.end.line - child.loc.start.line)
        .reduce((a, b) => a + b, 0),
    },
  };
};

export const parseFile = function (fileName: string) {
  if (fileName.endsWith('.ts') || fileName.endsWith('.tsx')) {
    return parseTs(fileName);
  } else if (fileName.endsWith('.vue')) {
    return parseVue(fileName);
  }
};
