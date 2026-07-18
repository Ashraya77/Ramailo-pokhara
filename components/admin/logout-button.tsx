import { LogOut } from "lucide-react";

import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export function LogoutButton({ label }: { label: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/admin/login" });
      }}
    >
      <Button type="submit" variant="ghost" size="sm" className="gap-1.5">
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">{label}</span>
      </Button>
    </form>
  );
}
