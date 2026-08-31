"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/frontend/lib/utils";

type InputLanguageToggleProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  className?: string;
  disabled?: boolean;
};

export function InputLanguageToggle({
  enabled,
  onChange,
  label,
  className,
  disabled = false,
}: InputLanguageToggleProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-md border bg-muted/20 px-3 py-2",
        className,
      )}
    >
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="inline-flex items-center rounded-md border bg-background p-0.5">
        <Button
          type="button"
          variant={enabled ? "ghost" : "secondary"}
          size="sm"
          className="h-7 rounded-sm px-2 text-xs"
          onClick={() => onChange(false)}
          disabled={disabled}
        >
          EN
        </Button>
        <Button
          type="button"
          variant={enabled ? "secondary" : "ghost"}
          size="sm"
          className="h-7 rounded-sm px-2 text-xs"
          onClick={() => onChange(true)}
          disabled={disabled}
        >
          नेपाली
        </Button>
      </div>
    </div>
  );
}
