
"use client";

import { Button } from "@/components/ui/button"
// import { createPlayground } from "@/features/playground/actions";
import { Plus } from 'lucide-react'
import Image from "next/image"
import { useRouter } from "next/navigation";
import { useState } from "react"
import { toast } from "sonner";
import TemplateSelectingModal from "./template-selecting-modal";
import { createPlayground } from "../actions";

const AddNewButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
 const [selectedTemplate, setSelectedTemplate] = useState<{
    title: string;
    template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR";
    description?: string;
  } | null>(null)
  const router = useRouter()


  const [creating, setCreating] = useState(false);

  const handleSubmit = async (data: {
    title: string;
    template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR";
    description?: string;
  }) => {
    setSelectedTemplate(data);
    setCreating(true);
    try {
      const res = await createPlayground(data);
      if (!res?.id) {
        toast.error("Sign in to create and save projects.", {
          action: {
            label: "Try demo",
            onClick: () => {
              setIsModalOpen(false);
              router.push("/playground/demo");
            },
          },
        });
        return;
      }
      toast.success("Playground created");
      setIsModalOpen(false);
      router.push(`/playground/${res.id}`);
    } finally {
      setCreating(false);
    }
  };


  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="group px-6 py-6 flex flex-row justify-between items-center rounded-2xl border border-[var(--vibe-border)] bg-[var(--vibe-surface)] cursor-pointer
        transition-all duration-300 ease-in-out shadow-[var(--vibe-shadow)]
        hover:border-[var(--vibe-primary)]/40 hover:scale-[1.02] hover:shadow-[var(--vibe-shadow-hover)]"
      >
        <div className="flex flex-row justify-center items-start gap-4">
          <Button
            variant="outline"
            className="flex justify-center items-center bg-white border-[var(--vibe-border)] group-hover:border-[var(--vibe-primary)] group-hover:text-[var(--vibe-primary)] transition-colors duration-300"
            size="icon"
          >
            <Plus size={30} className="transition-transform duration-300 group-hover:rotate-90" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-[var(--vibe-text)]" style={{ fontFamily: "var(--font-display)" }}>Add New</h1>
            <p className="text-sm text-[var(--vibe-text-muted)] max-w-[220px]">Create a new playground</p>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <Image
            src={"/add-new.svg"}
            alt="Create new playground"
            width={150}
            height={150}
            className="transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      </div>
      <TemplateSelectingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={creating}
      />
   
    </>
  )
}

export default AddNewButton
