import { requireAuth } from "@/lib/auth";

export default async function AddLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return children;
}
