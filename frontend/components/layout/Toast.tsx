"use client";
// components/layout/Toast.tsx
// Lightweight toast notification system.
// Parent creates toasts via the useToast hook exposed below.
// Toasts auto-dismiss after 3s and animate in from the right.

import React, { useState, useCallback, useEffect } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

// ── Toast display component ──
export function ToastContainer({ toasts, onDismiss }: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  if (!toasts.length) return null;

  return (
    <div
      className="fixed bottom-20 right-5 flex flex-col gap-2 z-50"
      style={{ pointerEvents: "none" }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  const colors: Record<ToastType, { border: string; icon: string; bg: string }> = {
    success: { border: "var(--brand-green)", icon: "✓", bg: "rgba(0,200,150,0.12)" },
    error: { border: "#f87171", icon: "✕", bg: "rgba(248,113,113,0.12)" },
    info: { border: "var(--brand-cyan)", icon: "ℹ", bg: "rgba(2,132,199,0.07)" },
  };
  const style = colors[toast.type];

  return (
    <div
      className="toast-enter flex items-start gap-2.5 px-3 py-2.5 rounded-xl min-w-48 max-w-64"
      style={{
        background: `var(--bg-elevated)`,
        border: `1px solid ${style.border}60`,
        boxShadow: `0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px ${style.border}20`,
        pointerEvents: "auto",
      }}
      onClick={() => onDismiss(toast.id)}
    >
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5"
        style={{ background: style.bg, color: style.border }}
      >
        {style.icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)", fontSize: "10px" }}>
            {toast.message}
          </p>
        )}
      </div>
    </div>
  );
}

// ── useToast hook — use this in page.tsx ──
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, dismissToast };
}
