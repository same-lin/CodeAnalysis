import path from 'path';
import { getImportsByDfs } from './read_dfs';
import { generateMermaid } from '../utils/generate_mermaid';

if (module.parent === null) {
  const pathName = process.argv[2];
  const realPath = path.join(process.cwd(), pathName);

  const result = getImportsByDfs(realPath);
  if (result) {
    const string = generateMermaid(result);
    console.log(string);
  } else {
    console.log('No imports');
  }
}
