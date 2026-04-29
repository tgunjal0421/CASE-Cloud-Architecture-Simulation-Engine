"use client";
// components/layout/Sidebar.tsx
// Categorized component palette — Airtel/AWS-style service groupings.
// Categories are collapsible accordions. Items inside are draggable onto the canvas.
// All data comes from COMPONENT_CATEGORIES in mockData.ts — add new services there.

import React, { useState, useMemo } from "react";
import { COMPONENT_CATEGORIES, ARCHITECTURE_TEMPLATES, PaletteItem, PaletteCategory } from "@/lib/mockData";

interface SidebarProps {
  onLoadTemplate?: (templateId: string) => void;
}

export default function Sidebar({ onLoadTemplate }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"components" | "templates">("components");
  const [searchQuery, setSearchQuery] = useState("");
  // Track which category accordions are open — all open by default
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(COMPONENT_CATEGORIES.map((c) => c.id))
  );

  // When searching: flatten all items and filter across all categories
  const isSearching = searchQuery.trim().length > 0;
  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = searchQuery.toLowerCase();
    return COMPONENT_CATEGORIES.flatMap((cat) =>
      cat.items
        .filter((item) =>
          item.label.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          cat.label.toLowerCase().includes(q)
        )
        .map((item) => ({ ...item, categoryLabel: cat.label, categoryColor: cat.color }))
    );
  }, [searchQuery, isSearching]);

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, item: PaletteItem) => {
    // Pass full item data so the canvas can build the node with correct label/color
    e.dataTransfer.setData("application/case-node-type", item.type);
    e.dataTransfer.setData("application/case-node-label", item.label);
    e.dataTransfer.setData("application/case-node-color", item.color);
    e.dataTransfer.setData("application/case-node-icon", item.icon);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <aside
      style={{
        width: 230,
        minWidth: 230,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--bg-border)",
      }}
    >
      {/* ── Header ── */}
      <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid var(--bg-border)" }}>
        <p className="label-mono" style={{ marginBottom: 8 }}>Service Catalog</p>

        {/* Tab switcher */}
        <div style={{ display: "flex", background: "var(--bg-elevated)", borderRadius: 8, padding: 2, gap: 2 }}>
          {(["components", "templates"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: "4px 0", borderRadius: 6, fontSize: 11, fontWeight: 500,
                background: activeTab === tab ? "var(--bg-border)" : "transparent",
                color: activeTab === tab ? "var(--text-primary)" : "var(--text-muted)",
                border: "none", cursor: "pointer", textTransform: "capitalize",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Search bar (components tab only) ── */}
      {activeTab === "components" && (
        <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--bg-border)" }}>
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
              width="11" height="11" viewBox="0 0 12 12" fill="none">
              <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search services…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%", paddingLeft: 28, paddingRight: 10, paddingTop: 6, paddingBottom: 6,
                borderRadius: 8, fontSize: 11, background: "var(--bg-elevated)",
                border: "1px solid var(--bg-border)", color: "var(--text-primary)", outline: "none",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer",
                  fontSize: 12, lineHeight: 1,
                }}
              >×</button>
            )}
          </div>
        </div>
      )}

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
        {activeTab === "components" ? (
          isSearching ? (
            // ── Search results (flat list with category badge) ──
            <div style={{ padding: "4px 8px" }}>
              {searchResults.length === 0 ? (
                <p style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: 11 }}>
                  No services match
                </p>
              ) : (
                <>
                  <p className="label-mono" style={{ padding: "4px 4px 8px" }}>
                    {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                  </p>
                  {searchResults.map((item) => (
                    <DraggableItem
                      key={item.type}
                      item={item}
                      categoryLabel={item.categoryLabel}
                      categoryColor={item.categoryColor}
                      onDragStart={handleDragStart}
                    />
                  ))}
                </>
              )}
            </div>
          ) : (
            // ── Categorized accordion view ──
            COMPONENT_CATEGORIES.map((category) => (
              <CategoryAccordion
                key={category.id}
                category={category}
                isOpen={openCategories.has(category.id)}
                onToggle={() => toggleCategory(category.id)}
                onDragStart={handleDragStart}
              />
            ))
          )
        ) : (
          // ── Templates tab ──
          <div style={{ padding: "8px" }}>
            <p className="label-mono" style={{ padding: "4px 4px 8px" }}>Quick Start</p>
            {ARCHITECTURE_TEMPLATES.map((template) => (
              <TemplateItem
                key={template.id}
                template={template}
                onClick={() => onLoadTemplate?.(template.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{ padding: "10px 14px", borderTop: "1px solid var(--bg-border)", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: 10 }}>
          Drag any service onto the canvas
        </p>
      </div>
    </aside>
  );
}

// ── Category Accordion ────────────────────────────────────────────────────

function CategoryAccordion({
  category,
  isOpen,
  onToggle,
  onDragStart,
}: {
  category: PaletteCategory;
  isOpen: boolean;
  onToggle: () => void;
  onDragStart: (e: React.DragEvent, item: PaletteItem) => void;
}) {
  return (
    <div style={{ marginBottom: 2 }}>
      {/* Category header — clickable to collapse */}
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8,
          padding: "7px 14px", background: "none", border: "none", cursor: "pointer",
          textAlign: "left",
        }}
      >
        {/* Color accent bar */}
        <div style={{ width: 3, height: 14, borderRadius: 2, background: category.color, flexShrink: 0 }} />

        {/* Category icon */}
        <span style={{ color: category.color, fontSize: 12, flexShrink: 0 }}>{category.icon}</span>

        {/* Label */}
        <span style={{
          flex: 1, fontSize: 11, fontWeight: 600, color: "var(--text-primary)",
          fontFamily: "'Syne', sans-serif", letterSpacing: "0.02em",
        }}>
          {category.label}
        </span>

        {/* Item count badge */}
        <span style={{
          fontSize: 9, padding: "1px 5px", borderRadius: 10,
          background: category.color + "20", color: category.color,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {category.items.length}
        </span>

        {/* Chevron */}
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ color: "var(--text-muted)", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Items list — collapses smoothly */}
      {isOpen && (
        <div style={{ paddingBottom: 4 }}>
          {category.items.map((item) => (
            <DraggableItem
              key={item.type}
              item={item}
              onDragStart={onDragStart}
            />
          ))}
        </div>
      )}

      {/* Separator line */}
      <div style={{ height: 1, background: "var(--bg-border)", margin: "0 10px", opacity: 0.5 }} />
    </div>
  );
}

// ── Draggable Service Item ────────────────────────────────────────────────

function DraggableItem({
  item,
  categoryLabel,
  categoryColor,
  onDragStart,
}: {
  item: PaletteItem;
  categoryLabel?: string;
  categoryColor?: string;
  onDragStart: (e: React.DragEvent, item: PaletteItem) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => { setIsDragging(true); onDragStart(e, item); }}
      onDragEnd={() => setIsDragging(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`Drag to add ${item.label}`}
      style={{
        display: "flex", alignItems: "center", gap: 9,
        padding: "6px 10px 6px 22px", // left indent to sit under category bar
        margin: "1px 6px",
        borderRadius: 8, cursor: "grab", userSelect: "none",
        background: isHovered || isDragging ? "var(--bg-elevated)" : "transparent",
        border: `1px solid ${isHovered || isDragging ? item.color + "35" : "transparent"}`,
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? "scale(0.97)" : "scale(1)",
        transition: "all 0.15s",
      }}
    >
      {/* Icon badge */}
      <div style={{
        width: 26, height: 26, borderRadius: 7, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, background: item.color + "18", border: `1px solid ${item.color}35`,
        color: item.color,
      }}>
        {item.icon}
      </div>

      {/* Text */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {item.label}
          </p>
          {item.badge && (
            <span style={{
              fontSize: 8, padding: "1px 4px", borderRadius: 4, flexShrink: 0,
              background: item.color + "22", color: item.color,
              fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em",
            }}>
              {item.badge}
            </span>
          )}
        </div>
        <p style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {categoryLabel ? (
            <><span style={{ color: categoryColor, opacity: 0.8 }}>{categoryLabel} · </span>{item.description}</>
          ) : item.description}
        </p>
      </div>
    </div>
  );
}

// ── Template Item ─────────────────────────────────────────────────────────

function TemplateItem({
  template,
  onClick,
}: {
  template: { id: string; label: string; description: string; nodeCount: number };
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 10, marginBottom: 6,
        background: isHovered ? "var(--bg-hover)" : "var(--bg-elevated)",
        border: `1px solid ${isHovered ? "var(--brand-cyan, #00e5ff)40" : "var(--bg-border)"}`,
        cursor: "pointer", display: "block",
      }}
    >
      <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3, fontFamily: "'Syne', sans-serif" }}>
        {template.label}
      </p>
      <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6 }}>
        {template.description}
      </p>
      <span style={{
        fontSize: 9, padding: "2px 6px", borderRadius: 5,
        background: "rgba(0,229,255,0.1)", color: "#00e5ff",
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {template.nodeCount} nodes
      </span>
    </button>
  );
}
