"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  name: string;
  placeholder: string;
  required?: boolean;
  minLength?: number;
}

export default function PasswordInput({
  name,
  placeholder,
  required,
  minLength,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        name={name}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        className="w-full rounded border border-zinc-300 px-4 py-3 pe-11 text-sm outline-none focus:border-sky-600 dark:border-zinc-700 dark:bg-zinc-900"
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
        className="absolute inset-y-0 end-0 flex cursor-pointer items-center px-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
