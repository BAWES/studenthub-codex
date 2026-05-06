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
  admin: "Full operations, finance, approvals",
  staff: "Requests, candidates, CVs, time",
  company: "Hiring requests and invoices",
  candidate: "Profile, jobs, hours, pay",
  inspector: "Civil ID and document review"
};

export function LoginForm({ lockedRole }: { lockedRole?: Role }) {
  const [state, action, pending] = useActionState(loginAction, {});
  const selectedRole = lockedRole ?? state.role ?? "admin";

  return (
    <form action={action} className="loginForm">
      <div className="loginFormHeader">
        <span>Secure sign in</span>
        <strong>Continue to StudentHub</strong>
        <p>Pick the same account type you use in production. Invalid attempts keep your email and selected workspace here.</p>
      </div>

      {lockedRole ? (
        <div className="lockedRole">
          <span>Account type</span>
          <strong>{roleLabels[lockedRole]}</strong>
          <small>{roleDescriptions[lockedRole]}</small>
          <input name="role" type="hidden" value={lockedRole} />
        </div>
      ) : (
        <fieldset className="rolePicker" key={selectedRole}>
          <legend>Account type</legend>
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
      )}

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
