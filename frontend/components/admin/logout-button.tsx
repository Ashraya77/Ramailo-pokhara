"use client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearAccessToken, post } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
export function LogoutButton({ label }: { label: string }) { const router = useRouter(); async function logout() { try { await post("/api/auth/logout"); } finally { clearAccessToken(); router.replace("/login"); } } return <Button type="button" onClick={logout} variant="ghost" size="sm" className="gap-1.5"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">{label}</span></Button>; }
