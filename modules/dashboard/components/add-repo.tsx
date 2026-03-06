
import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"
import Image from "next/image"

const AddRepo = () => {
  return (
    <div
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
          <ArrowDown size={30} className="transition-transform duration-300 group-hover:translate-y-1" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-[var(--vibe-text)]" style={{ fontFamily: "var(--font-display)" }}>Open Github Repository</h1>
          <p className="text-sm text-[var(--vibe-text-muted)] max-w-[220px]">Work with your repositories in our editor</p>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <Image
          src={"/github.svg"}
          alt="Open GitHub repository"
          width={150}
          height={150}
          className="transition-transform duration-300 group-hover:scale-110"
        />
      </div>
    </div>
  )
}

export default AddRepo


