"use client";
// components/builder/ComponentConfigModal.tsx
// Schema-driven config modal. Reads sections + fields from componentConfigs.ts.
// Supports: text, textarea, number, select, password, toggle, showIf conditions.
// Two modes: "add" (deploy to canvas) and "edit" (update existing node).

import React, { useState, useEffect, useRef } from "react";
import { PaletteItem } from "@/lib/mockData";
import { CONFIG_MAP, ConfigField, getDefaultValues } from "@/lib/componentConfigs";

interface Props {
  item:          PaletteItem | null;
  mode?:         "add" | "edit";
  initialValues?: Record<string, string | number | boolean>;
  onClose:       () => void;
  onAdd:         (item: PaletteItem, values: Record<string, string | number | boolean>) => void;
}

export default function ComponentConfigModal({
  item, mode = "add", initialValues, onClose, onAdd,
}: Props) {
  const [values,   setValues]   = useState<Record<string, string | number | boolean>>({});
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [showPwd,  setShowPwd]  = useState<Record<string, boolean>>({});
  const modalRef = useRef<HTMLDivElement>(null);

  const config = item ? CONFIG_MAP[item.type] : null;

  // Load defaults or saved values when modal opens
  useEffect(() => {
    if (!config || !item) return;
    const defaults = getDefaultValues(item.type);
    setValues(initialValues ? { ...defaults, ...initialValues } : defaults);
    setErrors({});
  }, [config, item, initialValues]);

  // Escape key to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  if (!item || !config) return null;

  const set = (key: string, val: string | number | boolean) => {
    setValues(prev => ({ ...prev, [key]: val }));
    // Clear error on change
    if (errors[key]) setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
  };

  // Validate required fields
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const section of config.sections) {
      for (const field of section.fields) {
        if (!field.required) continue;
        const val = values[field.key];
        if (val === undefined || val === "" || val === null) {
          newErrors[field.key] = `${field.label} is required`;
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onAdd(item, values);
    onClose();
  };

  // Preview label from "name" field
  const previewLabel = (values["name"] as string)?.trim()
    || (values["clusterName"] as string)?.trim()
    || (values["bucketName"] as string)?.trim()
    || item.label;

  const isEdit = mode === "edit";

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(15,23,42,0.4)",
        backdropFilter: "blur(3px)",
      }} />

      {/* Modal */}
      <div ref={modalRef} style={{
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 201,
        width: 560, maxWidth: "calc(100vw - 32px)",
        maxHeight: "calc(100vh - 48px)",
        display: "flex", flexDirection: "column",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
        animation: "modalIn 0.16s cubic-bezier(0.16,1,0.3,1)",
        overflow: "hidden",
      }}>
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: translate(-50%, -47%); }
            to   { opacity: 1; transform: translate(-50%, -50%); }
          }
        `}</style>

        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 18px",
          borderBottom: "1px solid #f1f5f9",
          background: "#f8fafc",
          flexShrink: 0,
        }}>
          {/* Icon */}
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: `${item.color}14`,
            border: `1px solid ${item.color}28`,
            fontSize: 17, color: item.color,
          }}>{item.icon}</div>

          {/* Title + description */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{
              fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 15,
              color: "#0f172a", margin: 0, letterSpacing: "0.01em",
            }}>
              {isEdit ? `Edit — ${config.title}` : `Configure ${config.title}`}
            </h2>
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: 10, color: "#64748b",
              margin: 0, marginTop: 2,
            }}>{config.description}</p>
          </div>

          {/* Close */}
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 6, border: "none",
            background: "none", cursor: "pointer", color: "#94a3b8",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, transition: "background 0.1s, color 0.1s", flexShrink: 0,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; (e.currentTarget as HTMLElement).style.color = "#475569"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none";    (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}
          >✕</button>
        </div>

        {/* ── Scrollable body with sections ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
          {config.sections.map((section, si) => (
            <div key={si} style={{ marginBottom: si < config.sections.length - 1 ? 20 : 0 }}>
              {/* Section header */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10, marginBottom: 12,
              }}>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: item.color, flexShrink: 0,
                }}>{section.title}</span>
                <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
              </div>

              {/* Fields — 2-column grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
                {section.fields.map(field => {
                  // showIf condition
                  if (field.showIf) {
                    const condVal = values[field.showIf.key];
                    if (condVal !== field.showIf.value) return null;
                  }

                  // Full-width for: textarea, toggle, text with long labels
                  const fullWidth =
                    field.type === "textarea" ||
                    field.type === "toggle" ||
                    field.key === "description" ||
                    field.key === "associatedVolume" ||
                    field.key === "associatedVM" ||
                    field.key === "snapshotName" ||
                    field.key === "originDomain";

                  return (
                    <div key={field.key} style={{
                      gridColumn: fullWidth ? "span 2" : "span 1",
                      display: "flex", flexDirection: "column", gap: 4,
                    }}>
                      {field.type !== "toggle" && (
                        <label style={{
                          fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
                          letterSpacing: "0.08em", textTransform: "uppercase",
                          color: errors[field.key] ? "#dc2626" : "#64748b",
                          display: "flex", alignItems: "center", gap: 4,
                        }}>
                          {field.label}
                          {field.required && <span style={{ color: "#dc2626" }}>*</span>}
                          {field.unit && (
                            <span style={{ fontWeight: 400, textTransform: "none", color: "#94a3b8", marginLeft: 2 }}>
                              ({field.unit})
                            </span>
                          )}
                        </label>
                      )}

                      <FieldRenderer
                        field={field}
                        value={values[field.key]}
                        error={errors[field.key]}
                        showPwd={showPwd[field.key] ?? false}
                        accentColor={item.color}
                        onChange={val => set(field.key, val)}
                        onTogglePwd={() => setShowPwd(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                      />

                      {field.helperText && !errors[field.key] && (
                        <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "#94a3b8", margin: 0 }}>
                          {field.helperText}
                        </p>
                      )}
                      {errors[field.key] && (
                        <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "#dc2626", margin: 0 }}>
                          {errors[field.key]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 18px",
          borderTop: "1px solid #f1f5f9",
          background: "#f8fafc",
          flexShrink: 0,
        }}>
          {/* Label preview */}
          <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}>
              Node label
            </span>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
              color: item.color, padding: "2px 8px",
              background: `${item.color}10`, border: `1px solid ${item.color}22`,
              borderRadius: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200,
            }}>{previewLabel}</span>
          </div>

          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={onClose} style={{
              padding: "7px 16px", borderRadius: 6, fontSize: 12, fontWeight: 500,
              background: "none", border: "1px solid #e2e8f0", color: "#475569",
              cursor: "pointer", fontFamily: "var(--font-ui)", transition: "all 0.12s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#94a3b8"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; }}
            >Cancel</button>

            <button onClick={handleSubmit} style={{
              padding: "7px 20px", borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: item.color, border: `1px solid ${item.color}`,
              color: "#ffffff", cursor: "pointer",
              fontFamily: "var(--font-head)", letterSpacing: "0.04em",
              transition: "filter 0.12s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = "brightness(1.08)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = "none"; }}
            >
              {isEdit ? "Save Changes" : "+ Deploy to Canvas"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Field renderer ─────────────────────────────────────────────────────────
function FieldRenderer({
  field, value, error, showPwd, accentColor, onChange, onTogglePwd,
}: {
  field:        ConfigField;
  value:        string | number | boolean | undefined;
  error?:       string;
  showPwd:      boolean;
  accentColor:  string;
  onChange:     (v: string | number | boolean) => void;
  onTogglePwd:  () => void;
}) {
  const baseInput: React.CSSProperties = {
    width: "100%", padding: "7px 10px",
    borderRadius: 6, fontSize: 12,
    background: "#f9fafb",
    border: `1px solid ${error ? "#fca5a5" : "#e2e8f0"}`,
    color: "#111827", outline: "none",
    fontFamily: "var(--font-ui)",
    boxSizing: "border-box" as const,
    transition: "border-color 0.12s, box-shadow 0.12s",
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = accentColor;
    e.currentTarget.style.boxShadow   = `0 0 0 3px ${accentColor}18`;
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = error ? "#fca5a5" : "#e2e8f0";
    e.currentTarget.style.boxShadow   = "none";
  };

  if (field.type === "select") {
    return (
      <div style={{ position: "relative" }}>
        <select
          value={value as string}
          onChange={e => onChange(e.target.value)}
          style={{
            ...baseInput,
            appearance: "none" as const,
            cursor: "pointer",
            paddingRight: 28,
          }}
          onFocus={focusStyle as any}
          onBlur={blurStyle as any}
        >
          {field.options!.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <svg style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }}
          width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M2 4l3.5 3.5L9 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        value={value as string}
        onChange={e => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={2}
        style={{ ...baseInput, resize: "vertical" as const, minHeight: 52, fontFamily: "var(--font-ui)" }}
        onFocus={focusStyle as any}
        onBlur={blurStyle as any}
      />
    );
  }

  if (field.type === "number") {
    return (
      <input
        type="number"
        value={value as number}
        min={field.min}
        max={field.max}
        onChange={e => onChange(Number(e.target.value))}
        style={{ ...baseInput, fontFamily: "var(--font-mono)" }}
        onFocus={focusStyle as any}
        onBlur={blurStyle as any}
      />
    );
  }

  if (field.type === "password") {
    return (
      <div style={{ position: "relative" }}>
        <input
          type={showPwd ? "text" : "password"}
          value={value as string}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          style={{ ...baseInput, fontFamily: "var(--font-mono)", paddingRight: 36 }}
          onFocus={focusStyle as any}
          onBlur={blurStyle as any}
        />
        <button
          type="button"
          onClick={onTogglePwd}
          style={{
            position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            color: "#94a3b8", padding: 2, display: "flex", alignItems: "center",
          }}
        >
          {showPwd ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z" stroke="currentColor" strokeWidth="1.2"/><circle cx="7" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M2 2l10 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z" stroke="currentColor" strokeWidth="1.2"/><circle cx="7" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>
          )}
        </button>
      </div>
    );
  }

  if (field.type === "toggle") {
    const checked = value as boolean;
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "7px 10px", borderRadius: 6,
        background: "#f9fafb", border: "1px solid #e2e8f0",
      }}>
        <div>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "#374151", fontWeight: 500 }}>
            {field.label}
          </span>
          {field.helperText && (
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "#94a3b8", margin: "1px 0 0" }}>
              {field.helperText}
            </p>
          )}
        </div>
        <button
          onClick={() => onChange(!checked)}
          style={{
            width: 36, height: 20, borderRadius: 10, border: "none", position: "relative", flexShrink: 0,
            background: checked ? accentColor : "#cbd5e1",
            cursor: "pointer", transition: "background 0.2s",
          }}
        >
          <div style={{
            position: "absolute", top: 2, width: 16, height: 16, borderRadius: "50%",
            background: "#ffffff",
            left: checked ? 18 : 2,
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
          }} />
        </button>
      </div>
    );
  }

  // Default: text
  return (
    <input
      type="text"
      value={value as string}
      onChange={e => onChange(e.target.value)}
      placeholder={field.placeholder}
      style={baseInput}
      onFocus={focusStyle as any}
      onBlur={blurStyle as any}
    />
  );
}
