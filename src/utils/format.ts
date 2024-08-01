import path from 'path';

// 使用正则表达式，全局替换所有的反斜杠为正斜杠
export const formatPath = (str: string) => str.replace(/[/\\]+/g, path.sep);