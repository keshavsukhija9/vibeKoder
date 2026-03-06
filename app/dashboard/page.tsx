import { deleteProjectById, duplicateProjectById, editProjectById, getAllPlaygroundForUser } from "@/modules/dashboard/actions";
import AddNewButton from "@/modules/dashboard/components/add-new";
import AddRepo from "@/modules/dashboard/components/add-repo";
import EmptyState from "@/modules/dashboard/components/empty-state";
import ProjectTable from "@/modules/dashboard/components/project-table";
import Link from "next/link";
import React from "react";

const Page = async () => {
  const playgrounds = await getAllPlaygroundForUser();
  return (
    <div className="flex flex-col items-start min-h-screen mx-auto w-full max-w-[1280px] px-4 py-10" style={{ fontFamily: "var(--font-body)" }}>
      <div className="w-full mb-8 rounded-2xl border border-[var(--vibe-border)] bg-[var(--vibe-surface)] p-4 shadow-[var(--vibe-shadow)]">
        <p className="text-sm text-[var(--vibe-text-muted)] mb-2">Want to code right away?</p>
        <Link
          href="/playground/demo"
          className="font-semibold text-[var(--vibe-primary)] hover:opacity-90 transition-opacity"
        >
          Try the editor (no sign-in) →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <AddNewButton />
        <AddRepo />
      </div>

      <div className="mt-10 flex flex-col items-center w-full">
        {playgrounds && playgrounds.length === 0 ? (
          <EmptyState />
        ) : (
          <ProjectTable
            projects={playgrounds || []}
            onDeleteProject={deleteProjectById}
            onUpdateProject={editProjectById}
            onDuplicateProject={duplicateProjectById}
          />
        )}
      </div>
    </div>
  );
};

export default Page;
