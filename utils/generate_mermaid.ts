import { ImportNode, Imports } from '../core/read_dfs';

interface DirMap {
  [key: string]: DirMap;
  //@ts-expect-error
  _nodes?: string[];
}

const TSpan = '\t';
const getTspan = (n: number): string => {
  return Array(n).fill(TSpan).join('');
};

export const generateMermaid = (imports: Imports) => {
  const template = Object.keys(imports)[0];
  const prefix =
    template.indexOf('src') !== -1
      ? template.substring(0, template.indexOf('src') + 4)
      : '';
  const subgraph: DirMap = {};
  const nameMap: Record<string, { nodeName: string; nodeText: string }> = {};
  const formatNode = (fileName: string) => {
    if (nameMap[fileName]) {
      return nameMap[fileName].nodeName;
    }
    const node = imports[fileName];
    const name = fileName.startsWith(prefix)
      ? fileName.slice(prefix.length)
      : fileName;
    const dirList = name.split('\\');
    const nodeText = dirList[dirList.length - 1];
    const nodeName = dirList.join('_');
    let _graph = subgraph;
    dirList.slice(0, dirList.length - 1).forEach((dir) => {
      if (_graph[dir] === undefined) {
        _graph = _graph[dir] = {};
      }
    });
    _graph._nodes = (_graph._nodes || []).concat(
      `${nodeName}["\`${nodeText}\n${node?.lines}\`"]`
    );
    nameMap[fileName] = {
      nodeName,
      nodeText,
    };
    return nodeName;
  };

  const links: [string, string][] = [];
  Object.entries(imports).forEach(([fileName, node]) => {
    node.imports.forEach((im) => {
      links.push([formatNode(fileName), formatNode(im)]);
    });
  });

  const formatGraph = (graph: DirMap, span: number) => {
    let string = '';
    Object.entries(graph).forEach(([dir, info]) => {
      if (dir !== '_nodes') {
        string += getTspan(span) + `subgraph ${dir}` + '\n';
        info._nodes?.forEach((node) => {
          string += getTspan(span + 1) + node + '\n';
        });
        Object.entries(info).forEach(([nextDir, nextGraph]) => {
          if (nextDir !== '_nodes') {
            string += formatGraph(nextGraph, span + 1);
          }
        });
      }
    });
    string += getTspan(span) + 'end' + '\n';
    return string;
  };

  const formatLinks = (span: number) => {
    return links
      .map(([pre, next]) => getTspan(span) + `${pre} --> ${next}\n`)
      .join('');
  };

  let resultString = 'flowchart TB\n';

  resultString += formatGraph(subgraph, 1);
  resultString += formatLinks(1);
  resultString += getTspan(1) + 'end' + '\n';
  return resultString;
};
