import Editor from "@/components/editor/editor";
import { Suspense } from "react";
export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="p-10" role="status">
          Opening design…
        </main>
      }
    >
      <Editor />
    </Suspense>
  );
}
