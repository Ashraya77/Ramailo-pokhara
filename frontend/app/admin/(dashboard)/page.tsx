"use client";
import { useEffect, useState } from "react";
import { get } from "@/lib/apiClient";
export default function AdminDashboardPage() { const [total, setTotal] = useState<number | null>(null); useEffect(() => { get<{ meta: { total: number } }>("/api/articles?admin=true&limit=1").then((result) => setTotal(result.meta.total)).catch(() => setTotal(0)); }, []); return <div className="space-y-6"><h1 className="text-3xl font-bold tracking-tight">Dashboard</h1><p className="text-muted-foreground">Here is an overview of your news portal.</p><div className="rounded-lg border bg-card p-6"><p className="text-sm text-muted-foreground">Total Articles</p><p className="text-2xl font-bold">{total === null ? "Loading..." : total}</p></div></div>; }
