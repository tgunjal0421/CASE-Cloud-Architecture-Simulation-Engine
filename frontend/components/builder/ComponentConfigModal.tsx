"use client";
// components/builder/ComponentConfigModal.tsx
// Config form that appears when user clicks a component in the sidebar.
// User fills in specs → clicks "Add to Canvas" → node is created.
// All field definitions come from componentConfigs.ts — purely data-driven.

import React, { useState, useEffect, useRef } from "react";
import { PaletteItem } from "@/lib/mockData";
import { CONFIG_MAP, ConfigField } from "@/lib/componentConfigs";

interface ComponentConfigModalProps {
  item:    PaletteItem | null;   // null = closed
  onClose: () => void;
  onAdd:   (item: PaletteItem, values: Record<string, string | number | boolean>) => void;
}

export default function ComponentConfigModal({ item, onClose, onAdd }: ComponentConfigModalProps) {
  const [values, setValues] = useState<Record<string, string | number | boolean>>({});
  const modalRef = useRef<HTMLDivElement>(null);

  const config = item ? CONFIG_MAP[item.type] : null;

  // Reset form values when a new component is selected
  useEffect(() => {
    if (!config) return;
    const defaults: Record<string, string | number | boolean> = {};
    for (const f of config.fields) defaults[f.key] = f.default;
    setValues(defaults);
  }, [config]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!item || !config) return null;

  const handleSubmit = () => {
    if (!item) return;
    onAdd(item, values);
    onClose();
  };

  const set = (key: string, value: string | number | boolean) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  // Label used as the node name — pulled from the "name" field if present
  const previewLabel = (values["name"] as string)?.trim() || item.label;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(13,17,23,0.35)",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 201,
          width: 480, maxWidth: "calc(100vw - 32px)",
          maxHeight: "calc(100vh - 64px)",
          display: "flex", flexDirection: "column",
          background: "var(--bg-surface)",
          border: "1px solid var(--bg-border)",
          borderRadius: 6,
          boxShadow: "0 16px 48px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)",
          animation: "modalIn 0.18s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:translate(-50%,-48%)}to{opacity:1;transform:translate(-50%,-50%)}}`}</style>

        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid var(--bg-border)",
          background: "var(--bg-elevated)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Component icon badge */}
            <div style={{
              width: 32, height: 32, borderRadius: 5,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: `${item.color}15`,
              border: `1px solid ${item.color}30`,
              fontSize: 16, color: item.color, flexShrink: 0,
            }}>{item.icon}</div>
            <div>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 13, color: "var(--text-primary)", letterSpacing: "0.02em" }}>
                {config.title}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", marginTop: 2 }}>
                {config.description}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", borderRadius: 4, fontSize: 14, flexShrink: 0,
            transition: "background 0.1s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-border)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; }}
          >✕</button>
        </div>

        {/* ── Fields ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 14px" }}>
            {config.fields.map((field) => (
              <FieldInput
                key={field.key}
                field={field}
                value={values[field.key]}
                onChange={(v) => set(field.key, v)}
                accentColor={item.color}
              />
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px",
          borderTop: "1px solid var(--bg-border)",
          background: "var(--bg-elevated)",
          flexShrink: 0,
        }}>
          {/* Preview label */}
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span className="eng-label">Canvas label</span>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10,
              color: item.color, padding: "2px 8px",
              background: `${item.color}10`,
              border: `1px solid ${item.color}25`,
              borderRadius: 3,
            }}>{previewLabel}</span>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{
              padding: "6px 14px", borderRadius: 4,
              background: "none", border: "1px solid var(--bg-border)",
              color: "var(--text-secondary)", cursor: "pointer",
              fontFamily: "var(--font-ui)", fontSize: 11,
              transition: "all 0.12s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--text-muted)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--bg-border)"; }}
            >Cancel</button>

            <button onClick={handleSubmit} style={{
              padding: "6px 18px", borderRadius: 4,
              background: item.color,
              border: `1px solid ${item.color}`,
              color: "#ffffff", cursor: "pointer",
              fontFamily: "var(--font-head)", fontSize: 11,
              fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase",
              transition: "filter 0.12s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.filter = "brightness(1.1)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.filter = "none"; }}
            >
              + Add to Canvas
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Individual field renderer ──────────────────────────────────────────────
function FieldInput({
  field, value, onChange, accentColor,
}: {
  field: ConfigField;
  value: string | number | boolean | undefined;
  onChange: (v: string | number | boolean) => void;
  accentColor: string;
}) {
  // Toggle fields span full width
  const isFullWidth = field.type === "toggle";

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 4,
      gridColumn: isFullWidth ? "span 2" : "span 1",
    }}>
      <label style={{
        fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 500,
        letterSpacing: "0.08em", textTransform: "uppercase",
        color: "var(--text-muted)",
      }}>
        {field.label}
      </label>

      {field.type === "select" && (
        <select
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          style={{
            padding: "6px 8px", borderRadius: 4,
            background: "var(--bg-elevated)",
            border: "1px solid var(--bg-border)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-ui)", fontSize: 11,
            cursor: "pointer", outline: "none",
            appearance: "none" as const,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238492a6' stroke-width='1.3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "calc(100% - 8px) center",
            paddingRight: 24,
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = accentColor; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--bg-border)"; }}
        >
          {field.options!.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      {(field.type === "text") && (
        <input
          type="text"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          style={{
            padding: "6px 8px", borderRadius: 4,
            background: "var(--bg-elevated)",
            border: "1px solid var(--bg-border)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-mono)", fontSize: 11,
            outline: "none",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = accentColor; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--bg-border)"; }}
        />
      )}

      {field.type === "number" && (
        <input
          type="number"
          value={value as number}
          min={field.min}
          max={field.max}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            padding: "6px 8px", borderRadius: 4,
            background: "var(--bg-elevated)",
            border: "1px solid var(--bg-border)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-mono)", fontSize: 11,
            outline: "none",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = accentColor; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--bg-border)"; }}
        />
      )}

      {field.type === "toggle" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "6px 8px", borderRadius: 4,
          background: "var(--bg-elevated)", border: "1px solid var(--bg-border)",
        }}>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-secondary)" }}>
            {value ? "Enabled" : "Disabled"}
          </span>
          <button
            onClick={() => onChange(!value)}
            style={{
              width: 34, height: 18, borderRadius: 9, border: "none", position: "relative",
              background: value ? accentColor : "var(--bg-border)",
              cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
            }}
          >
            <div style={{
              position: "absolute", top: 2, width: 14, height: 14, borderRadius: "50%",
              background: "#ffffff",
              left: value ? 18 : 2,
              transition: "left 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }} />
          </button>
        </div>
      )}
    </div>
  );
}
