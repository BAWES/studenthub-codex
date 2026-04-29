"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { roles, type Role } from "./types";

const roleLabels = {
  admin: "Admin",
  staff: "Staff",
  company: "Company",
  candidate: "Candidate",
  inspector: "Inspector"
};

const roleDescriptions = {
  admin: "Full operations",
  staff: "Assigned pipeline",
  company: "Employer portal",
  candidate: "Worker portal",
  inspector: "ID review"
};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});
  const selectedRole = state.role ?? "admin";

  return (
    <form action={action} className="loginForm">
      <div className="loginFormHeader">
        <span>Secure sign in</span>
        <strong>Choose your workspace</strong>
      </div>

      <fieldset className="rolePicker">
        <legend>Workspace</legend>
        {roles.map((role) => (
          <label key={role} className="roleOption">
            <input name="role" type="radio" value={role} defaultChecked={role === selectedRole} />
            <span>
              <strong>{roleLabels[role as Role]}</strong>
              <small>{roleDescriptions[role as Role]}</small>
            </span>
          </label>
        ))}
      </fieldset>

      <label>
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email ?? ""}
          placeholder="name@studenthub.app"
          required
        />
      </label>

      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" placeholder="Your password" required />
      </label>

      {state.error ? <p className="formError">{state.error}</p> : null}

      <button type="submit" disabled={pending} className="primaryButton">
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
