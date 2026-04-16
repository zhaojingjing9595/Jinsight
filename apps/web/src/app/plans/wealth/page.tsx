import { redirect } from "next/navigation";

export default function WealthRedirect() {
  redirect("/plans?tab=wealth");
}
