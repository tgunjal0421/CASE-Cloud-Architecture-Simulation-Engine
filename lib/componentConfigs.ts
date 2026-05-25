// lib/componentConfigs.ts
// Fields match EXACTLY what is in CASE_Cloud_Checklist_Structured.docx.
// No extras. No missing. Field names are taken word-for-word from the doc.

export type FieldType = "text" | "textarea" | "number" | "select" | "password" | "toggle";

export interface SelectOption { value: string; label: string; }

export interface ConfigField {
  key:          string;
  label:        string;
  type:         FieldType;
  default:      string | number | boolean;
  options?:     SelectOption[];
  placeholder?: string;
  unit?:        string;
  min?:         number;
  max?:         number;
  required?:    boolean;
  helperText?:  string;
  showIf?:      { key: string; value: string | boolean };
}

export interface ConfigSection {
  title:  string;
  fields: ConfigField[];
}

export interface ComponentConfig {
  type:        string;
  title:       string;
  description: string;
  sections:    ConfigSection[];
  summaryKeys: string[];
}

// ── Shared option sets ─────────────────────────────────────────────────────

const VPC_OPTIONS: SelectOption[] = [
  { value: "vpc-prod",    label: "vpc-prod (10.0.0.0/16)"    },
  { value: "vpc-staging", label: "vpc-staging (10.1.0.0/16)" },
  { value: "vpc-dev",     label: "vpc-dev (10.2.0.0/16)"     },
];

const AZ_OPTIONS: SelectOption[] = [
  { value: "us-east-1a",      label: "US East 1A (N. Virginia)"    },
  { value: "us-east-1b",      label: "US East 1B (N. Virginia)"    },
  { value: "us-west-2a",      label: "US West 2A (Oregon)"         },
  { value: "eu-west-1a",      label: "EU West 1A (Ireland)"        },
  { value: "eu-central-1a",   label: "EU Central 1A (Frankfurt)"   },
  { value: "ap-south-1a",     label: "AP South 1A (Mumbai)"        },
  { value: "ap-southeast-1a", label: "AP Southeast 1A (Singapore)" },
];

const SUBNET_OPTIONS: SelectOption[] = [
  { value: "subnet-pub-1a",  label: "subnet-public-1a  (10.0.1.0/24)" },
  { value: "subnet-pub-1b",  label: "subnet-public-1b  (10.0.2.0/24)" },
  { value: "subnet-priv-1a", label: "subnet-private-1a (10.0.3.0/24)" },
  { value: "subnet-priv-1b", label: "subnet-private-1b (10.0.4.0/24)" },
];

// Doc says: Windows, CentOS, RHEL, Ubuntu — exactly these four
const OS_OPTIONS: SelectOption[] = [
  { value: "Windows", label: "Windows" },
  { value: "CentOS",  label: "CentOS"  },
  { value: "RHEL",    label: "RHEL"    },
  { value: "Ubuntu",  label: "Ubuntu"  },
];

const INSTANCE_TYPE_OPTIONS: SelectOption[] = [
  { value: "t3.micro",   label: "t3.micro   — 1 vCPU / 1 GB"  },
  { value: "t3.small",   label: "t3.small   — 1 vCPU / 2 GB"  },
  { value: "t3.medium",  label: "t3.medium  — 2 vCPU / 4 GB"  },
  { value: "t3.large",   label: "t3.large   — 2 vCPU / 8 GB"  },
  { value: "m5.large",   label: "m5.large   — 2 vCPU / 8 GB"  },
  { value: "m5.xlarge",  label: "m5.xlarge  — 4 vCPU / 16 GB" },
  { value: "m5.2xlarge", label: "m5.2xlarge — 8 vCPU / 32 GB" },
  { value: "c5.large",   label: "c5.large   — 2 vCPU / 4 GB"  },
  { value: "r5.large",   label: "r5.large   — 2 vCPU / 16 GB" },
];

const FLAVOR_OPTIONS: SelectOption[] = [
  { value: "Standard",     label: "Standard"     },
  { value: "Memory Optimized", label: "Memory Optimized" },
  { value: "Compute Optimized", label: "Compute Optimized" },
  { value: "Storage Optimized", label: "Storage Optimized" },
];

const ROOT_VOLUME_OPTIONS: SelectOption[] = [
  { value: "20 GB",  label: "20 GB"  },
  { value: "50 GB",  label: "50 GB"  },
  { value: "100 GB", label: "100 GB" },
  { value: "200 GB", label: "200 GB" },
  { value: "500 GB", label: "500 GB" },
  { value: "1 TB",   label: "1 TB"   },
];

const SOURCE_TYPE_OPTIONS: SelectOption[] = [
  { value: "Machine Image (AMI)", label: "Machine Image (AMI)" },
  { value: "Volume Snapshot",     label: "Volume Snapshot"     },
  { value: "Launch Template",     label: "Launch Template"     },
];

const SCALING_POLICY_OPTIONS: SelectOption[] = [
  { value: "CPU Utilisation",    label: "CPU Utilisation"    },
  { value: "Memory Utilisation", label: "Memory Utilisation" },
  { value: "Network Traffic",    label: "Network Traffic"    },
  { value: "Custom Metric",      label: "Custom Metric"      },
  { value: "Scheduled",          label: "Scheduled"          },
];

