import { requireAuth } from "@/lib/auth";

export default async function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return children;
}
