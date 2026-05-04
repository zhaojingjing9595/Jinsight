import { requireAuth } from "@/lib/auth";

export default async function BillsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return children;
}
