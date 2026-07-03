"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calculator, TrendingUp } from "lucide-react";
import { brand } from "@/config/brand.config";
import { isFeatureEnabled } from "@/config/features.config";
import { incomeCalculatorDefaults } from "@/features/income-calculator/config/income-calculator.config";
import {
  calculateIncome,
  formatCurrency,
  formatPercent,
} from "@/features/income-calculator/lib/calculate-income";

function SliderField({
  label,
  hint,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <label className="text-sm font-bold text-text-primary">{label}</label>
          <p className="text-xs text-text-muted mt-0.5">{hint}</p>
        </div>
        <span className="text-lg font-black text-accent tabular-nums shrink-0">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent"
      />
      <div className="flex justify-between text-[10px] text-text-muted uppercase tracking-widest">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function ResultCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "card-base border-accent/30 bg-accent/5 flex flex-col gap-1"
          : "card-base flex flex-col gap-1"
      }
    >
      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</span>
      <span className={`text-2xl font-black tabular-nums ${highlight ? "text-accent" : "text-text-primary"}`}>
        {value}
      </span>
    </div>
  );
}

export default function CalculatorPage() {
  const { dailyVisitors, conversionRate, commissionPerSale, currency, locale } =
    incomeCalculatorDefaults;

  const [visitors, setVisitors] = useState(dailyVisitors.default);
  const [conversion, setConversion] = useState(conversionRate.default);
  const [commission, setCommission] = useState(commissionPerSale.default);

  const projection = useMemo(
    () =>
      calculateIncome({
        dailyVisitors: visitors,
        conversionRate: conversion,
        commissionPerSale: commission,
      }),
    [visitors, conversion, commission]
  );

  const fmt = (value: number) => formatCurrency(value, locale, currency);

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">
          {brand.productName} · Income Planner
        </p>
        <h1 className="brand-font text-2xl sm:text-3xl text-text-primary">Project your earnings</h1>
        <p className="text-text-secondary text-sm max-w-2xl">
          Adjust traffic, conversion, and commission to see estimated daily, weekly, and monthly income.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-base flex flex-col gap-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            <Calculator size={18} className="text-accent" />
          </div>
          <div>
            <h2 className="brand-font text-lg text-text-primary">Your inputs</h2>
            <p className="text-sm text-text-secondary">All calculations update live as you drag.</p>
          </div>
        </div>

        <SliderField
          label="Daily visitors"
          hint="How many people reach your bridge page or offer each day"
          value={visitors}
          min={dailyVisitors.min}
          max={dailyVisitors.max}
          step={dailyVisitors.step}
          display={visitors.toLocaleString(locale)}
          onChange={setVisitors}
        />
        <SliderField
          label="Conversion rate"
          hint="Percentage of visitors who buy or sign up"
          value={conversion}
          min={conversionRate.min}
          max={conversionRate.max}
          step={conversionRate.step}
          display={formatPercent(conversion)}
          onChange={setConversion}
        />
        <SliderField
          label="Commission per sale"
          hint="Average payout you earn per conversion"
          value={commission}
          min={commissionPerSale.min}
          max={commissionPerSale.max}
          step={commissionPerSale.step}
          display={fmt(commission)}
          onChange={setCommission}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          <TrendingUp size={18} className="text-accent" />
          <h2 className="brand-font text-xl text-text-primary">Projected earnings</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ResultCard
            label="Daily sales"
            value={projection.dailySales.toFixed(1)}
          />
          <ResultCard label="Daily" value={fmt(projection.dailyEarnings)} />
          <ResultCard label="Weekly" value={fmt(projection.weeklyEarnings)} highlight />
          <ResultCard label="Monthly" value={fmt(projection.monthlyEarnings)} highlight />
        </div>

        <p className="text-xs text-text-muted">
          Estimates assume consistent traffic and conversion. Actual results vary by niche, offer, and promotion quality.
        </p>
      </motion.div>

      {(isFeatureEnabled("scale-upsell") ||
        isFeatureEnabled("premium-dfy") ||
        isFeatureEnabled("core-workflow")) && (
        <div className="card-base flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-accent/20">
          <div>
            <h3 className="brand-font text-lg text-text-primary">Ready to grow?</h3>
            <p className="text-sm text-text-secondary mt-1">
              Use your projections to pick the next step in {brand.productName}.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isFeatureEnabled("core-workflow") && (
              <Link href="/search" className="btn-primary">
                Start workflow
                <ArrowRight size={16} />
              </Link>
            )}
            {isFeatureEnabled("scale-upsell") && (
              <Link href="/scale-training" className="btn-secondary">
                Scale training
              </Link>
            )}
            {isFeatureEnabled("premium-dfy") && (
              <Link href="/dfy" className="btn-secondary">
                Done-for-you vault
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
