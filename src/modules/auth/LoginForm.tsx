"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});

  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email ?? ""}
          placeholder="name@studenthub.app"
          required
          className="min-h-[46px]"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          required
          className="min-h-[46px]"
        />
      </div>

      {state.error ? (
        <p className="text-destructive font-bold text-sm m-0">{state.error}</p>
      ) : null}

      <Button type="submit" disabled={pending} size="lg" className="min-h-[52px] w-full">
        <LogIn className="size-4" />
        {pending ? "Checking credentials..." : "Sign in"}
      </Button>
    </form>
  );
}
