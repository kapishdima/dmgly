import { notFound } from "next/navigation";
import Exploration from "./_components/exploration";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { v } = await searchParams;
  const initial = Math.min(2, Math.max(0, (Number(v) || 1) - 1));
  return <Exploration initial={Math.floor(initial)} />;
}
