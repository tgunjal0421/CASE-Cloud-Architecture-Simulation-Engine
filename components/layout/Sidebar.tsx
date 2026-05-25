"use client";
// components/layout/Sidebar.tsx
// Clicking a component opens the ComponentConfigModal instead of direct drag.
// Drag-to-canvas still works for quick placement (uses default values).

import React, { useState, useMemo } from "react";
import { COMPONENT_CATEGORIES, ARCHITECTURE_TEMPLATES, PaletteItem, PaletteCategory } from "@/lib/mockData";
import ComponentConfigModal from "@/components/builder/ComponentConfigModal";
import { getNodeSummary } from "@/lib/componentConfigs";
import { Node } from "reactflow";
import { NODE_WIDTH } from "@/components/builder/CustomNode";
import { CaseNodeData } from "@/components/builder/CustomNode";

interface SidebarProps {
  onLoadTemplate?: (templateId: string) => void;
  onNodeAdd:       (node: Node<CaseNodeData>) => void;
}

let _nodeCounter = 1000;
const nextId = () => `node-${++_nodeCounter}`;

export default function Sidebar({ onLoadTemplate, onNodeAdd }: SidebarProps) {
  const [activeTab,       setActiveTab]       = useState<"components" | "templates">("components");
  const [searchQuery,     setSearchQuery]     = useState("");
  const [openCategories,  setOpenCategories]  = useState<Set<string>>(
    new Set(COMPONENT_CATEGORIES.map((c) => c.id))
  );
  const [selectedItem,    setSelectedItem]    = useState<PaletteItem | null>(null);

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

  // Drag still works — uses item defaults, no modal
  const handleDragStart = (e: React.DragEvent, item: PaletteItem) => {
    e.dataTransfer.setData("application/case-node-type",  item.type);
    e.dataTransfer.setData("application/case-node-label", item.label);
    e.dataTransfer.setData("application/case-node-color", item.color);
    e.dataTransfer.setData("application/case-node-icon",  item.icon);
    e.dataTransfer.effectAllowed = "copy";
  };

  // Click — open config modal
  const handleItemClick = (item: PaletteItem) => setSelectedItem(item);

  // Modal confirmed → create node at a sensible default position
  const handleModalAdd = (
    item: PaletteItem,
    values: Record<string, string | number | boolean>
  ) => {
    const label = (values["name"] as string)?.trim() || item.label;
    const node: Node<CaseNodeData> = {
      id:       nextId(),
      type:     "caseNode",
      position: { x: 200 + Math.random() * 300, y: 100 + Math.random() * 200 },
      data:     { label, type: item.type, color: item.color, icon: item.icon, configValues: values },
    };
    onNodeAdd(node);
  };

  return (
    <>
      <aside style={{
        width: 220, minWidth: 220,
        display: "flex", flexDirection: "column", height: "100%",
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--bg-border)",
      }}>

        {/* ── Header ── */}
        <div style={{ padding: "10px 12px 8px", borderBottom: "1px solid var(--bg-border)", flexShrink: 0 }}>
          <div className="eng-label" style={{ marginBottom: 7 }}>Service Catalog</div>
          {/* Tab switcher */}
          <div style={{ display: "flex", background: "var(--bg-elevated)", borderRadius: 4, padding: 2, gap: 2 }}>
            {(["components", "templates"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: "3px 0", borderRadius: 3,
                fontFamily: "var(--font-mono)", fontSize: 9,
                letterSpacing: "0.05em", textTransform: "uppercase",
                background: activeTab === tab ? "var(--bg-surface)" : "transparent",
                color: activeTab === tab ? "var(--text-primary)" : "var(--text-muted)",
                border: activeTab === tab ? "1px solid var(--bg-border)" : "1px solid transparent",
                cursor: "pointer", transition: "all 0.12s",
              }}>{tab}</button>
            ))}
          </div>
        </div>

        {/* ── Search ── */}
        {activeTab === "components" && (
          <div style={{ padding: "6px 10px", borderBottom: "1px solid var(--bg-border)", flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                width="10" height="10" viewBox="0 0 12 12" fill="none">
                <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <input type="text" placeholder="Search services…"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", paddingLeft: 26, paddingRight: 24, paddingTop: 5, paddingBottom: 5,
                  borderRadius: 4, fontFamily: "var(--font-mono)", fontSize: 10,
                  background: "var(--bg-elevated)", border: "1px solid var(--bg-border)",
                  color: "var(--text-primary)", outline: "none",
                }}
                onFocus={(e)  => { e.currentTarget.style.borderColor = "var(--brand-cyan)"; }}
                onBlur={(e)   => { e.currentTarget.style.borderColor = "var(--bg-border)"; }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{
                  position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 13,
                }}>×</button>
              )}
            </div>
          </div>
        )}

        {/* ── Hint ── */}
        {activeTab === "components" && (
          <div style={{ padding: "4px 12px", borderBottom: "1px solid var(--bg-border)", flexShrink: 0 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)", letterSpacing: "0.04em" }}>
              Click to configure · Drag for quick add
            </span>
          </div>
        )}

        {/* ── Content ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
          {activeTab === "components" ? (
            isSearching ? (
              <div style={{ padding: "4px 8px" }}>
                {searchResults.length === 0 ? (
                  <p style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 10 }}>
                    No services match
                  </p>
                ) : (
                  <>
                    <div className="eng-label" style={{ padding: "4px 4px 6px" }}>
                      {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                    </div>
                    {searchResults.map((item) => (
                      <ServiceItem key={item.type} item={item}
                        categoryLabel={item.categoryLabel} categoryColor={item.categoryColor}
                        onDragStart={handleDragStart} onClick={handleItemClick} />
                    ))}
                  </>
                )}
              </div>
            ) : (
              COMPONENT_CATEGORIES.map((cat) => (
                <CategoryAccordion key={cat.id} category={cat}
                  isOpen={openCategories.has(cat.id)}
                  onToggle={() => toggleCategory(cat.id)}
                  onDragStart={handleDragStart}
                  onClick={handleItemClick}
                />
              ))
            )
          ) : (
            <div style={{ padding: "8px" }}>
              <div className="eng-label" style={{ padding: "4px 4px 8px" }}>Quick Start</div>
              {ARCHITECTURE_TEMPLATES.map((tpl) => (
                <TemplateItem key={tpl.id} template={tpl} onClick={() => onLoadTemplate?.(tpl.id)} />
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ── Config modal ── */}
      <ComponentConfigModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAdd={handleModalAdd}
      />
    </>
  );
}

