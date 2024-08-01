import { Imports } from "../core/getImportsByDfs";

interface DirMap {
  [key: string]: DirMap;
  //@ts-expect-error
  _nodes?: string[];
}

const TSpan = '  ';
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
    const dirList = name.split(/[/\\]+/).map(item => item.trim());
    const nodeText = dirList[dirList.length - 1];
    const nodeName = dirList.join('_');
    let _graph = subgraph;
    dirList.slice(0, dirList.length - 1).forEach((dir) => {
      if (_graph[dir] === undefined) {
        _graph[dir] = {};
      }
      _graph = _graph[dir];
    });
    _graph._nodes = (_graph._nodes || []).concat(
      `${nodeName}["${nodeText}--${node?.lines}"]`
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

  const formatGraph = (graph: DirMap, span: number, draw = true) => {
    let string = '';
    if (draw) {
      const nodes = graph._nodes;
      nodes?.forEach(node => string += getTspan(span) + node + '\n');
    }
    Object.entries(graph).forEach(([dir, info]) => {
      if (dir !== '_nodes') {
        string += getTspan(span) + `subgraph ${dir}` + '\n';
        string += formatGraph(graph[dir], span + 1);
        string += getTspan(span) + 'end' + '\n';
      }
    });
    return string;
  };

  const formatLinks = (span: number) => {
    return links
      .map(([pre, next]) => getTspan(span) + `${pre} --> ${next}\n`)
      .join('');
  };

  let resultString = 'flowchart LR\n';

  resultString += formatGraph(subgraph, 1, false);
  resultString += formatLinks(1);
  return resultString;
};
