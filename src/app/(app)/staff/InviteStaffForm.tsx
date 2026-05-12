"use client";

import { useState, useTransition } from "react";

import { inviteStaff } from "~/actions/staff";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";

export function InviteStaffForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await inviteStaff(email);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(`Invitation sent to ${email}`);
      setEmail("");
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex-1">
        <Input
          type="email"
          placeholder="teammate@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        {success && <p className="mt-1 text-xs text-emerald-700">{success}</p>}
      </div>
      <Button type="submit" loading={isPending}>
        Send invite
      </Button>
    </form>
  );
}