const SCALING_INTERVAL_OPTIONS: SelectOption[] = [
  { value: "1 minute",   label: "Every 1 minute"   },
  { value: "2 minutes",  label: "Every 2 minutes"  },
  { value: "5 minutes",  label: "Every 5 minutes"  },
  { value: "10 minutes", label: "Every 10 minutes" },
  { value: "15 minutes", label: "Every 15 minutes" },
  { value: "30 minutes", label: "Every 30 minutes" },
];

const DB_COMPUTE_OPTIONS: SelectOption[] = [
  { value: "db.t3.micro",  label: "db.t3.micro  — 1 vCPU / 1 GB"  },
  { value: "db.t3.small",  label: "db.t3.small  — 1 vCPU / 2 GB"  },
  { value: "db.t3.medium", label: "db.t3.medium — 2 vCPU / 4 GB"  },
  { value: "db.m5.large",  label: "db.m5.large  — 2 vCPU / 8 GB"  },
  { value: "db.m5.xlarge", label: "db.m5.xlarge — 4 vCPU / 16 GB" },
  { value: "db.r5.large",  label: "db.r5.large  — 2 vCPU / 16 GB" },
  { value: "db.r5.xlarge", label: "db.r5.xlarge — 4 vCPU / 32 GB" },
];

const DB_STORAGE_OPTIONS: SelectOption[] = [
  { value: "20 GB SSD",  label: "20 GB SSD"  },
  { value: "50 GB SSD",  label: "50 GB SSD"  },
  { value: "100 GB SSD", label: "100 GB SSD" },
  { value: "250 GB SSD", label: "250 GB SSD" },
  { value: "500 GB SSD", label: "500 GB SSD" },
  { value: "1 TB SSD",   label: "1 TB SSD"   },
];

const DB_VERSION_PG: SelectOption[] = [
  { value: "PostgreSQL 16", label: "PostgreSQL 16" },
  { value: "PostgreSQL 15", label: "PostgreSQL 15" },
  { value: "PostgreSQL 14", label: "PostgreSQL 14" },
  { value: "PostgreSQL 13", label: "PostgreSQL 13" },
];

const DB_VERSION_MSSQL: SelectOption[] = [
  { value: "SQL Server 2022", label: "SQL Server 2022" },
  { value: "SQL Server 2019", label: "SQL Server 2019" },
  { value: "SQL Server 2017", label: "SQL Server 2017" },
];

const DB_VERSION_MARIA: SelectOption[] = [
  { value: "MariaDB 11.2",  label: "MariaDB 11.2"        },
  { value: "MariaDB 10.11", label: "MariaDB 10.11 (LTS)" },
  { value: "MariaDB 10.6",  label: "MariaDB 10.6 (LTS)"  },
];

const SCHEDULE_DAY_OPTIONS: SelectOption[] = [
  { value: "Daily",     label: "Daily"     },
  { value: "Monday",    label: "Monday"    },
  { value: "Tuesday",   label: "Tuesday"   },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday",  label: "Thursday"  },
  { value: "Friday",    label: "Friday"    },
  { value: "Saturday",  label: "Saturday"  },
  { value: "Sunday",    label: "Sunday"    },
];

const SCHEDULE_TIME_OPTIONS: SelectOption[] = [
  { value: "00:00 UTC", label: "00:00 UTC" },
  { value: "02:00 UTC", label: "02:00 UTC" },
  { value: "04:00 UTC", label: "04:00 UTC" },
  { value: "06:00 UTC", label: "06:00 UTC" },
  { value: "08:00 UTC", label: "08:00 UTC" },
  { value: "12:00 UTC", label: "12:00 UTC" },
  { value: "18:00 UTC", label: "18:00 UTC" },
  { value: "20:00 UTC", label: "20:00 UTC" },
  { value: "22:00 UTC", label: "22:00 UTC" },
];

// ═══════════════════════════════════════════════════════════════════════════
//  COMPONENT SCHEMAS — fields taken word-for-word from checklist
// ═══════════════════════════════════════════════════════════════════════════

