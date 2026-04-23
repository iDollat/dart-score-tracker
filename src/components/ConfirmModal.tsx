import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Potwierdź",
  cancelText = "Anuluj",
  danger = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="text-center">
          <div
            className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
              danger
                ? "bg-destructive/15 text-destructive"
                : "bg-primary/15 text-primary"
            }`}
          >
            <span className="text-3xl">!</span>
          </div>

          <h2 className="font-display text-2xl font-bold">
            {title}
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>

          {children && <div className="mt-4">{children}</div>}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>

          <Button
            variant={danger ? "destructive" : "default"}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}