// lib/mockData.ts
// Central source of truth for all mock/placeholder data.
// Replace individual sections with real API responses as backend is built.

// ── Categorized component palette — mirrors Airtel/AWS-style service groupings ──
// Each category has an accent color, icon, and list of draggable sub-components.
// Add new categories or items here; Sidebar.tsx reads this automatically.

export interface PaletteItem {
  type: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  badge?: string; // optional tag e.g. "Managed", "Serverless"
}

export interface PaletteCategory {
  id: string;
  label: string;
  icon: string;
  color: string;         // accent color for the category header
  items: PaletteItem[];
}

export const COMPONENT_CATEGORIES: PaletteCategory[] = [
  {
    id: "compute",
    label: "Compute",
    icon: "⬡",
    color: "#4f8ef7",
    items: [
      { type: "vm",          label: "Virtual Machine",   icon: "⬡", color: "#4f8ef7", description: "General-purpose compute instance" },
      { type: "container",   label: "Container",         icon: "◫", color: "#4f8ef7", description: "Docker / OCI container unit",      badge: "K8s" },
      { type: "serverless",  label: "Serverless Fn",     icon: "λ", color: "#60a5fa", description: "Event-driven function execution",  badge: "FaaS" },
      { type: "autoscaling", label: "Auto Scaling Group",icon: "⇅", color: "#93c5fd", description: "Dynamically scales VM instances" },
    ],
  },
  {
    id: "database",
    label: "Database",
    icon: "⬢",
    color: "#00c896",
    items: [
      { type: "mysql",       label: "MySQL",          icon: "⬢", color: "#00c896", description: "Open-source relational DB",   badge: "SQL" },
      { type: "postgresql",  label: "PostgreSQL",     icon: "⬢", color: "#34d399", description: "Advanced relational DB",      badge: "SQL" },
      { type: "oracle",      label: "Oracle DB",      icon: "⬢", color: "#f87171", description: "Enterprise relational DB",    badge: "SQL" },
    ],
  },
  {
    id: "networking",
    label: "Networking",
    icon: "⟺",
    color: "#00e5ff",
    items: [
      { type: "loadbalancer", label: "Load Balancer",  icon: "⟺", color: "#00e5ff", description: "Distributes incoming traffic" },
      { type: "apigateway",   label: "API Gateway",    icon: "⟡", color: "#f7a44f", description: "API routing, auth & throttling" },
      { type: "cdn",          label: "CDN",            icon: "◌", color: "#67e8f9", description: "Content delivery at the edge",   badge: "Edge" },
      { type: "firewall",     label: "Firewall / WAF", icon: "⛨", color: "#f472b6", description: "Network & web app protection" },
      { type: "vpc",          label: "VPC",            icon: "▣", color: "#a5b4fc", description: "Isolated virtual network",       badge: "Infra" },
      { type: "dns",          label: "DNS",            icon: "◎", color: "#86efac", description: "Domain name resolution service" },
    ],
  },
  {
    id: "storage",
    label: "Storage",
    icon: "⬛",
    color: "#a78bfa",
    items: [
      { type: "objectstorage", label: "Object Storage", icon: "⬛", color: "#a78bfa", description: "Blob / S3-compatible storage" },
      { type: "blockstorage",  label: "Block Storage",  icon: "▪", color: "#c4b5fd", description: "Raw block volumes for VMs" },
      { type: "nfs",           label: "File Storage",   icon: "▤", color: "#ddd6fe", description: "NFS / shared file system" },
      { type: "backup",        label: "Backup",         icon: "↻", color: "#818cf8", description: "Scheduled data backup service",  badge: "DR" },
    ],
  },
];

// Flat list derived from categories — used for search and canvas node lookup
export const COMPONENT_PALETTE: PaletteItem[] = COMPONENT_CATEGORIES.flatMap(
  (cat) => cat.items
);

export type ComponentType = string;

// ── Latency timeseries — replaces recharts data ──
export const MOCK_LATENCY_DATA = [
  { time: "00:00", p50: 42, p95: 89, p99: 134 },
  { time: "00:05", p50: 38, p95: 82, p99: 120 },
  { time: "00:10", p50: 55, p95: 120, p99: 190 },
  { time: "00:15", p50: 61, p95: 135, p99: 210 },
  { time: "00:20", p50: 48, p95: 98, p99: 155 },
  { time: "00:25", p50: 44, p95: 90, p99: 140 },
  { time: "00:30", p50: 70, p95: 160, p99: 240 },
  { time: "00:35", p50: 52, p95: 110, p99: 175 },
  { time: "00:40", p50: 39, p95: 84, p99: 130 },
  { time: "00:45", p50: 45, p95: 95, p99: 148 },
];

// ── Throughput timeseries ──
export const MOCK_THROUGHPUT_DATA = [
  { time: "00:00", rps: 420 },
  { time: "00:05", rps: 380 },
  { time: "00:10", rps: 510 },
  { time: "00:15", rps: 620 },
  { time: "00:20", rps: 480 },
  { time: "00:25", rps: 440 },
  { time: "00:30", rps: 710 },
  { time: "00:35", rps: 530 },
  { time: "00:40", rps: 390 },
  { time: "00:45", rps: 450 },
];

// ── Resource utilization (CPU / Mem / Net) ──
export const MOCK_RESOURCE_DATA = [
  { resource: "CPU", usage: 62, max: 100, unit: "%" },
  { resource: "Memory", usage: 74, max: 100, unit: "%" },
  { resource: "Network", usage: 38, max: 100, unit: "%" },
  { resource: "Disk I/O", usage: 28, max: 100, unit: "%" },
];

// ── Cost estimation (monthly) ──
export const MOCK_COST_DATA = {
  compute: { label: "Compute", amount: 142.5, unit: "$/mo" },
  storage: { label: "Storage", amount: 28.8, unit: "$/mo" },
  network: { label: "Network Egress", amount: 19.4, unit: "$/mo" },
  total: { label: "Estimated Total", amount: 190.7, unit: "$/mo" },
};

// ── Predefined architecture templates ──
export const ARCHITECTURE_TEMPLATES = [
  {
    id: "three-tier",
    label: "3-Tier Web App",
    description: "LB → App servers → DB",
    nodeCount: 4,
  },
  {
    id: "microservices",
    label: "Microservices",
    description: "Gateway → Service mesh → Data stores",
    nodeCount: 8,
  },
  {
    id: "cdn-static",
    label: "CDN + Static",
    description: "Storage + CDN edge delivery",
    nodeCount: 3,
  },
];

// ── Simulation scenario presets ──
export const SCENARIO_PRESETS = [
  { id: "normal", label: "Normal Load", trafficMultiplier: 1, failureMode: false },
  { id: "peak", label: "Peak Traffic", trafficMultiplier: 5, failureMode: false },
  { id: "chaos", label: "Chaos Test", trafficMultiplier: 3, failureMode: true },
  { id: "spike", label: "Traffic Spike", trafficMultiplier: 10, failureMode: false },
];
