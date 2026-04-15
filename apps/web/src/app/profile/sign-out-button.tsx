"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="font-body w-full py-3 text-center text-[14px] font-[700] text-white rounded-btn border-2 border-ink bg-alert shadow-neo-sm transition-all duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-neo-md active:translate-x-0.5 active:translate-y-0.5 active:shadow-neo-pressed"
    >
      Sign Out
    </button>
  );
}
