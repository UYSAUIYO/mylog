import SensitiveWordTool from "sensitive-word-tool";

// 单例初始化，避免重复构建 DFA 树
let instance: SensitiveWordTool | null = null;

function getFilter(): SensitiveWordTool {
  if (!instance) {
    instance = new SensitiveWordTool({
      useDefaultWords: true, // 使用内置违禁词库
    });
  }
  return instance;
}

/**
 * 检测文本是否包含违禁词
 * @returns true 表示包含违禁词
 */
export function containsBannedWords(text: string): boolean {
  return getFilter().verify(text);
}

/**
 * 获取文本中匹配到的所有违禁词
 */
export function matchBannedWords(text: string): string[] {
  return getFilter().match(text);
}

/**
 * 替换文本中的违禁词为 * 号
 */
export function filterBannedWords(text: string): string {
  return getFilter().filter(text, "*");
}