// ── Category accordion ────────────────────────────────────────────────────
function CategoryAccordion({ category, isOpen, onToggle, onDragStart, onClick }: {
  category: PaletteCategory; isOpen: boolean; onToggle: () => void;
  onDragStart: (e: React.DragEvent, item: PaletteItem) => void;
  onClick: (item: PaletteItem) => void;
}) {
  return (
    <div>
      <button onClick={onToggle} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 7,
        padding: "6px 12px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
      }}>
        <div style={{ width: 2, height: 12, borderRadius: 1, background: category.color, flexShrink: 0 }} />
        <span style={{ fontSize: 10, fontFamily: "var(--font-head)", fontWeight: 600, flex: 1,
          color: "var(--text-primary)", letterSpacing: "0.02em" }}>{category.label}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 8,
          padding: "1px 4px", borderRadius: 3,
          background: `${category.color}15`, color: category.color }}>
          {category.items.length}
        </span>
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none"
          style={{ color: "var(--text-muted)", transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}>
          <path d="M1.5 3l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div style={{ paddingBottom: 3 }}>
          {category.items.map((item) => (
            <ServiceItem key={item.type} item={item}
              onDragStart={onDragStart} onClick={onClick} />
          ))}
        </div>
      )}

      <div style={{ height: 1, background: "var(--bg-border)", margin: "0 10px", opacity: 0.6 }} />
    </div>
  );
}

// ── Service item ──────────────────────────────────────────────────────────
function ServiceItem({ item, categoryLabel, categoryColor, onDragStart, onClick }: {
  item: PaletteItem; categoryLabel?: string; categoryColor?: string;
  onDragStart: (e: React.DragEvent, item: PaletteItem) => void;
  onClick: (item: PaletteItem) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => { setDragging(true); onDragStart(e, item); }}
      onDragEnd={() => setDragging(false)}
      onClick={() => onClick(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={`Click to configure · Drag to place`}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "5px 10px 5px 20px",
        margin: "1px 5px",
        borderRadius: 4, cursor: "pointer",
        background: hovered || dragging ? "var(--bg-elevated)" : "transparent",
        border: `1px solid ${hovered || dragging ? `${item.color}25` : "transparent"}`,
        opacity: dragging ? 0.5 : 1,
        transition: "all 0.12s",
        userSelect: "none",
      }}
    >
      <div style={{
        width: 24, height: 24, borderRadius: 5, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, background: `${item.color}15`,
        border: `1px solid ${item.color}25`, color: item.color,
      }}>{item.icon}</div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 500,
            color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {item.label}
          </p>
          {item.badge && (
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 7,
              padding: "1px 3px", borderRadius: 3, flexShrink: 0,
              background: `${item.color}18`, color: item.color, letterSpacing: "0.05em",
            }}>{item.badge}</span>
          )}
        </div>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)",
          marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {categoryLabel
            ? <><span style={{ color: categoryColor, opacity: 0.8 }}>{categoryLabel} · </span>{item.description}</>
            : item.description}
        </p>
      </div>

      {/* Config arrow indicator on hover */}
      {hovered && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0, color: item.color }}>
          <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

// ── Template item ─────────────────────────────────────────────────────────
function TemplateItem({ template, onClick }: {
  template: { id: string; label: string; description: string; nodeCount: number };
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 4, marginBottom: 5,
        background: hovered ? "var(--bg-hover)" : "var(--bg-elevated)",
        border: `1px solid ${hovered ? "var(--brand-cyan)" : "var(--bg-border)"}`,
        cursor: "pointer", display: "block", transition: "all 0.12s",
      }}>
      <p style={{ fontFamily: "var(--font-head)", fontSize: 11, fontWeight: 600,
        color: "var(--text-primary)", marginBottom: 2 }}>{template.label}</p>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", marginBottom: 5 }}>
        {template.description}
      </p>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, padding: "1px 5px", borderRadius: 3,
        background: "rgba(3,105,161,0.08)", color: "var(--brand-cyan)" }}>
        {template.nodeCount} nodes
      </span>
    </button>
  );
}
