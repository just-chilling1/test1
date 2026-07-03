"use client";

import { LucideIcon } from "lucide-react";

interface AuthFormFieldProps {
  icon: LucideIcon;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  rightElement?: React.ReactNode;
}

export function AuthFormField({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  required = true,
  rightElement,
}: AuthFormFieldProps) {
  return (
    <div className="relative group">
      <Icon
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a6080] group-focus-within:text-[#00c9a7] transition-colors z-10"
      />
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`auth-input w-full pl-12 ${rightElement ? "pr-12" : "pr-4"}`}
      />
      {rightElement && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">{rightElement}</div>
      )}
    </div>
  );
}
