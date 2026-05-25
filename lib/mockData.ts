// lib/mockData.ts — Central component catalog and mock simulation data.

export interface PaletteItem {
  type:        string;
  label:       string;
  icon:        string;
  color:       string;
  description: string;
  badge?:      string;
}

export interface PaletteCategory {
  id:    string;
  label: string;
  icon:  string;
  color: string;
  items: PaletteItem[];
}

export const COMPONENT_CATEGORIES: PaletteCategory[] = [
  {
    id: "compute", label: "Compute", icon: "⬡", color: "#2563eb",
    items: [
      { type: "vm",          label: "Virtual Machine",    icon: "⬡", color: "#2563eb", description: "General-purpose compute instance"          },
      { type: "autoscaling", label: "Auto Scaling Group", icon: "⇅", color: "#93c5fd", description: "Dynamically scales VM instances"            },
      { type: "vmsnapshot",   label: "VM Snapshot",         icon: "◑", color: "#60a5fa", description: "Snapshot of a virtual machine instance"       },
    ],
  },
  {
    id: "database", label: "Database", icon: "⬢", color: "#059669",
    items: [
      { type: "postgresql", label: "PostgreSQL", icon: "⬢", color: "#059669", description: "Advanced relational DB",          badge: "SQL"   },
      { type: "mysql",      label: "MySQL",      icon: "⬢", color: "#10b981", description: "Open-source relational DB",       badge: "SQL"   },
      { type: "oracle",     label: "Oracle DB",  icon: "⬢", color: "#ef4444", description: "Enterprise relational DB",        badge: "SQL"   },
      { type: "mssql",      label: "MS SQL",     icon: "⬢", color: "#f59e0b", description: "Microsoft SQL Server",            badge: "SQL"   },
      { type: "mariadb",    label: "MariaDB",    icon: "⬢", color: "#34d399", description: "MySQL-compatible open-source DB", badge: "SQL"   },
    ],
  },
  {
    id: "networking", label: "Networking", icon: "⟺", color: "#0369a1",
    items: [
      { type: "loadbalancer", label: "Load Balancer", icon: "⟺", color: "#0369a1", description: "Distributes incoming traffic"      },
      { type: "apigateway",   label: "API Gateway",   icon: "⟡", color: "#0284c7", description: "API routing, auth & throttling"   },
      { type: "cdn",          label: "CDN",            icon: "◌", color: "#38bdf8", description: "Content delivery at the edge", badge: "Edge" },
      { type: "firewall",     label: "Firewall / WAF", icon: "⛨", color: "#7c3aed", description: "Network & web app protection"     },
      { type: "vpc",          label: "VPC",            icon: "▣", color: "#6366f1", description: "Isolated virtual network",     badge: "Infra"},
      { type: "dns",          label: "DNS",            icon: "◎", color: "#8b5cf6", description: "Domain name resolution"           },
    ],
  },
  {
    id: "storage", label: "Storage", icon: "⬛", color: "#7c3aed",
    items: [
      { type: "objectstorage", label: "Object Storage",   icon: "⬛", color: "#7c3aed", description: "S3-compatible blob storage"  },
      { type: "blockstorage",  label: "Volume",           icon: "▪", color: "#8b5cf6", description: "Persistent block volumes"     },
      { type: "snapshot",      label: "Volume Snapshot",  icon: "◑", color: "#a78bfa", description: "Point-in-time volume backup"  },
      { type: "nfs",           label: "File System",      icon: "▤", color: "#c4b5fd", description: "Shared NFS file system"        },
      { type: "backup",        label: "Backup",           icon: "↻", color: "#6d28d9", description: "Scheduled backup policy", badge: "DR" },
    ],
  },
];

// Flat lookup map
export const COMPONENT_PALETTE: PaletteItem[] =
  COMPONENT_CATEGORIES.flatMap(cat => cat.items);

// ── Architecture templates ─────────────────────────────────────────────────
export const ARCHITECTURE_TEMPLATES = [
  { id: "three-tier",    label: "3-Tier Web App",    description: "LB → App servers → DB",            nodeCount: 4 },
  { id: "microservices", label: "Microservices",      description: "Gateway → Service mesh → Data stores", nodeCount: 8 },
  { id: "cdn-static",   label: "CDN + Static",       description: "Storage + CDN edge delivery",      nodeCount: 3 },
];

// ── Scenario presets ───────────────────────────────────────────────────────
export const SCENARIO_PRESETS = [
  { id: "normal",      label: "Normal Load",   trafficMultiplier: 1,  failureMode: false },
  { id: "peak",        label: "Peak Traffic",  trafficMultiplier: 5,  failureMode: false },
  { id: "chaos",       label: "Chaos Test",    trafficMultiplier: 3,  failureMode: true  },
  { id: "spike",       label: "Traffic Spike", trafficMultiplier: 10, failureMode: false },
];

// ── Mock latency data ──────────────────────────────────────────────────────
export const MOCK_LATENCY_DATA = [
  { time: "00:00", p50: 42, p95: 89,  p99: 134 },
  { time: "00:05", p50: 38, p95: 82,  p99: 120 },
  { time: "00:10", p50: 55, p95: 120, p99: 190 },
  { time: "00:15", p50: 61, p95: 135, p99: 210 },
  { time: "00:20", p50: 48, p95: 98,  p99: 155 },
  { time: "00:25", p50: 44, p95: 90,  p99: 140 },
  { time: "00:30", p50: 70, p95: 160, p99: 240 },
  { time: "00:35", p50: 52, p95: 110, p99: 175 },
  { time: "00:40", p50: 39, p95: 84,  p99: 130 },
  { time: "00:45", p50: 45, p95: 95,  p99: 148 },
];

export const MOCK_THROUGHPUT_DATA = [
  { time: "00:00", rps: 420 }, { time: "00:05", rps: 380 },
  { time: "00:10", rps: 510 }, { time: "00:15", rps: 620 },
  { time: "00:20", rps: 480 }, { time: "00:25", rps: 440 },
  { time: "00:30", rps: 710 }, { time: "00:35", rps: 530 },
  { time: "00:40", rps: 390 }, { time: "00:45", rps: 450 },
];

export const MOCK_RESOURCE_DATA = [
  { resource: "CPU",     usage: 62, max: 100, unit: "%" },
  { resource: "Memory",  usage: 74, max: 100, unit: "%" },
  { resource: "Network", usage: 38, max: 100, unit: "%" },
  { resource: "Disk I/O",usage: 28, max: 100, unit: "%" },
];

export const MOCK_COST_DATA = {
  compute: { label: "Compute", amount: 142.5, unit: "$/mo" },
  storage: { label: "Storage", amount: 28.8,  unit: "$/mo" },
  network: { label: "Network Egress", amount: 19.4, unit: "$/mo" },
  total:   { label: "Estimated Total", amount: 190.7, unit: "$/mo" },
};
