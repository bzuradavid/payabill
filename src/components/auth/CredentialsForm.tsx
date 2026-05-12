"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  signInWithCredentials,
  signUpWithCredentials,
} from "~/actions/auth";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";

type Mode = "sign-in" | "sign-up";

export function CredentialsForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result =
        mode === "sign-in"
          ? await signInWithCredentials(email, password)
          : await signUpWithCredentials(name, email, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-1 rounded-full border border-[#ecebff] bg-brand-50/60 p-1 text-sm">
        <button
          type="button"
          onClick={() => {
            setMode("sign-in");
            setError(null);
          }}
          className={
            mode === "sign-in"
              ? "rounded-full bg-white px-3 py-1.5 font-semibold text-[#312D97] shadow-sm"
              : "rounded-full px-3 py-1.5 font-medium text-slate-500 hover:text-[#312D97]"
          }
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("sign-up");
            setError(null);
          }}
          className={
            mode === "sign-up"
              ? "rounded-full bg-white px-3 py-1.5 font-semibold text-[#312D97] shadow-sm"
              : "rounded-full px-3 py-1.5 font-medium text-slate-500 hover:text-[#312D97]"
          }
        >
          Create account
        </button>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        {mode === "sign-up" && (
          <Input
            label="Name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {error}
          </p>
        )}
        <Button type="submit" loading={isPending} className="mt-1">
          {mode === "sign-in" ? "Sign in" : "Create account"}
        </Button>
      </form>

      {mode === "sign-up" && (
        <p className="text-xs leading-5 text-slate-500">
          If you&apos;ve been invited to a workspace, you&apos;ll join it
          automatically. Otherwise we&apos;ll create a new workspace and make
          you its manager.
        </p>
      )}
    </div>
  );
}