const CONFIGS: ComponentConfig[] = [

  // ──────────────────────────────────────────────────────────────────────────
  // COMPUTE › Virtual Machine (VM)
  //
  // Doc fields:
  //   Network:         VPC, Availability Zone, Subnet
  //   Operating System: Windows, CentOS, RHEL, Ubuntu
  //   Specifications:  Type, Flavor
  //   Machine Details: Name, Number of instances, Root Volume
  //   VM Snapshot:     Snapshot Name, Associated VM
  // ──────────────────────────────────────────────────────────────────────────
  {
    type: "vm",
    title: "Virtual Machine",
    description: "Configurable compute instance with OS, network, and storage settings.",
    summaryKeys: ["name", "os", "type", "rootVolume", "availabilityZone"],
    sections: [
      {
        title: "Machine Details",
        fields: [
          {
            key:         "name",
            label:       "Name",
            type:        "text",
            default:     "vm-instance-01",
            placeholder: "e.g. web-server-01",
            required:    true,
          },
          {
            key:     "numberOfInstances",
            label:   "Number of Instances",
            type:    "number",
            default: 1,
            min:     1,
            max:     100,
          },
          {
            key:     "rootVolume",
            label:   "Root Volume",
            type:    "select",
            default: "50 GB",
            options: ROOT_VOLUME_OPTIONS,
          },
        ],
      },
      {
        title: "Network",
        fields: [
          {
            key:      "vpc",
            label:    "VPC",
            type:     "select",
            default:  "vpc-prod",
            options:  VPC_OPTIONS,
            required: true,
          },
          {
            key:      "availabilityZone",
            label:    "Availability Zone",
            type:     "select",
            default:  "us-east-1a",
            options:  AZ_OPTIONS,
            required: true,
          },
          {
            key:     "subnet",
            label:   "Subnet",
            type:    "select",
            default: "subnet-pub-1a",
            options: SUBNET_OPTIONS,
          },
        ],
      },
      {
        title: "Operating System",
        fields: [
          {
            key:      "os",
            label:    "Operating System",
            type:     "select",
            default:  "Ubuntu",
            options:  OS_OPTIONS,
            required: true,
          },
        ],
      },
      {
        title: "Specifications",
        fields: [
          {
            key:      "type",
            label:    "Type",
            type:     "select",
            default:  "t3.medium",
            options:  INSTANCE_TYPE_OPTIONS,
            required: true,
          },
          {
            key:     "flavor",
            label:   "Flavor",
            type:    "select",
            default: "Standard",
            options: FLAVOR_OPTIONS,
          },
        ],
      },

    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // COMPUTE › Auto Scaling Group
  //
  // Doc fields:
  //   Network:          VPC, Availability Zone, Subnet
  //   Basic Details:    Name, Step Size, Minimum Size, Maximum Size
  //   Scaling Policy and Scaling Interval
  //   VM Configuration: Source Type, OS Selection, Version
  // ──────────────────────────────────────────────────────────────────────────
  {
    type: "autoscaling",
    title: "Auto Scaling Group",
    description: "Dynamically adjusts VM instance count based on demand.",
    summaryKeys: ["name", "minimumSize", "maximumSize", "scalingPolicy", "osSelection"],
    sections: [
      {
        title: "Basic Details",
        fields: [
          {
            key:         "name",
            label:       "Name",
            type:        "text",
            default:     "asg-01",
            placeholder: "e.g. web-asg",
            required:    true,
          },
          {
            key:     "stepSize",
            label:   "Step Size",
            type:    "number",
            default: 1,
            min:     1,
            max:     100,
            helperText: "Instances added or removed per scaling event",
          },
          {
            key:      "minimumSize",
            label:    "Minimum Size",
            type:     "number",
            default:  1,
            min:      0,
            max:      1000,
            required: true,
          },
          {
            key:      "maximumSize",
            label:    "Maximum Size",
            type:     "number",
            default:  10,
            min:      1,
            max:      1000,
            required: true,
          },
        ],
      },
      {
        title: "Network",
        fields: [
          {
            key:      "vpc",
            label:    "VPC",
            type:     "select",
            default:  "vpc-prod",
            options:  VPC_OPTIONS,
            required: true,
          },
          {
            key:      "availabilityZone",
            label:    "Availability Zone",
            type:     "select",
            default:  "us-east-1a",
            options:  AZ_OPTIONS,
            required: true,
          },
          {
            key:     "subnet",
            label:   "Subnet",
            type:    "select",
            default: "subnet-pub-1a",
            options: SUBNET_OPTIONS,
          },
        ],
      },
      {
        title: "Scaling Policy",
        fields: [
          {
            key:      "scalingPolicy",
            label:    "Scaling Policy",
            type:     "select",
            default:  "CPU Utilisation",
            options:  SCALING_POLICY_OPTIONS,
            required: true,
          },
          {
            key:     "scalingInterval",
            label:   "Scaling Interval",
            type:    "select",
            default: "5 minutes",
            options: SCALING_INTERVAL_OPTIONS,
          },
        ],
      },
      {
        title: "VM Configuration",
        fields: [
          {
            key:     "sourceType",
            label:   "Source Type",
            type:    "select",
            default: "Machine Image (AMI)",
            options: SOURCE_TYPE_OPTIONS,
          },
          {
            key:      "osSelection",
            label:    "OS Selection",
            type:     "select",
            default:  "Ubuntu",
            options:  OS_OPTIONS,
            required: true,
          },
          {
            key:         "version",
            label:       "Version",
            type:        "text",
            default:     "",
            placeholder: "e.g. 22.04 LTS, 9 Stream",
            helperText:  "Specific OS version or AMI build",
          },
        ],
      },
    ],
  },
  // ──────────────────────────────────────────────────────────────────────────
  // COMPUTE › VM Snapshot
  //
  // Doc fields: Snapshot Name, Associated VM
  // ──────────────────────────────────────────────────────────────────────────
  {
    type: "vmsnapshot",
    title: "VM Snapshot",
    description: "Point-in-time snapshot of a virtual machine instance.",
    summaryKeys: ["snapshotName", "associatedVM"],
    sections: [
      {
        title: "Snapshot Configuration",
        fields: [
          {
            key:         "snapshotName",
            label:       "Snapshot Name",
            type:        "text",
            default:     "vm-snap-01",
            placeholder: "e.g. daily-snapshot",
            required:    true,
          },
          {
            key:         "associatedVM",
            label:       "Associated VM",
            type:        "text",
            default:     "",
            placeholder: "VM name or ID",
            required:    true,
            helperText:  "The VM this snapshot is taken from",
          },
        ],
      },
    ],
  },


  // ──────────────────────────────────────────────────────────────────────────
  // STORAGE › Volume
  //
  // Doc fields: Name, VPC, Availability Zone, Subnet
  // (exactly these four — nothing more)
  // ──────────────────────────────────────────────────────────────────────────
  {
    type: "blockstorage",
    title: "Volume",
    description: "Persistent block storage volume for attachment to compute instances.",
    summaryKeys: ["name", "vpc", "availabilityZone", "subnet"],
    sections: [
      {
        title: "Volume Configuration",
        fields: [
          {
            key:         "name",
            label:       "Name",
            type:        "text",
            default:     "vol-01",
            placeholder: "e.g. data-volume",
            required:    true,
          },
          {
            key:      "vpc",
            label:    "VPC",
            type:     "select",
            default:  "vpc-prod",
            options:  VPC_OPTIONS,
            required: true,
          },
          {
            key:      "availabilityZone",
            label:    "Availability Zone",
            type:     "select",
            default:  "us-east-1a",
            options:  AZ_OPTIONS,
            required: true,
          },
          {
            key:     "subnet",
            label:   "Subnet",
            type:    "select",
            default: "subnet-pub-1a",
            options: SUBNET_OPTIONS,
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // STORAGE › Volume Snapshot
  //
  // Doc fields: Snapshot Name, Associated Volume
  // ──────────────────────────────────────────────────────────────────────────
  {
    type: "snapshot",
    title: "Volume Snapshot",
    description: "Point-in-time snapshot of a block storage volume.",
    summaryKeys: ["snapshotName", "associatedVolume"],
    sections: [
      {
        title: "Snapshot Configuration",
        fields: [
          {
            key:         "snapshotName",
            label:       "Snapshot Name",
            type:        "text",
            default:     "snap-01",
            placeholder: "e.g. prod-vol-snapshot",
            required:    true,
          },
          {
            key:         "associatedVolume",
            label:       "Associated Volume",
            type:        "text",
            default:     "",
            placeholder: "Volume name or ID",
            required:    true,
            helperText:  "The volume this snapshot is taken from",
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // STORAGE › Object Storage
  //
  // Doc fields: Name, Availability Zone
  // ──────────────────────────────────────────────────────────────────────────
  {
    type: "objectstorage",
    title: "Object Storage",
    description: "Scalable blob storage for unstructured data and static assets.",
    summaryKeys: ["name", "availabilityZone"],
    sections: [
      {
        title: "Bucket Configuration",
        fields: [
          {
            key:         "name",
            label:       "Name",
            type:        "text",
            default:     "my-bucket",
            placeholder: "e.g. app-assets-prod",
            required:    true,
            helperText:  "Must be globally unique and lowercase",
          },
          {
            key:      "availabilityZone",
            label:    "Availability Zone",
            type:     "select",
            default:  "us-east-1a",
            options:  AZ_OPTIONS,
            required: true,
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // STORAGE › File System
  //
  // Doc fields: Name, Availability Zone, Size
  // ──────────────────────────────────────────────────────────────────────────
  {
    type: "nfs",
    title: "File System",
    description: "Managed shared file system accessible across instances via NFS.",
    summaryKeys: ["name", "availabilityZone", "size"],
    sections: [
      {
        title: "File System Configuration",
        fields: [
          {
            key:         "name",
            label:       "Name",
            type:        "text",
            default:     "fs-01",
            placeholder: "e.g. shared-storage",
            required:    true,
          },
          {
            key:      "availabilityZone",
            label:    "Availability Zone",
            type:     "select",
            default:  "us-east-1a",
            options:  AZ_OPTIONS,
            required: true,
          },
          {
            key:      "size",
            label:    "Size",
            type:     "number",
            default:  100,
            min:      1,
            max:      65536,
            unit:     "GB",
            required: true,
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // STORAGE › Backup
  //
  // Doc fields:
  //   Basic Details: VM, Description
  //   Schedule:      Day and Time
  // ──────────────────────────────────────────────────────────────────────────
  {
    type: "backup",
    title: "Backup",
    description: "Automated backup policy with configurable VM target and schedule.",
    summaryKeys: ["vm", "scheduleDay", "scheduleTime"],
    sections: [
      {
        title: "Basic Details",
        fields: [
          {
            key:         "vm",
            label:       "VM",
            type:        "text",
            default:     "",
            placeholder: "VM name or resource ID",
            required:    true,
            helperText:  "The VM this backup policy protects",
          },
          {
            key:         "description",
            label:       "Description",
            type:        "textarea",
            default:     "",
            placeholder: "Purpose of this backup policy",
          },
        ],
      },
      {
        title: "Schedule",
        fields: [
          {
            key:      "scheduleDay",
            label:    "Day",
            type:     "select",
            default:  "Daily",
            options:  SCHEDULE_DAY_OPTIONS,
            required: true,
          },
          {
            key:      "scheduleTime",
            label:    "Time",
            type:     "select",
            default:  "02:00 UTC",
            options:  SCHEDULE_TIME_OPTIONS,
            required: true,
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // MANAGED DATABASE › PostgreSQL
  //
  // Doc fields:
  //   Basic Information:                  Cluster Name, Availability Zone
  //   Database Configuration and Credentials
  //   Compute and Storage Configuration
  // ──────────────────────────────────────────────────────────────────────────
  {
    type: "postgresql",
    title: "PostgreSQL",
    description: "Managed PostgreSQL — advanced open-source relational database.",
    summaryKeys: ["clusterName", "availabilityZone", "dbVersion", "computeConfig", "storageConfig"],
    sections: [
      {
        title: "Basic Information",
        fields: [
          {
            key:         "clusterName",
            label:       "Cluster Name",
            type:        "text",
            default:     "pg-cluster-01",
            placeholder: "e.g. analytics-db",
            required:    true,
          },
          {
            key:      "availabilityZone",
            label:    "Availability Zone",
            type:     "select",
            default:  "us-east-1a",
            options:  AZ_OPTIONS,
            required: true,
          },
        ],
      },
      {
        title: "Database Configuration and Credentials",
        fields: [
          {
            key:      "dbVersion",
            label:    "Database Version",
            type:     "select",
            default:  "PostgreSQL 16",
            options:  DB_VERSION_PG,
            required: true,
          },
          {
            key:         "dbUsername",
            label:       "Database Username",
            type:        "text",
            default:     "pgadmin",
            placeholder: "e.g. dbadmin",
            required:    true,
          },
          {
            key:         "dbPassword",
            label:       "Database Password",
            type:        "password",
            default:     "",
            placeholder: "Min 8 characters",
            required:    true,
          },
          {
            key:         "dbName",
            label:       "Database Name",
            type:        "text",
            default:     "mydb",
            placeholder: "e.g. appdb",
          },
        ],
      },
      {
        title: "Compute and Storage Configuration",
        fields: [
          {
            key:      "computeConfig",
            label:    "Compute Configuration",
            type:     "select",
            default:  "db.t3.medium",
            options:  DB_COMPUTE_OPTIONS,
            required: true,
          },
          {
            key:      "storageConfig",
            label:    "Storage Configuration",
            type:     "select",
            default:  "100 GB SSD",
            options:  DB_STORAGE_OPTIONS,
            required: true,
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // MANAGED DATABASE › MS SQL Server
  // Doc: "Same configuration as PostgreSQL"
  // ──────────────────────────────────────────────────────────────────────────
  {
    type: "mssql",
    title: "MS SQL Server",
    description: "Managed Microsoft SQL Server — same configuration structure as PostgreSQL.",
    summaryKeys: ["clusterName", "availabilityZone", "dbVersion", "computeConfig", "storageConfig"],
    sections: [
      {
        title: "Basic Information",
        fields: [
          {
            key:         "clusterName",
            label:       "Cluster Name",
            type:        "text",
            default:     "mssql-cluster-01",
            placeholder: "e.g. hr-database",
            required:    true,
          },
          {
            key:      "availabilityZone",
            label:    "Availability Zone",
            type:     "select",
            default:  "us-east-1a",
            options:  AZ_OPTIONS,
            required: true,
          },
        ],
      },
      {
        title: "Database Configuration and Credentials",
        fields: [
          {
            key:      "dbVersion",
            label:    "Database Version",
            type:     "select",
            default:  "SQL Server 2022",
            options:  DB_VERSION_MSSQL,
            required: true,
          },
          {
            key:         "dbUsername",
            label:       "Database Username",
            type:        "text",
            default:     "sa",
            placeholder: "e.g. sqladmin",
            required:    true,
          },
          {
            key:         "dbPassword",
            label:       "Database Password",
            type:        "password",
            default:     "",
            placeholder: "Min 8 characters",
            required:    true,
          },
          {
            key:         "dbName",
            label:       "Database Name",
            type:        "text",
            default:     "mydb",
            placeholder: "e.g. appdb",
          },
        ],
      },
      {
        title: "Compute and Storage Configuration",
        fields: [
          {
            key:      "computeConfig",
            label:    "Compute Configuration",
            type:     "select",
            default:  "db.m5.large",
            options:  DB_COMPUTE_OPTIONS,
            required: true,
          },
          {
            key:      "storageConfig",
            label:    "Storage Configuration",
            type:     "select",
            default:  "100 GB SSD",
            options:  DB_STORAGE_OPTIONS,
            required: true,
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // MANAGED DATABASE › MariaDB
  // Doc: "Same configuration as PostgreSQL"
  // ──────────────────────────────────────────────────────────────────────────
  {
    type: "mariadb",
    title: "MariaDB",
    description: "Managed MariaDB — same configuration structure as PostgreSQL.",
    summaryKeys: ["clusterName", "availabilityZone", "dbVersion", "computeConfig", "storageConfig"],
    sections: [
      {
        title: "Basic Information",
        fields: [
          {
            key:         "clusterName",
            label:       "Cluster Name",
            type:        "text",
            default:     "mariadb-cluster-01",
            placeholder: "e.g. catalog-db",
            required:    true,
          },
          {
            key:      "availabilityZone",
            label:    "Availability Zone",
            type:     "select",
            default:  "us-east-1a",
            options:  AZ_OPTIONS,
            required: true,
          },
        ],
      },
      {
        title: "Database Configuration and Credentials",
        fields: [
          {
            key:      "dbVersion",
            label:    "Database Version",
            type:     "select",
            default:  "MariaDB 10.11",
            options:  DB_VERSION_MARIA,
            required: true,
          },
          {
            key:         "dbUsername",
            label:       "Database Username",
            type:        "text",
            default:     "dbadmin",
            placeholder: "e.g. root",
            required:    true,
          },
          {
            key:         "dbPassword",
            label:       "Database Password",
            type:        "password",
            default:     "",
            placeholder: "Min 8 characters",
            required:    true,
          },
          {
            key:         "dbName",
            label:       "Database Name",
            type:        "text",
            default:     "mydb",
            placeholder: "e.g. appdb",
          },
        ],
      },
      {
        title: "Compute and Storage Configuration",
        fields: [
          {
            key:      "computeConfig",
            label:    "Compute Configuration",
            type:     "select",
            default:  "db.t3.medium",
            options:  DB_COMPUTE_OPTIONS,
            required: true,
          },
          {
            key:      "storageConfig",
            label:    "Storage Configuration",
            type:     "select",
            default:  "100 GB SSD",
            options:  DB_STORAGE_OPTIONS,
            required: true,
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Existing networking components — unchanged, not in the checklist doc
  // ──────────────────────────────────────────────────────────────────────────

  {
    type: "mysql",
    title: "MySQL",
    description: "Managed MySQL — open-source relational database.",
    summaryKeys: ["clusterName", "availabilityZone", "dbVersion", "computeConfig", "storageConfig"],
    sections: [
      {
        title: "Basic Information",
        fields: [
          { key: "clusterName",     label: "Cluster Name",      type: "text",   default: "mysql-cluster-01", placeholder: "e.g. orders-db", required: true },
          { key: "availabilityZone",label: "Availability Zone", type: "select", default: "us-east-1a",        options: AZ_OPTIONS, required: true },
        ],
      },
      {
        title: "Database Configuration and Credentials",
        fields: [
          { key: "dbVersion",  label: "Database Version",  type: "select",   default: "MySQL 8.0",
            options: [
              { value: "MySQL 8.1", label: "MySQL 8.1" },
              { value: "MySQL 8.0", label: "MySQL 8.0" },
              { value: "MySQL 5.7", label: "MySQL 5.7" },
            ], required: true },
          { key: "dbUsername", label: "Database Username", type: "text",     default: "dbadmin", placeholder: "e.g. root",        required: true },
          { key: "dbPassword", label: "Database Password", type: "password", default: "",        placeholder: "Min 8 characters", required: true },
          { key: "dbName",     label: "Database Name",     type: "text",     default: "mydb",    placeholder: "e.g. appdb" },
        ],
      },
      {
        title: "Compute and Storage Configuration",
        fields: [
          { key: "computeConfig", label: "Compute Configuration", type: "select", default: "db.t3.medium", options: DB_COMPUTE_OPTIONS, required: true },
          { key: "storageConfig", label: "Storage Configuration", type: "select", default: "100 GB SSD",   options: DB_STORAGE_OPTIONS, required: true },
        ],
      },
    ],
  },

  {
    type: "oracle",
    title: "Oracle DB",
    description: "Enterprise-grade Oracle Database for mission-critical workloads.",
    summaryKeys: ["clusterName", "availabilityZone", "dbVersion", "computeConfig", "storageConfig"],
    sections: [
      {
        title: "Basic Information",
        fields: [
          { key: "clusterName",     label: "Cluster Name",      type: "text",   default: "oracle-cluster-01", placeholder: "e.g. erp-db", required: true },
          { key: "availabilityZone",label: "Availability Zone", type: "select", default: "us-east-1a",         options: AZ_OPTIONS, required: true },
        ],
      },
      {
        title: "Database Configuration and Credentials",
        fields: [
          { key: "dbVersion",  label: "Database Version", type: "select", default: "Oracle 19c",
            options: [
              { value: "Oracle 21c", label: "Oracle 21c"       },
              { value: "Oracle 19c", label: "Oracle 19c (LTS)" },
              { value: "Oracle 18c", label: "Oracle 18c"       },
            ], required: true },
          { key: "dbUsername", label: "Database Username", type: "text",    default: "sys",  placeholder: "e.g. system",     required: true },
          { key: "dbPassword", label: "Database Password", type: "password",default: "",     placeholder: "Min 8 characters",required: true },
          { key: "dbName",     label: "Database Name",     type: "text",    default: "orcl", placeholder: "e.g. orcl" },
        ],
      },
      {
        title: "Compute and Storage Configuration",
        fields: [
          { key: "computeConfig", label: "Compute Configuration", type: "select", default: "db.m5.xlarge", options: DB_COMPUTE_OPTIONS, required: true },
          { key: "storageConfig", label: "Storage Configuration", type: "select", default: "500 GB SSD",   options: DB_STORAGE_OPTIONS, required: true },
        ],
      },
    ],
  },

  {
    type: "loadbalancer",
    title: "Load Balancer",
    description: "Distributes incoming traffic across healthy backend instances.",
    summaryKeys: ["name", "lbType", "scheme", "protocol", "algorithm"],
    sections: [
      {
        title: "Basic Information",
        fields: [
          { key: "name",   label: "Name", type: "text",   default: "lb-01", placeholder: "e.g. web-lb", required: true },
          { key: "lbType", label: "Type", type: "select", default: "Application (L7)",
            options: [
              { value: "Application (L7)", label: "Application LB (L7 — HTTP/HTTPS)" },
              { value: "Network (L4)",     label: "Network LB (L4 — TCP/UDP)"        },
              { value: "Gateway",          label: "Gateway LB"                        },
            ]},
          { key: "scheme", label: "Scheme", type: "select", default: "Internet-facing",
            options: [
              { value: "Internet-facing", label: "Internet-facing (public)" },
              { value: "Internal",        label: "Internal (private VPC)"   },
            ]},
          { key: "vpc", label: "VPC", type: "select", default: "vpc-prod", options: VPC_OPTIONS },
        ],
      },
      {
        title: "Listener Configuration",
        fields: [
          { key: "protocol",  label: "Protocol",  type: "select", default: "HTTPS",
            options: [
              { value: "HTTP",  label: "HTTP"  }, { value: "HTTPS", label: "HTTPS" },
              { value: "TCP",   label: "TCP"   }, { value: "UDP",   label: "UDP"   },
            ]},
          { key: "port",      label: "Port",      type: "number", default: 443, min: 1, max: 65535 },
          { key: "algorithm", label: "Algorithm", type: "select", default: "Round Robin",
            options: [
              { value: "Round Robin",       label: "Round Robin"       },
              { value: "Least Connections", label: "Least Connections" },
              { value: "IP Hash",           label: "IP Hash (sticky)"  },
            ]},
          { key: "healthCheck", label: "Health Checks", type: "toggle", default: true },
        ],
      },
    ],
  },

  {
    type: "apigateway",
    title: "API Gateway",
    description: "Managed API routing with auth, throttling, and transformation.",
    summaryKeys: ["name", "protocol", "auth", "throttle", "stage"],
    sections: [
      {
        title: "Basic Information",
        fields: [
          { key: "name",     label: "Name",     type: "text",   default: "api-gw-01", placeholder: "e.g. public-api", required: true },
          { key: "protocol", label: "Protocol", type: "select", default: "REST",
            options: [
              { value: "REST",      label: "REST API"  }, { value: "HTTP", label: "HTTP API"  },
              { value: "WebSocket", label: "WebSocket" }, { value: "gRPC", label: "gRPC"      },
            ]},
          { key: "stage",    label: "Stage",    type: "text",   default: "prod", placeholder: "e.g. v1, staging" },
        ],
      },
      {
        title: "Security & Throttling",
        fields: [
          { key: "auth",    label: "Authentication", type: "select", default: "JWT / OAuth2",
            options: [
              { value: "None",              label: "None"              },
              { value: "API Key",           label: "API Key"           },
              { value: "JWT / OAuth2",      label: "JWT / OAuth2"      },
              { value: "IAM",               label: "IAM"               },
              { value: "Lambda Authorizer", label: "Lambda Authorizer" },
            ]},
          { key: "throttle",label: "Rate Limit",    type: "select", default: "1000 req/s",
            options: [
              { value: "100 req/s",  label: "100 req/s"   },
              { value: "500 req/s",  label: "500 req/s"   },
              { value: "1000 req/s", label: "1,000 req/s" },
              { value: "5000 req/s", label: "5,000 req/s" },
              { value: "Unlimited",  label: "Unlimited"   },
            ]},
          { key: "caching", label: "Response Caching", type: "toggle", default: false },
          { key: "logging", label: "Access Logging",   type: "toggle", default: true  },
        ],
      },
    ],
  },

  {
    type: "cdn",
    title: "CDN",
    description: "Global content delivery network from edge locations worldwide.",
    summaryKeys: ["name", "origin", "cachePolicy", "ttl"],
    sections: [
      {
        title: "Distribution",
        fields: [
          { key: "name",        label: "Name",        type: "text",   default: "cdn-dist-01", placeholder: "e.g. static-assets", required: true },
          { key: "origin",      label: "Origin Type", type: "select", default: "S3 / Object Store",
            options: [
              { value: "S3 / Object Store", label: "S3 / Object Storage" },
              { value: "Load Balancer",     label: "Load Balancer"       },
              { value: "Custom HTTP",       label: "Custom HTTP Origin"  },
            ]},
          { key: "https",       label: "HTTPS Only",  type: "toggle", default: true },
        ],
      },
      {
        title: "Caching",
        fields: [
          { key: "cachePolicy", label: "Cache Policy", type: "select", default: "CachingOptimized",
            options: [
              { value: "CachingOptimized",          label: "Caching Optimized"   },
              { value: "CachingDisabled",           label: "Caching Disabled"    },
              { value: "CachingOptimizedForImages", label: "Optimized for Images"},
            ]},
          { key: "ttl",         label: "Default TTL", type: "select", default: "86400s (1 day)",
            options: [
              { value: "0s",             label: "0s (no cache)" },
              { value: "3600s (1h)",     label: "1 hour"        },
              { value: "86400s (1 day)", label: "1 day"         },
              { value: "604800s (1w)",   label: "1 week"        },
            ]},
        ],
      },
    ],
  },

  {
    type: "firewall",
    title: "Firewall / WAF",
    description: "Network and web application firewall protecting against threats.",
    summaryKeys: ["name", "mode", "rules", "rateLimit"],
    sections: [
      {
        title: "Firewall Configuration",
        fields: [
          { key: "name",      label: "Name",       type: "text",   default: "waf-01", placeholder: "e.g. edge-waf", required: true },
          { key: "mode",      label: "Mode",       type: "select", default: "Prevention",
            options: [
              { value: "Detection",  label: "Detection (monitor only)"   },
              { value: "Prevention", label: "Prevention (block threats)"  },
            ]},
          { key: "rules",     label: "Ruleset",    type: "select", default: "OWASP Top 10",
            options: [
              { value: "OWASP Top 10",  label: "OWASP Top 10"       },
              { value: "Cloud Managed", label: "Cloud Managed Rules" },
              { value: "Bot Control",   label: "Bot Control"         },
              { value: "Custom",        label: "Custom Rules"         },
            ]},
          { key: "rateLimit", label: "Rate Limit", type: "select", default: "2000 req/5min",
            options: [
              { value: "500 req/5min",  label: "500 / 5 min"   },
              { value: "1000 req/5min", label: "1,000 / 5 min" },
              { value: "2000 req/5min", label: "2,000 / 5 min" },
              { value: "None",          label: "No rate limit"  },
            ]},
          { key: "logging",   label: "Traffic Logging", type: "toggle", default: true },
        ],
      },
    ],
  },

  {
    type: "vpc",
    title: "VPC",
    description: "Isolated virtual private cloud with configurable subnets and routing.",
    summaryKeys: ["name", "cidr", "region", "subnets"],
    sections: [
      {
        title: "VPC Configuration",
        fields: [
          { key: "name",    label: "Name",         type: "text",   default: "vpc-main", placeholder: "e.g. prod-vpc", required: true },
          { key: "cidr",    label: "CIDR Block",   type: "select", default: "10.0.0.0/16",
            options: [
              { value: "10.0.0.0/16",    label: "10.0.0.0/16"    },
              { value: "10.1.0.0/16",    label: "10.1.0.0/16"    },
              { value: "172.16.0.0/12",  label: "172.16.0.0/12"  },
              { value: "192.168.0.0/16", label: "192.168.0.0/16" },
            ]},
          { key: "region",  label: "Region",       type: "select", default: "us-east-1",
            options: [
              { value: "us-east-1",      label: "US East (N. Virginia)"   },
              { value: "us-west-2",      label: "US West (Oregon)"        },
              { value: "eu-west-1",      label: "EU West (Ireland)"       },
              { value: "eu-central-1",   label: "EU Central (Frankfurt)"  },
              { value: "ap-south-1",     label: "AP South (Mumbai)"       },
              { value: "ap-southeast-1", label: "AP Southeast (Singapore)"},
            ]},
          { key: "subnets", label: "Subnet Layout",type: "select", default: "2 Public + 2 Private",
            options: [
              { value: "1 Public",             label: "1 Public"             },
              { value: "2 Public",             label: "2 Public"             },
              { value: "2 Public + 2 Private", label: "2 Public + 2 Private" },
              { value: "3 Public + 3 Private", label: "3 Public + 3 Private" },
            ]},
          { key: "natGateway", label: "NAT Gateway",   type: "toggle", default: true  },
          { key: "flowLogs",   label: "VPC Flow Logs", type: "toggle", default: false },
        ],
      },
    ],
  },

  {
    type: "dns",
    title: "DNS",
    description: "Managed DNS with configurable routing policies.",
    summaryKeys: ["name", "zoneType", "routing", "ttl"],
    sections: [
      {
        title: "Zone Configuration",
        fields: [
          { key: "name",     label: "Zone Name",      type: "text",   default: "example.com", placeholder: "e.g. myapp.io", required: true },
          { key: "zoneType", label: "Zone Type",      type: "select", default: "Public",
            options: [
              { value: "Public",  label: "Public (internet-accessible)" },
              { value: "Private", label: "Private (VPC-only)"           },
            ]},
          { key: "routing",  label: "Routing Policy", type: "select", default: "Simple",
            options: [
              { value: "Simple",      label: "Simple"      },
              { value: "Weighted",    label: "Weighted"    },
              { value: "Latency",     label: "Latency"     },
              { value: "Failover",    label: "Failover"    },
              { value: "Geolocation", label: "Geolocation" },
            ]},
          { key: "ttl",      label: "Default TTL",    type: "select", default: "300s",
            options: [
              { value: "60s",    label: "60s"   },
              { value: "300s",   label: "5 min" },
              { value: "3600s",  label: "1 hr"  },
              { value: "86400s", label: "24 hr" },
            ]},
          { key: "dnssec",   label: "DNSSEC",          type: "toggle", default: false },
        ],
      },
    ],
  },
];

// ── Exports ────────────────────────────────────────────────────────────────

export const CONFIG_MAP: Record<string, ComponentConfig> =
  Object.fromEntries(CONFIGS.map(c => [c.type, c]));

export function getDefaultValues(
  type: string
): Record<string, string | number | boolean> {
  const config = CONFIG_MAP[type];
  if (!config) return {};
  const out: Record<string, string | number | boolean> = {};
  for (const section of config.sections)
    for (const field of section.fields)
      out[field.key] = field.default;
  return out;
}

export function getNodeSummary(
  type: string,
  values: Record<string, string | number | boolean>
): string[] {
  const config = CONFIG_MAP[type];
  if (!config) return [];

  const trunc = (v: string | number | boolean, max = 22) => {
    const s = String(v);
    return s.length > max ? s.slice(0, max - 1) + "…" : s;
  };

  // Map field key → short label for the compact node card
  const SHORT: Record<string, string> = {
    name:              "Name",
    clusterName:       "Cluster",
    availabilityZone:  "Zone",
    os:                "OS",
    osSelection:       "OS",
    type:              "Type",
    flavor:            "Flavor",
    rootVolume:        "Root Vol",
    numberOfInstances: "Instances",
    minimumSize:       "Min",
    maximumSize:       "Max",
    scalingPolicy:     "Policy",
    dbVersion:         "Version",
    computeConfig:     "Compute",
    storageConfig:     "Storage",
    vm:                "VM",
    scheduleDay:       "Day",
    scheduleTime:      "Time",
    snapshotName:      "Snapshot",
    associatedVolume:  "Volume",
    size:              "Size",
    vpc:               "VPC",
    subnet:            "Subnet",
    lbType:            "Type",
    scheme:            "Scheme",
    protocol:          "Protocol",
    algorithm:         "Algorithm",
    auth:              "Auth",
    throttle:          "Rate",
    stage:             "Stage",
    origin:            "Origin",
    cachePolicy:       "Cache",
    ttl:               "TTL",
    mode:              "Mode",
    rules:             "Ruleset",
    rateLimit:         "Rate",
    cidr:              "CIDR",
    region:            "Region",
    subnets:           "Subnets",
    zoneType:          "Type",
    routing:           "Routing",
  };

  const lines: string[] = [];
  for (const key of config.summaryKeys) {
    if (lines.length >= 5) break;
    const val = values[key];
    if (val === undefined || val === "" || val === false) continue;
    const label = SHORT[key] ?? key;
    lines.push(`${label}: ${trunc(val as string)}`);
  }
  return lines;
}
