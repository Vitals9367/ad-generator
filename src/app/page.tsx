import AdGenerator from "@/components/ad-generator";
import type { Metadata } from "next";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto flex max-w-5xl flex-1 flex-col px-4 py-8">
        <header className="mb-10 text-center">
          <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
            Product Ad Generator
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Upload your product image, customize with prompts, and generate
            beautiful ads in seconds
          </p>
        </header>

        <AdGenerator />
      </div>

      {/* <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} Product Ad Generator. All rights
          reserved.
        </p>
      </footer> */}
    </main>
  );
}
