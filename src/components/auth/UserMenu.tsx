import { useState } from "react";
import { Power, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
      >
        <User className="h-4 w-4 text-primary" />
        <span className="max-w-[140px] truncate">{user.displayName}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[300] mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl">
          <div className="px-3 py-2">
            <p className="truncate font-display text-base font-bold">
              {user.displayName}
            </p>

            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>

          <Button
            variant="ghost"
            className="mt-2 w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => {
              setOpen(false);
              void logout();
            }}
          >
            <Power className="mr-2 h-4 w-4" />
            Wyloguj
          </Button>
        </div>
      )}
    </div>
  );
}