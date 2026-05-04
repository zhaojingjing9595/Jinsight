import { requireAuth } from "@/lib/auth";

export default async function BudgetPlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return children;
}
