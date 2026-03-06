import { TemplateFile, TemplateFolder } from "./path-to-json";

/** Flatten template to { path, content }[] for RAG index and AST analyze. */
export function flattenTemplateToFiles(
  folder: TemplateFolder,
  pathPrefix: string[] = []
): { path: string; content: string }[] {
  const out: { path: string; content: string }[] = [];
  for (const item of folder.items) {
    if ("folderName" in item) {
      out.push(...flattenTemplateToFiles(item, [...pathPrefix, item.folderName]));
    } else {
      const name = item.filename + (item.fileExtension ? "." + item.fileExtension : "");
      out.push({
        path: [...pathPrefix, name].join("/"),
        content: item.content ?? "",
      });
    }
  }
  return out;
}

export function findFilePath(
  file: TemplateFile,
  folder: TemplateFolder,
  pathSoFar: string[] = []
): string | null {
  for (const item of folder.items) {
    if ("folderName" in item) {
      const res = findFilePath(file, item, [...pathSoFar, item.folderName]);
      if (res) return res;
    } else {
      if (
        item.filename === file.filename &&
        item.fileExtension === file.fileExtension
      ) {
        return [
          ...pathSoFar,
          item.filename + (item.fileExtension ? "." + item.fileExtension : ""),
        ].join("/");
      }
    }
  }
  return null;
}



/**
 * Generates a unique file ID based on file location in folder structure
 * @param file The template file
 * @param rootFolder The root template folder containing all files
 * @returns A unique file identifier including full path
 */
export const generateFileId = (file: TemplateFile, rootFolder: TemplateFolder): string => {
  // Find the file's path in the folder structure
  const path = findFilePath(file, rootFolder)?.replace(/^\/+/, '') || '';
  
  // Handle empty/undefined file extension
  const extension = file.fileExtension?.trim();
  const extensionSuffix = extension ? `.${extension}` : '';

  // Combine path and filename
  return path
    ? `${path}/${file.filename}${extensionSuffix}`
    : `${file.filename}${extensionSuffix}`;
}

/** Get the first file from the template tree (for auto-open on load). */
export function getFirstFileFromTemplate(folder: TemplateFolder): TemplateFile | null {
  for (const item of folder.items) {
    if ("folderName" in item) {
      const found = getFirstFileFromTemplate(item);
      if (found) return found;
    } else {
      return item as TemplateFile;
    }
  }
  return null;
}

/** Get dev/start script name from template's package.json. Prefers "start", falls back to "dev". */
export function getPackageScriptRunCommand(folder: TemplateFolder): "start" | "dev" {
  for (const item of folder.items) {
    if ("filename" in item && item.filename === "package" && item.fileExtension === "json") {
      try {
        const pkg = JSON.parse(item.content || "{}");
        const scripts = pkg.scripts || {};
        if (scripts.start) return "start";
        if (scripts.dev) return "dev";
      } catch {
        // ignore
      }
      return "start";
    }
  }
  return "start";
}