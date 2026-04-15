import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/BottomNav";
import { SignOutButton } from "./sign-out-button";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex flex-col max-w-[480px] mx-auto px-4 bg-base min-h-dvh pb-24">
      <div className="pt-12 pb-6">
        <h1 className="font-display text-[32px] font-[900] text-ink leading-[1.0] mb-1">
          PROFILE
        </h1>
        <p className="font-body text-[12px] text-muted">
          Manage your account
        </p>
      </div>

      {/* User card */}
      <div className="bg-base border-[2.5px] border-ink rounded-[14px] p-4 shadow-neo-md mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-[48px] h-[48px] rounded-full border-2 border-ink bg-primary flex items-center justify-center">
            <span className="font-display text-[20px] font-[900] text-white">
              {(user.user_metadata?.name?.[0] ?? user.email?.[0] ?? "?").toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-body text-[14px] font-[700] text-ink">
              {user.user_metadata?.name ?? "Jinsight User"}
            </p>
            <p className="font-body text-[11px] text-muted">{user.email}</p>
          </div>
        </div>

        <div className="border-t-2 border-ink/10 pt-3">
          <p className="font-body text-[10px] font-[700] uppercase tracking-[2px] text-muted mb-1">
            Member since
          </p>
          <p className="font-body text-[13px] text-ink">
            {new Date(user.created_at).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <SignOutButton />

      <BottomNav active="profile" />
    </div>
  );
}
