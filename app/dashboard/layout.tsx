import { SidebarProvider } from "@/components/ui/sidebar";
import { AppNavbar } from "@/components/layout/app-navbar";
import { getAllPlaygroundForUser } from "@/modules/dashboard/actions";
import { DashboardSidebar } from "@/modules/dashboard/components/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let playgroundData: Awaited<ReturnType<typeof getAllPlaygroundForUser>> = [];
  try {
    playgroundData = await getAllPlaygroundForUser() ?? [];
  } catch {
    playgroundData = [];
  }

  const technologyIconMap: Record<string, string> = {
    REACT: "Zap",
    NEXTJS: "Lightbulb",
    EXPRESS: "Database",
    VUE: "Compass",
    HONO: "FlameIcon",
    ANGULAR: "Terminal",
  }

  const formattedPlaygroundData = playgroundData?.map((item)=>({
    id:item.id,
    name:item.title,
    starred:item.Starmark?.[0]?.isMarked || false,
    icon:technologyIconMap[item.template] || "Code2"
  }))


  return (
    <div className="min-h-screen w-full flex flex-col bg-[var(--vibe-bg)]">
      <AppNavbar />
      <SidebarProvider>
        <div className="flex flex-1 min-h-0 w-full overflow-x-hidden">
          <DashboardSidebar initialPlaygroundData={formattedPlaygroundData} />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </SidebarProvider>
    </div>
  )
}
