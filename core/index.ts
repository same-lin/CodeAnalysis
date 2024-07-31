import path from 'path';
import * as fs from 'fs';
import { getImportsByDfs } from './getImportsByDfs';
import { generateMermaid } from '../draw/generateMermaid';
import { getTsMatchPath } from '../utils/getTsMatchPath';


const draw = (filePath: string | string[]) => {
  const filePathList = (Array.isArray(filePath) ? filePath : [filePath]).filter((filePath) => fs.existsSync(filePath));
  if (filePathList.length === 0) {
    throw new Error('no filePaths found\n' + filePathList.map((filePath) => '  > ' + filePath + '\n').join(''))
  }
  const tsMatch = getTsMatchPath(filePath[0]);
  const importsObj = {}
  filePathList.forEach((filePath) => {
    getImportsByDfs(filePath, importsObj, tsMatch);
  })
  const result = importsObj;
  if (result) {
    const string = generateMermaid(result);
    console.log(string);
  } else {
    console.log('No imports');
  }
}

// console.log(require.main, module, require.main === module);
if (require.main === module) {
  const pathNameList = process.argv.slice(2);
  draw(pathNameList.map(pathName => path.resolve(process.cwd(), pathName)));
}
