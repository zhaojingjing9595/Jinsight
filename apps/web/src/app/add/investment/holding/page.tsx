"use client";

import { useState } from "react";
import Link from "next/link";
import type { AssetType } from "@jinsight/core";
import { BottomNav } from "@/components/BottomNav";
import { NumPad } from "@/components/NumPad";

const ASSET_TYPES: { value: AssetType; label: string; icon: string; color: string }[] = [
  { value: "stock",        label: "Stock",       icon: "📈", color: "#feb704" },
  { value: "etf",          label: "ETF",         icon: "🗂️", color: "#cce972" },
  { value: "crypto",       label: "Crypto",      icon: "₿",  color: "#f07030" },
  { value: "bond",         label: "Bond",        icon: "🏦", color: "#9090cc" },
  { value: "real_estate",  label: "Real Estate", icon: "🏠", color: "#cdb1e7" },
  { value: "other",        label: "Other",       icon: "📦", color: "#d4d4d4" },
];

export default function AddHoldingPage() {
  const [assetType, setAssetType] = useState<AssetType>("stock");
  const [name, setName]           = useState("");
  const [ticker, setTicker]       = useState("");
  const [units, setUnits]         = useState("");
  const [price, setPrice]         = useState("0");
  const [editingPrice, setEditingPrice] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [platform, setPlatform]   = useState("");
  const [saved, setSaved]         = useState(false);

  const priceNum = parseFloat(price) || 0;
  const unitsNum = parseFloat(units) || 0;
  const costBasis = priceNum * unitsNum;

  function handleSave() {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setName(""); setTicker(""); setUnits(""); setPrice("0"); setPlatform("");
    }, 1500);
  }

  return (
    <div className="flex flex-col max-w-[480px] mx-auto bg-base h-dvh">
      {/* ── Top bar ── */}
      <div className="flex-none px-4 pt-6 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/add/investment" className="font-body text-[13px] font-bold text-muted">
            ← Investment
          </Link>
          <h1 className="font-body text-[11px] font-black uppercase tracking-[3px] text-ink">
            Add Holding
          </h1>
        </div>
        {/* Asset type chips */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {ASSET_TYPES.map((at) => {
            const isActive = assetType === at.value;
            return (
              <button
                key={at.value}
                type="button"
                onClick={() => setAssetType(at.value)}
                className={`font-body flex-none flex items-center gap-1.5 px-3 py-1.5 rounded-pill border-2 border-ink text-[11px] font-bold uppercase tracking-[0.5px] transition-all ${
                  isActive ? "text-ink shadow-neo-xs" : "bg-base text-muted shadow-none"
                }`}
                style={isActive ? { backgroundColor: at.color } : undefined}
              >
                {at.icon} {at.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Form ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 flex flex-col gap-4 pb-[calc(80px+16px)]">
        {/* Name */}
        <div>
          <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
            Asset Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={assetType === "crypto" ? "e.g. Bitcoin" : assetType === "stock" ? "e.g. Apple Inc." : "Name"}
            className="font-body w-full px-3 py-2.5 text-[14px] font-bold border-2 border-ink rounded-[10px] bg-base shadow-neo-xs focus:outline-none focus:border-primary focus:shadow-[2px_2px_0_#a57dee]"
          />
        </div>

        {/* Ticker (optional for non-real-estate) */}
        {assetType !== "real_estate" && assetType !== "other" && (
          <div>
            <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
              Ticker / Symbol <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder={assetType === "crypto" ? "BTC" : "AAPL"}
              className="font-body w-full px-3 py-2 text-[13px] border-2 border-ink rounded-btn bg-base focus:outline-none focus:border-primary"
            />
          </div>
        )}

        {/* Units + Price per unit */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
              {assetType === "real_estate" ? "% Owned" : "Units / Shares"}
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              placeholder="0"
              className="font-body w-full px-3 py-2 text-[13px] font-bold border-2 border-ink rounded-btn bg-base focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex-1">
            <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
              {assetType === "real_estate" ? "Property Value" : "Price per Unit"}
            </label>
            <button
              type="button"
              onClick={() => setEditingPrice((v) => !v)}
              className={`font-body w-full px-3 py-2 text-[13px] font-bold border-2 border-ink rounded-btn text-left shadow-neo-xs transition-all ${
                editingPrice ? "bg-[#fff9e6]" : "bg-base"
              }`}
            >
              ₪ {priceNum.toLocaleString() || "0"}
            </button>
          </div>
        </div>

        {editingPrice && (
          <NumPad value={price} onChange={setPrice} />
        )}

        {/* Cost basis summary */}
        {costBasis > 0 && (
          <div className="flex justify-between items-center px-4 py-2.5 border-2 border-ink rounded-[10px] bg-reward shadow-neo-xs">
            <span className="font-body text-[11px] font-bold uppercase tracking-[1px] text-ink">
              Cost Basis
            </span>
            <span className="font-display font-black text-ink text-[22px]">
              ₪{costBasis.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {/* Purchase date */}
        <div>
          <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
            Purchase Date
          </label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="font-body w-full px-3 py-2 text-[13px] border-2 border-ink rounded-btn bg-base focus:outline-none focus:border-primary"
          />
        </div>

        {/* Platform */}
        <div>
          <label className="font-body block text-[10px] font-bold uppercase tracking-[2px] mb-1 text-ink">
            Platform / Broker <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            type="text"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder="e.g. Interactive Brokers, Coinbase…"
            className="font-body w-full px-3 py-2 text-[13px] border-2 border-ink rounded-btn bg-base focus:outline-none focus:border-primary"
          />
        </div>

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          disabled={!name || unitsNum === 0 || priceNum === 0}
          className={`font-body w-full py-3 text-[14px] font-black uppercase tracking-[1.5px] border-[2.5px] border-ink rounded-[10px] shadow-neo-md text-ink transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-40 disabled:pointer-events-none ${
            saved ? "bg-goal" : "bg-reward"
          }`}
        >
          {saved ? "✓ Holding Added!" : "Add Holding"}
        </button>
      </div>

      <BottomNav active="add" />
    </div>
  );
}
