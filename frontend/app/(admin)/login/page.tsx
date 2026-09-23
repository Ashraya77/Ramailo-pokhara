"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { get } from "@/lib/apiClient";
import { LoginForm } from "./loginForm";
export default function AdminLoginPage() { const router = useRouter(); useEffect(() => { get<{ data: { user: { role: string } } }>("/api/auth/me").then(({ data }) => { if (data.user.role === "ADMIN") router.replace("/dashboard"); }).catch(() => undefined); }, [router]); return <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4"><LoginForm /></main>; }
