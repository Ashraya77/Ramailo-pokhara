import { signOut } from "@/auth";

export function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";

        await signOut({
          redirectTo: "/admin/login",
        });
      }}
    >
      <button
        type="submit"
        className="rounded-md border px-4 py-2 text-sm"
      >
        Log out
      </button>
    </form>
  );
}