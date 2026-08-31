"use client";

import { useActionState } from "react";

import {
  loginAction,
  type LoginState,
} from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="w-full max-w-sm space-y-5 rounded-xl border bg-white p-6 shadow-sm"
    >
      <div>
        <h1 className="text-2xl font-semibold">
          Admin login
        </h1>

        <p className="mt-1 text-sm text-neutral-500">
          Sign in to manage news content.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium"
        >
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium"
        >
          Password
        </label>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="text-sm text-red-600"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}