"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, ApiError, type Account } from "@/lib/api";
import { Button } from "@/components/ui/button";
export function AccountSummary() {
  const [account, setAccount] = useState<Account>();
  const [state, setState] = useState("loading");
  async function load() {
    setState("loading");
    try {
      setAccount(await api<Account>("/auth/me"));
      setState("ready");
    } catch (err) {
      setState(
        err instanceof ApiError && err.status === 401 ? "guest" : "error",
      );
    }
  }
  useEffect(() => {
    void load();
  }, []);
  return (
    <section
      className="card min-w-0 break-words flex flex-wrap items-center justify-between gap-4"
      aria-label="Account setup"
    >
      <div>
        {state === "loading" ? (
          <p role="status">Loading your workspace…</p>
        ) : state === "error" ? (
          <p role="alert">
            Your account could not be loaded. Check the connection and try
            again.
          </p>
        ) : state === "guest" ? (
          <>
            <h2 className="font-semibold">
              Your next chapter starts with an account.
            </h2>
            <p className="text-sm text-muted-foreground">
              Save your business details and make this workspace yours.
            </p>
          </>
        ) : (
          <>
            <h2 className="font-semibold">
              {account?.business.name || "Let’s set up your business."}
            </h2>
            <p className="text-sm text-muted-foreground">
              {!account?.verified
                ? "Check your email to verify your account."
                : !account.business.category
                  ? "Complete your profile before creating your first promotion."
                  : `${account.business.category} · ${account.business.location || "Your business workspace"}`}
            </p>
          </>
        )}
      </div>
      {state === "error" ? (
        <Button variant="outline" onClick={() => void load()}>
          Retry
        </Button>
      ) : state === "guest" ? (
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Create account</Link>
          </Button>
        </div>
      ) : state === "ready" ? (
        <Button asChild variant="outline">
          <Link href="/settings">
            {account?.business.category
              ? "Business settings"
              : "Complete setup"}
          </Link>
        </Button>
      ) : null}
    </section>
  );
}
