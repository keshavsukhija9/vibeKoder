import { PlaygroundShell } from "./playground-shell";

export default async function PlaygroundPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PlaygroundShell id={id} />;
}
