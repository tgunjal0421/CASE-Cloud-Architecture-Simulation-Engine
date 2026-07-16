// lib/componentConfigs.ts
// Config form definitions for every component type.
// Each entry defines the fields shown in the ComponentConfigModal.
// When backend is ready, these defaults can come from an API.

export type FieldType = "select" | "text" | "number" | "range" | "toggle";

export interface ConfigField {
  key:          string;
  label:        string;
  type:         FieldType;
  options?:     string[];       // for select
  default:      string | number | boolean;
  unit?:        string;         // display suffix e.g. "GB", "vCPU"
  min?:         number;
  max?:         number;
  placeholder?: string;
}

export interface ComponentConfig {
  type:        string;
  title:       string;
  description: string;
  fields:      ConfigField[];
}

const CONFIGS: ComponentConfig[] = [

  // ── COMPUTE ──────────────────────────────────────────────────────────────

  {
    type: "vm",
    title: "Virtual Machine",
    description: "General-purpose compute instance with configurable OS, CPU, memory, and storage.",
    fields: [
      { key: "name",        label: "Instance Name",   type: "text",   default: "vm-instance-01",  placeholder: "e.g. web-server-01" },
      { key: "os",          label: "Operating System",type: "select", default: "Ubuntu 22.04 LTS",
        options: ["Ubuntu 22.04 LTS", "Ubuntu 20.04 LTS", "CentOS 9", "Debian 12", "Windows Server 2022", "RHEL 9"] },
      { key: "vcpu",        label: "vCPUs",           type: "select", default: "2 vCPU",
        options: ["1 vCPU", "2 vCPU", "4 vCPU", "8 vCPU", "16 vCPU", "32 vCPU"] },
      { key: "memory",      label: "Memory",          type: "select", default: "4 GB",
        options: ["1 GB", "2 GB", "4 GB", "8 GB", "16 GB", "32 GB", "64 GB"] },
      { key: "storage",     label: "Root Volume",     type: "select", default: "50 GB SSD",
        options: ["20 GB SSD", "50 GB SSD", "100 GB SSD", "200 GB SSD", "500 GB SSD", "1 TB HDD"] },
      { key: "subnet",      label: "Subnet Zone",     type: "select", default: "us-east-1a",
        options: ["us-east-1a", "us-east-1b", "us-west-2a", "eu-west-1a", "ap-south-1a"] },
      { key: "publicIp",    label: "Public IP",       type: "toggle", default: true },
    ],
  },

  {
    type: "container",
    title: "Container",
    description: "Docker / OCI container unit, typically orchestrated by Kubernetes.",
    fields: [
      { key: "name",        label: "Container Name",  type: "text",   default: "my-container",    placeholder: "e.g. api-service" },
      { key: "image",       label: "Base Image",      type: "text",   default: "nginx:latest",    placeholder: "e.g. node:18-alpine" },
      { key: "runtime",     label: "Runtime",         type: "select", default: "Docker",
        options: ["Docker", "containerd", "CRI-O", "Podman"] },
      { key: "cpu",         label: "CPU Request",     type: "select", default: "250m",
        options: ["100m", "250m", "500m", "1000m (1 core)", "2000m (2 cores)"] },
      { key: "memory",      label: "Memory Limit",    type: "select", default: "512 Mi",
        options: ["128 Mi", "256 Mi", "512 Mi", "1 Gi", "2 Gi", "4 Gi"] },
      { key: "replicas",    label: "Replicas",        type: "number", default: 2,    min: 1, max: 50 },
      { key: "namespace",   label: "K8s Namespace",   type: "text",   default: "default",         placeholder: "e.g. production" },
    ],
  },

  {
    type: "serverless",
    title: "Serverless Function",
    description: "Event-driven function execution — pay per invocation, zero idle cost.",
    fields: [
      { key: "name",        label: "Function Name",   type: "text",   default: "my-function",     placeholder: "e.g. process-order" },
      { key: "runtime",     label: "Runtime",         type: "select", default: "Node.js 20",
        options: ["Node.js 20", "Node.js 18", "Python 3.12", "Python 3.11", "Go 1.21", "Java 21", "Ruby 3.2"] },
      { key: "memory",      label: "Memory",          type: "select", default: "256 MB",
        options: ["128 MB", "256 MB", "512 MB", "1 GB", "2 GB", "4 GB", "10 GB"] },
      { key: "timeout",     label: "Timeout",         type: "select", default: "30s",
        options: ["5s", "15s", "30s", "60s", "300s", "900s"] },
      { key: "trigger",     label: "Trigger",         type: "select", default: "HTTP",
        options: ["HTTP", "Queue", "Schedule (Cron)", "Storage Event", "Pub/Sub"] },
      { key: "concurrency", label: "Max Concurrency", type: "number", default: 100, min: 1, max: 1000 },
    ],
  },

  {
    type: "autoscaling",
    title: "Auto Scaling Group",
    description: "Automatically adjusts the number of VM instances based on demand.",
    fields: [
      { key: "name",        label: "Group Name",      type: "text",   default: "asg-01",           placeholder: "e.g. web-asg" },
      { key: "minSize",     label: "Min Instances",   type: "number", default: 1,   min: 0,  max: 100 },
      { key: "maxSize",     label: "Max Instances",   type: "number", default: 10,  min: 1,  max: 1000 },
      { key: "desired",     label: "Desired Capacity",type: "number", default: 2,   min: 0,  max: 100 },
      { key: "policy",      label: "Scaling Policy",  type: "select", default: "CPU Utilization",
        options: ["CPU Utilization", "Memory Utilization", "Request Count", "Custom Metric", "Schedule"] },
      { key: "threshold",   label: "Scale-out at",    type: "select", default: "70%",
        options: ["50%", "60%", "70%", "80%", "90%"] },
      { key: "cooldown",    label: "Cooldown Period",  type: "select", default: "300s",
        options: ["60s", "120s", "300s", "600s"] },
    ],
  },

  // ── DATABASE ─────────────────────────────────────────────────────────────

  {
    type: "mysql",
    title: "MySQL",
    description: "Open-source relational database — ideal for web applications and OLTP workloads.",
    fields: [
      { key: "name",        label: "Instance Name",   type: "text",   default: "mysql-db-01",      placeholder: "e.g. orders-db" },
      { key: "version",     label: "MySQL Version",   type: "select", default: "MySQL 8.0",
        options: ["MySQL 8.0", "MySQL 8.1", "MySQL 5.7"] },
      { key: "instance",    label: "Instance Size",   type: "select", default: "db.t3.medium",
        options: ["db.t3.micro", "db.t3.small", "db.t3.medium", "db.m5.large", "db.m5.xlarge", "db.r5.xlarge"] },
      { key: "storage",     label: "Storage",         type: "select", default: "100 GB SSD",
        options: ["20 GB SSD", "50 GB SSD", "100 GB SSD", "250 GB SSD", "500 GB SSD", "1 TB SSD"] },
      { key: "multiAz",     label: "Multi-AZ",        type: "toggle", default: false },
      { key: "backup",      label: "Backup Retention",type: "select", default: "7 days",
        options: ["1 day", "3 days", "7 days", "14 days", "30 days"] },
      { key: "subnet",      label: "Subnet Zone",     type: "select", default: "us-east-1a",
        options: ["us-east-1a", "us-east-1b", "us-west-2a", "eu-west-1a"] },
    ],
  },

  {
    type: "postgresql",
    title: "PostgreSQL",
    description: "Advanced open-source relational DB with strong ACID compliance and JSON support.",
    fields: [
      { key: "name",        label: "Instance Name",   type: "text",   default: "postgres-db-01",   placeholder: "e.g. analytics-db" },
      { key: "version",     label: "PG Version",      type: "select", default: "PostgreSQL 16",
        options: ["PostgreSQL 16", "PostgreSQL 15", "PostgreSQL 14", "PostgreSQL 13"] },
      { key: "instance",    label: "Instance Size",   type: "select", default: "db.t3.medium",
        options: ["db.t3.micro", "db.t3.small", "db.t3.medium", "db.m5.large", "db.m5.xlarge", "db.r5.xlarge"] },
      { key: "storage",     label: "Storage",         type: "select", default: "100 GB SSD",
        options: ["20 GB SSD", "50 GB SSD", "100 GB SSD", "250 GB SSD", "500 GB SSD", "1 TB SSD"] },
      { key: "extensions",  label: "Extensions",      type: "select", default: "PostGIS",
        options: ["None", "PostGIS", "pg_vector", "TimescaleDB", "pg_trgm"] },
      { key: "multiAz",     label: "Multi-AZ",        type: "toggle", default: false },
      { key: "subnet",      label: "Subnet Zone",     type: "select", default: "us-east-1a",
        options: ["us-east-1a", "us-east-1b", "us-west-2a", "eu-west-1a"] },
    ],
  },

  {
    type: "oracle",
    title: "Oracle DB",
    description: "Enterprise-grade relational database for mission-critical workloads.",
    fields: [
      { key: "name",        label: "Instance Name",   type: "text",   default: "oracle-db-01",     placeholder: "e.g. erp-db" },
      { key: "version",     label: "Oracle Version",  type: "select", default: "Oracle 19c",
        options: ["Oracle 21c", "Oracle 19c", "Oracle 18c", "Oracle 12c R2"] },
      { key: "edition",     label: "Edition",         type: "select", default: "Enterprise",
        options: ["Standard Edition 2", "Enterprise", "Enterprise + RAC"] },
      { key: "instance",    label: "Instance Shape",  type: "select", default: "VM.Standard2.4",
        options: ["VM.Standard2.1", "VM.Standard2.2", "VM.Standard2.4", "VM.Standard2.8", "BM.Standard2.52"] },
      { key: "storage",     label: "Data Storage",    type: "select", default: "500 GB",
        options: ["100 GB", "250 GB", "500 GB", "1 TB", "2 TB", "4 TB"] },
      { key: "license",     label: "License",         type: "select", default: "License Included",
        options: ["License Included", "BYOL"] },
      { key: "dataguard",   label: "Data Guard",      type: "toggle", default: false },
    ],
  },

  // ── NETWORKING ───────────────────────────────────────────────────────────

  {
    type: "loadbalancer",
    title: "Load Balancer",
    description: "Distributes incoming traffic across backend instances for high availability.",
    fields: [
      { key: "name",        label: "LB Name",         type: "text",   default: "lb-01",            placeholder: "e.g. web-lb" },
      { key: "lbType",      label: "Type",            type: "select", default: "Application (L7)",
        options: ["Application (L7)", "Network (L4)", "Classic", "Gateway"] },
      { key: "scheme",      label: "Scheme",          type: "select", default: "Internet-facing",
        options: ["Internet-facing", "Internal"] },
      { key: "protocol",    label: "Protocol",        type: "select", default: "HTTPS",
        options: ["HTTP", "HTTPS", "TCP", "UDP", "TCP+UDP"] },
      { key: "port",        label: "Listener Port",   type: "number", default: 443, min: 1, max: 65535 },
      { key: "algorithm",   label: "Algorithm",       type: "select", default: "Round Robin",
        options: ["Round Robin", "Least Connections", "IP Hash", "Weighted"] },
      { key: "healthCheck", label: "Health Check",    type: "toggle", default: true },
    ],
  },

  {
    type: "apigateway",
    title: "API Gateway",
    description: "Managed API routing with built-in auth, throttling, and request transformation.",
    fields: [
      { key: "name",        label: "Gateway Name",    type: "text",   default: "api-gw-01",        placeholder: "e.g. public-api" },
      { key: "protocol",    label: "Protocol",        type: "select", default: "REST",
        options: ["REST", "HTTP", "WebSocket", "gRPC"] },
      { key: "auth",        label: "Auth Type",       type: "select", default: "JWT / OAuth2",
        options: ["None", "API Key", "JWT / OAuth2", "IAM", "Lambda Authorizer"] },
      { key: "throttle",    label: "Rate Limit",      type: "select", default: "1000 req/s",
        options: ["100 req/s", "500 req/s", "1000 req/s", "5000 req/s", "Unlimited"] },
      { key: "stage",       label: "Stage",           type: "text",   default: "prod",             placeholder: "e.g. v1, staging" },
      { key: "caching",     label: "Response Cache",  type: "toggle", default: false },
      { key: "logging",     label: "Access Logging",  type: "toggle", default: true },
    ],
  },

  {
    type: "cdn",
    title: "CDN",
    description: "Content delivery network that serves assets from edge locations worldwide.",
    fields: [
      { key: "name",        label: "Distribution Name", type: "text", default: "cdn-dist-01",      placeholder: "e.g. static-assets" },
      { key: "origin",      label: "Origin Type",     type: "select", default: "S3 / Object Store",
        options: ["S3 / Object Store", "Load Balancer", "Custom HTTP Origin", "Media Package"] },
      { key: "cachePolicy", label: "Cache Policy",    type: "select", default: "CachingOptimized",
        options: ["CachingOptimized", "CachingDisabled", "CachingOptimizedForImages", "Custom"] },
      { key: "ttl",         label: "Default TTL",     type: "select", default: "86400s (1 day)",
        options: ["0s (no cache)", "3600s (1h)", "86400s (1 day)", "604800s (1 week)", "2592000s (30 days)"] },
      { key: "https",       label: "HTTPS Only",      type: "toggle", default: true },
      { key: "geo",         label: "Geo Restriction", type: "select", default: "None",
        options: ["None", "Whitelist", "Blacklist"] },
    ],
  },

  {
    type: "firewall",
    title: "Firewall / WAF",
    description: "Network-level and web application firewall protecting against threats.",
    fields: [
      { key: "name",        label: "Firewall Name",   type: "text",   default: "waf-01",           placeholder: "e.g. edge-firewall" },
      { key: "mode",        label: "Mode",            type: "select", default: "Prevention",
        options: ["Detection", "Prevention"] },
      { key: "rules",       label: "Ruleset",         type: "select", default: "OWASP Top 10",
        options: ["OWASP Top 10", "AWS Managed Rules", "Custom Rules", "Bot Control", "Fraud Control"] },
      { key: "rateLimit",   label: "Rate Limit",      type: "select", default: "2000 req/5min",
        options: ["500 req/5min", "1000 req/5min", "2000 req/5min", "5000 req/5min", "None"] },
      { key: "logging",     label: "Log Traffic",     type: "toggle", default: true },
      { key: "ipv6",        label: "IPv6 Support",    type: "toggle", default: true },
    ],
  },

  {
    type: "vpc",
    title: "VPC",
    description: "Isolated virtual private cloud network with configurable subnets and routing.",
    fields: [
      { key: "name",        label: "VPC Name",        type: "text",   default: "vpc-main",         placeholder: "e.g. prod-vpc" },
      { key: "cidr",        label: "CIDR Block",      type: "select", default: "10.0.0.0/16",
        options: ["10.0.0.0/16", "10.1.0.0/16", "172.16.0.0/12", "192.168.0.0/16"] },
      { key: "subnets",     label: "Subnets",         type: "select", default: "2 Public + 2 Private",
        options: ["1 Public", "2 Public", "2 Public + 2 Private", "3 Public + 3 Private", "Custom"] },
      { key: "natGateway",  label: "NAT Gateway",     type: "toggle", default: true },
      { key: "flowLogs",    label: "Flow Logs",       type: "toggle", default: false },
      { key: "region",      label: "Region",          type: "select", default: "us-east-1",
        options: ["us-east-1", "us-west-2", "eu-west-1", "eu-central-1", "ap-south-1", "ap-southeast-1"] },
    ],
  },

  {
    type: "dns",
    title: "DNS",
    description: "Managed DNS for domain name resolution with routing policies.",
    fields: [
      { key: "name",        label: "Zone Name",       type: "text",   default: "example.com",      placeholder: "e.g. myapp.io" },
      { key: "zoneType",    label: "Zone Type",       type: "select", default: "Public",
        options: ["Public", "Private"] },
      { key: "routing",     label: "Routing Policy",  type: "select", default: "Simple",
        options: ["Simple", "Weighted", "Latency-based", "Failover", "Geolocation"] },
      { key: "ttl",         label: "Default TTL",     type: "select", default: "300s",
        options: ["60s", "300s", "3600s", "86400s"] },
      { key: "dnssec",      label: "DNSSEC",          type: "toggle", default: false },
    ],
  },

  // ── STORAGE ──────────────────────────────────────────────────────────────

  {
    type: "objectstorage",
    title: "Object Storage",
    description: "Scalable S3-compatible blob / file storage for unstructured data.",
    fields: [
      { key: "name",        label: "Bucket Name",     type: "text",   default: "my-bucket",        placeholder: "e.g. app-assets" },
      { key: "region",      label: "Region",          type: "select", default: "us-east-1",
        options: ["us-east-1", "us-west-2", "eu-west-1", "eu-central-1", "ap-south-1"] },
      { key: "storageClass",label: "Storage Class",   type: "select", default: "Standard",
        options: ["Standard", "Intelligent-Tiering", "Standard-IA", "Glacier", "Glacier Deep Archive"] },
      { key: "versioning",  label: "Versioning",      type: "toggle", default: false },
      { key: "encryption",  label: "Server-side Enc.",type: "toggle", default: true },
      { key: "public",      label: "Public Access",   type: "toggle", default: false },
      { key: "lifecycle",   label: "Lifecycle Rules", type: "select", default: "None",
        options: ["None", "Move to IA after 30d", "Move to Glacier after 90d", "Delete after 365d"] },
    ],
  },

  {
    type: "blockstorage",
    title: "Block Storage",
    description: "Raw persistent block volumes attached directly to compute instances.",
    fields: [
      { key: "name",        label: "Volume Name",     type: "text",   default: "vol-01",           placeholder: "e.g. data-volume" },
      { key: "size",        label: "Size",            type: "select", default: "100 GB",
        options: ["10 GB", "20 GB", "50 GB", "100 GB", "250 GB", "500 GB", "1 TB", "2 TB"] },
      { key: "type",        label: "Volume Type",     type: "select", default: "SSD (gp3)",
        options: ["SSD (gp2)", "SSD (gp3)", "Provisioned IOPS (io2)", "HDD (st1)", "HDD (sc1)"] },
      { key: "iops",        label: "IOPS",            type: "select", default: "3000",
        options: ["100", "1000", "3000", "6000", "16000", "64000"] },
      { key: "zone",        label: "Availability Zone", type: "select", default: "us-east-1a",
        options: ["us-east-1a", "us-east-1b", "us-east-1c", "us-west-2a"] },
      { key: "encrypted",   label: "Encryption",      type: "toggle", default: true },
      { key: "multiAttach", label: "Multi-Attach",    type: "toggle", default: false },
    ],
  },

  {
    type: "nfs",
    title: "File Storage (NFS)",
    description: "Managed NFS file system for shared access across multiple instances.",
    fields: [
      { key: "name",        label: "File System Name",type: "text",   default: "efs-01",           placeholder: "e.g. shared-fs" },
      { key: "perfMode",    label: "Performance Mode",type: "select", default: "General Purpose",
        options: ["General Purpose", "Max I/O"] },
      { key: "throughput",  label: "Throughput Mode", type: "select", default: "Bursting",
        options: ["Bursting", "Provisioned", "Elastic"] },
      { key: "storage",     label: "Storage Class",   type: "select", default: "Standard",
        options: ["Standard", "Infrequent Access", "Archive"] },
      { key: "encrypted",   label: "Encryption",      type: "toggle", default: true },
      { key: "backup",      label: "Auto Backup",     type: "toggle", default: true },
    ],
  },

  {
    type: "backup",
    title: "Backup",
    description: "Automated scheduled backup service with configurable retention and restore.",
    fields: [
      { key: "name",        label: "Backup Plan Name",type: "text",   default: "backup-plan-01",   placeholder: "e.g. daily-backup" },
      { key: "schedule",    label: "Schedule",        type: "select", default: "Daily 02:00 UTC",
        options: ["Hourly", "Daily 02:00 UTC", "Weekly (Sunday)", "Monthly (1st)", "Custom Cron"] },
      { key: "retention",   label: "Retention",       type: "select", default: "30 days",
        options: ["7 days", "14 days", "30 days", "60 days", "90 days", "1 year"] },
      { key: "type",        label: "Backup Type",     type: "select", default: "Incremental",
        options: ["Full", "Incremental", "Differential"] },
      { key: "encryption",  label: "Encryption",      type: "toggle", default: true },
      { key: "crossRegion", label: "Cross-Region Copy",type: "toggle", default: false },
    ],
  },
];

// Build a map for O(1) lookup by type
export const CONFIG_MAP: Record<string, ComponentConfig> =
  Object.fromEntries(CONFIGS.map((c) => [c.type, c]));
