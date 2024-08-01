import path from 'path';
import * as fs from 'fs';
import { getImportsByDfs } from './getImportsByDfs';
import { generateMermaid } from '../draw/generateMermaid';
import { getTsMatchPath } from '../utils/getTsMatchPath';
import { Command } from 'commander';

interface CommandOption {
  includes?: string[]
}

const main = (filePath: string | string[], commandOption: CommandOption) => {
  const filePathList = (Array.isArray(filePath) ? filePath : [filePath]).filter((filePath) => fs.existsSync(filePath));
  if (filePathList.length === 0) {
    throw new Error('no filePaths found\n' + filePathList.map((filePath) => '  > ' + filePath + '\n').join(''))
  }
  const tsMatch = getTsMatchPath(filePath[0]);
  const importsObj = {}
  filePathList.forEach((filePath) => {
    getImportsByDfs(filePath, importsObj,  { includes: commandOption.includes, tsMatch });
  })
  const result = importsObj;
  if (result) {
    const string = generateMermaid(result);
    console.log(string);
  } else {
    console.log('No imports');
  }
}

const getCommandOptions = () => {
  const program = new Command();
  program.version('0.0.0').description('test description').option('--includes <partten>', 'example: **/src/** ', (str: string) => str.split(','))
  program.parse(process.argv);
  return program.opts() as CommandOption;
}
// console.log(require.main, module, require.main === module);
if (require.main === module) {
  const options = getCommandOptions();

  const pathNameList = process.argv.slice(2);
  main(pathNameList.map(pathName => path.resolve(process.cwd(), pathName)), options);
}
