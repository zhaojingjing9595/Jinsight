import { requireAuth } from "@/lib/auth";

export default async function PlansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return children;
}
