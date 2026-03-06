self.onmessage = async (e: MessageEvent<{ files: { path: string; content: string }[] }>) => {
  const { files } = e.data;
  const { getStructuralRisks } = await import("./index");
  const result = await getStructuralRisks(files);
  self.postMessage(result);
};
