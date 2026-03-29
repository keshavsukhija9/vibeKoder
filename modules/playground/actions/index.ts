"use server";

import { getDb } from "@/lib/db";
import { TemplateFolder } from "../lib/path-to-json";
import { currentUser } from "@/modules/auth/actions";

export const getPlaygroundById = async (id: string) => {
  const user = await currentUser();
  if (!user) return null;

  const db = getDb();
  try {
    const row = db.prepare(
      "SELECT id, title FROM playgrounds WHERE id = ? AND user_id = ?"
    ).get(id, user.id) as { id: string; title: string } | undefined;

    if (!row) return null;

    const tf = db.prepare(
      "SELECT content FROM template_files WHERE playground_id = ?"
    ).get(id) as { content: string } | undefined;

    return {
      id: row.id,
      title: row.title,
      templateFiles: tf ? [{ content: tf.content }] : [],
    };
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const SaveUpdatedCode = async (
  playgroundId: string,
  data: TemplateFolder
) => {
  const user = await currentUser();
  if (!user) return null;

  const db = getDb();
  try {
    const owner = db.prepare(
      "SELECT user_id FROM playgrounds WHERE id = ?"
    ).get(playgroundId) as { user_id: string } | undefined;
    if (!owner || owner.user_id !== user.id) return null;

    db.prepare(
      `INSERT INTO template_files (playground_id, content) VALUES (?, ?)
       ON CONFLICT(playground_id) DO UPDATE SET content = excluded.content`
    ).run(playgroundId, JSON.stringify(data));

    const updated = db.prepare(
      "SELECT playground_id, content FROM template_files WHERE playground_id = ?"
    ).get(playgroundId) as any;
    return updated;
  } catch (err) {
    console.error("SaveUpdatedCode error:", err);
    return null;
  }
};
