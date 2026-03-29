import type { TemplateFile, TemplateFolder } from "@/modules/playground/lib/path-to-json";

type TemplateNode = TemplateFile | TemplateFolder;

function isFolder(node: TemplateNode): node is TemplateFolder {
  return "items" in node && Array.isArray(node.items) && typeof node.folderName === "string";
}

interface WebContainerFile {
  file: {
    contents: string;
  };
}

interface WebContainerDirectory {
  directory: {
    [key: string]: WebContainerFile | WebContainerDirectory;
  };
}

type WebContainerFileSystem = Record<string, WebContainerFile | WebContainerDirectory>;

function nodeKey(node: TemplateNode): string {
  if (isFolder(node)) return node.folderName;
  return `${node.filename}.${node.fileExtension}`;
}

function processItem(item: TemplateNode): WebContainerFile | WebContainerDirectory {
  if (isFolder(item)) {
    const directoryContents: WebContainerFileSystem = {};
    for (const subItem of item.items) {
      directoryContents[nodeKey(subItem)] = processItem(subItem);
    }
    return { directory: directoryContents };
  }
  return {
    file: {
      contents: item.content,
    },
  };
}

export function transformToWebContainerFormat(template: TemplateFolder): WebContainerFileSystem {
  const result: WebContainerFileSystem = {};
  for (const item of template.items) {
    result[nodeKey(item)] = processItem(item);
  }
  return result;
}
