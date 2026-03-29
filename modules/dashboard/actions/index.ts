"use server";

import { getDb } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

function mapPlayground(row: any, user: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    template: row.template,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userId: row.user_id,
    user: {
      id: user?.id,
      name:
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.email ||
        "User",
      email: user?.email,
      image: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "",
      role: "USER",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
    Starmark: row.is_marked != null ? [{ isMarked: !!row.is_marked }] : [],
  };
}

export const toggleStarMarked = async (
  playgroundId: string,
  isChecked: boolean
) => {
  const user = await currentUser();
  if (!user) {
    throw new Error("User is required");
  }

  const db = getDb();
  try {
    if (isChecked) {
      db.prepare(
        `INSERT OR REPLACE INTO star_marks (user_id, playground_id, is_marked) VALUES (?, ?, 1)`
      ).run(user.id, playgroundId);
    } else {
      db.prepare(
        "DELETE FROM star_marks WHERE user_id = ? AND playground_id = ?"
      ).run(user.id, playgroundId);
    }
    revalidatePath("/dashboard");
    return { success: true, isMarked: isChecked };
  } catch (error) {
    console.error("Error updating favorite:", error);
    return { success: false, error: "Failed to update favorite", isMarked: false };
  }
};

export const getAllPlaygroundForUser = async () => {
  const user = await currentUser();
  if (!user) return [];

  const db = getDb();
  const rows = db
    .prepare(
      `SELECT p.id, p.title, p.description, p.template, p.created_at, p.updated_at, p.user_id, s.is_marked
       FROM playgrounds p
       LEFT JOIN star_marks s ON s.playground_id = p.id AND s.user_id = ?
       WHERE p.user_id = ?
       ORDER BY p.updated_at DESC`
    )
    .all(user.id, user.id) as any[];

  return rows.map((row) => mapPlayground(row, user));
};

export const createPlayground = async (data: {
  title: string;
  template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR";
  description?: string;
}) => {
  const user = await currentUser();
  if (!user) return null;

  const id = randomUUID();
  const db = getDb();
  try {
    db.prepare(
      `INSERT INTO playgrounds (id, title, description, template, user_id) VALUES (?, ?, ?, ?, ?)`
    ).run(
      id,
      data.title,
      data.description ?? null,
      data.template,
      user.id
    );
    const row = db.prepare(
      "SELECT id, title, description, template, created_at, updated_at, user_id FROM playgrounds WHERE id = ?"
    ).get(id) as any;
    return row;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const deleteProjectById = async (id: string): Promise<void> => {
  const user = await currentUser();
  if (!user) return;

  const db = getDb();
  try {
    db.prepare("DELETE FROM playgrounds WHERE id = ? AND user_id = ?").run(
      id,
      user.id
    );
    revalidatePath("/dashboard");
  } catch (err) {
    console.error(err);
  }
};

export const editProjectById = async (
  id: string,
  data: { title: string; description: string }
): Promise<void> => {
  const user = await currentUser();
  if (!user) return;

  const db = getDb();
  try {
    db.prepare(
      "UPDATE playgrounds SET title = ?, description = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?"
    ).run(data.title, data.description, id, user.id);
    revalidatePath("/dashboard");
  } catch (err) {
    console.error(err);
  }
};

export const duplicateProjectById = async (id: string): Promise<void> => {
  const user = await currentUser();
  if (!user) return;

  const db = getDb();
  try {
    const original = db.prepare(
      "SELECT id, title, description, template, user_id FROM playgrounds WHERE id = ? AND user_id = ?"
    ).get(id, user.id) as any;

    if (!original) {
      throw new Error("Original playground not found");
    }

    const newId = randomUUID();
    db.prepare(
      `INSERT INTO playgrounds (id, title, description, template, user_id) VALUES (?, ?, ?, ?, ?)`
    ).run(
      newId,
      `${original.title} (Copy)`,
      original.description,
      original.template,
      original.user_id
    );
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Error duplicating project:", error);
  }
};
