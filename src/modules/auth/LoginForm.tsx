"use client";

import { useActionState, useEffect, useRef } from "react";
import { LogIn } from "lucide-react";
import { loginAction } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});
  const emailRef = useRef<HTMLInputElement>(null);

  // Auto-focus email field on mount
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          ref={emailRef}
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email ?? ""}
          placeholder="name@studenthub.app"
          required
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
        />
      </div>

      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full">
        <LogIn className="size-4" />
        {pending ? "Checking credentials..." : "Sign in"}
      </Button>
    </form>
  );
}
