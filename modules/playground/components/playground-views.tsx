"use client";

import { Button } from "@/components/ui/button";
import LoadingStep from "@/modules/playground/components/loader";
import { AlertCircle, FileText, FolderOpen } from "lucide-react";
import Link from "next/link";

export function PlaygroundErrorView({ error }: { error: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4 gap-4">
      <AlertCircle className="h-12 w-12 text-destructive mb-2" />
      <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
      <p className="text-muted-foreground text-center max-w-md mb-2">{error}</p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={() => window.location.reload()} variant="default">
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/playground/demo">Try demo</Link>
        </Button>
      </div>
    </div>
  );
}

export function PlaygroundLoadingView() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-md p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-6 text-center">Loading Playground</h2>
        <div className="mb-8">
          <LoadingStep currentStep={1} step={1} label="Loading playground data" />
          <LoadingStep currentStep={2} step={2} label="Setting up environment" />
          <LoadingStep currentStep={3} step={3} label="Ready to code" />
        </div>
      </div>
    </div>
  );
}

export function PlaygroundNoTemplateView() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4 gap-4">
      <FolderOpen className="h-12 w-12 text-amber-500" />
      <h2 className="text-xl font-semibold text-foreground">No template data available</h2>
      <p className="text-muted-foreground text-sm text-center max-w-md">
        The project template could not be loaded. Reload or open another project.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={() => window.location.reload()} variant="default">
          Reload
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/playground/demo">Try demo</Link>
        </Button>
      </div>
    </div>
  );
}

export function PlaygroundNoFilesView() {
  return (
    <div className="flex flex-col h-full items-center justify-center text-muted-foreground gap-4">
      <FileText className="h-16 w-16 text-gray-300" />
      <div className="text-center">
        <p className="text-lg font-medium">No files open</p>
        <p className="text-sm text-gray-500">
          Select a file from the sidebar to start editing
        </p>
      </div>
    </div>
  );
}
