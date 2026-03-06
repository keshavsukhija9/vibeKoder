import {
  readTemplateStructureFromJson,
  saveTemplateStructureToJson,
} from "@/modules/playground/lib/path-to-json";
import { templatePaths } from "@/lib/template";
import { DEMO_TEMPLATE } from "@/lib/demo-template";
import { getDb } from "@/lib/db";
import path from "path";
import fs from "fs/promises";
import { NextRequest } from "next/server";

function validateJsonStructure(data: unknown): boolean {
  try {
    JSON.parse(JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Invalid JSON structure:", error);
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return Response.json({ error: "Missing playground ID" }, { status: 400 });
  }

  const db = getDb();
  const row = db.prepare(
    "SELECT template FROM playgrounds WHERE id = ?"
  ).get(id) as { template: string } | undefined;

  if (!row) {
    return Response.json({ error: "Playground not found" }, { status: 404 });
  }

  const templateKey = row.template as keyof typeof templatePaths;
  const templatePath = templatePaths[templateKey];

  if (!templatePath) {
    return Response.json({ success: true, templateJson: DEMO_TEMPLATE }, { status: 200 });
  }

  try {
    const inputPath = path.join(process.cwd(), templatePath);
    const outputFile = path.join(process.cwd(), `output/${templateKey}.json`);

    await saveTemplateStructureToJson(inputPath, outputFile);
    const result = await readTemplateStructureFromJson(outputFile);

    if (!validateJsonStructure(result.items)) {
      return Response.json({ success: true, templateJson: DEMO_TEMPLATE }, { status: 200 });
    }

    await fs.unlink(outputFile).catch(() => {});

    return Response.json({ success: true, templateJson: result }, { status: 200 });
  } catch (error) {
    console.error("Error generating template JSON:", error);
    return Response.json({ success: true, templateJson: DEMO_TEMPLATE }, { status: 200 });
  }
}
