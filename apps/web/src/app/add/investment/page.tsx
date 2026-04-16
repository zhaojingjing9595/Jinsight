import { BottomNav } from "@/components/BottomNav";
import { AddSwitcher } from "@/components/AddSwitcher";
import { InvestmentHub } from "@/components/InvestmentHub";

export default function InvestmentHubPage() {
  return (
    <div className="flex flex-col max-w-[480px] mx-auto bg-base h-dvh">
      <AddSwitcher active="invest" />

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-2 pb-[calc(80px+16px)]">
        <InvestmentHub />
      </div>

      <BottomNav active="add" />
    </div>
  );
}
