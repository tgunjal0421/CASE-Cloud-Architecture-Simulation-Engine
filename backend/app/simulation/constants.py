"""Constants and benchmark tables."""

BASE_LATENCY: dict[str, float] = {
    # Networking — fast, mostly packet-forwarding
    "loadbalancer":   4.0,
    "apigateway":     7.0,
    "cdn":           10.0,
    "firewall":       5.0,
    "vpc":            0.5,
    "dns":            1.5,
    # Compute — processing time varies heavily by instance size
    "vm":            20.0,
    "autoscaling":   18.0,
    "vmsnapshot":     2.0,
    # Databases — disk I/O dominates
    "postgresql":    40.0,
    "mysql":         45.0,
    "oracle":        50.0,
    "mssql":         47.0,
    "mariadb":       43.0,
    # Storage — I/O bound
    "blockstorage":  22.0,
    "objectstorage": 18.0,
    "nfs":           28.0,
    "snapshot":       4.0,
    "backup":         8.0,
    # Default fallback
    "default":       20.0,
}

# ── 2. Instance type → latency multiplier ─────────────────────────────────
# Lower = faster.  t3.medium = 1.0 (baseline).
# Based on vCPU count and architecture performance relative to baseline.
INSTANCE_LATENCY_MULT: dict[str, float] = {
    # VM instance types (field key: "type")
    "t3.micro":    2.10,   # 1 vCPU / 1 GB  — very underpowered
    "t3.small":    1.75,   # 1 vCPU / 2 GB
    "t3.medium":   1.00,   # 2 vCPU / 4 GB  ← BASELINE
    "t3.large":    0.82,   # 2 vCPU / 8 GB
    "m5.large":    0.78,   # 2 vCPU / 8 GB  — better CPU
    "m5.xlarge":   0.65,   # 4 vCPU / 16 GB
    "m5.2xlarge":  0.52,   # 8 vCPU / 32 GB
    "c5.large":    0.62,   # 2 vCPU / 4 GB  — compute-optimised
    "r5.large":    0.72,   # 2 vCPU / 16 GB — memory-optimised
    # DB instance types (field key: "computeConfig")
    "db.t3.micro":   2.30,
    "db.t3.small":   1.90,
    "db.t3.medium":  1.00,   # ← BASELINE
    "db.m5.large":   0.78,
    "db.m5.xlarge":  0.63,
    "db.r5.large":   0.58,   # memory-optimised — great for DB caching
    "db.r5.xlarge":  0.45,   # best — large buffer pool reduces disk reads
}

# ── 3. Flavor → additional latency modifier (ms) ──────────────────────────
# VM "flavor" field — architectural tuning on top of instance type.
FLAVOR_LATENCY_ADD: dict[str, float] = {
    "Standard":          0.0,    # baseline general purpose
    "Compute Optimized": -4.0,   # faster CPU processing
    "Memory Optimized":  -3.0,   # more RAM → more cache hits
    "Storage Optimized": -2.0,   # faster local disk I/O
}

# ── 4. OS overhead (ms added) ─────────────────────────────────────────────
# Field key: "os" (VM) or "osSelection" (AutoScaling)
# Windows has heavier kernel + IIS overhead; Linux variants are leaner.
OS_LATENCY_ADD: dict[str, float] = {
    "Windows":  6.0,   # kernel + services overhead
    "CentOS":   1.5,
    "RHEL":     2.0,   # SELinux + enterprise tooling
    "Ubuntu":   0.0,   # ← BASELINE — lean, widely tuned
}

# ── 5. Root volume size → I/O latency delta (ms) ──────────────────────────
# Larger root volumes generally have slightly higher seek times on HDD,
# but on SSD (which is default) the difference is negligible.
# These small deltas model the real-world variability.
ROOT_VOLUME_LATENCY_ADD: dict[str, float] = {
    "20 GB":   0.0,
    "50 GB":   0.0,
    "100 GB":  0.5,
    "200 GB":  1.0,
    "500 GB":  1.5,
    "1 TB":    2.5,
}

# ── 6. DB version → query optimiser performance delta (ms) ────────────────
# Newer versions have better query planners and WAL improvements.
# Field key: "dbVersion"
DB_VERSION_LATENCY_DELTA: dict[str, float] = {
    "PostgreSQL 16":  -4.0,   # parallel query improvements, better planner
    "PostgreSQL 15":  -2.0,
    "PostgreSQL 14":   0.0,   # ← BASELINE
    "PostgreSQL 13":   2.0,
    "MySQL 8.1":      -3.0,
    "MySQL 8.0":       0.0,   # ← BASELINE
    "MySQL 5.7":       4.0,   # older — slower optimizer
    "SQL Server 2022": -2.0,
    "SQL Server 2019":  0.0,
    "SQL Server 2017":  2.5,
    "MariaDB 11.2":    -3.0,
    "MariaDB 10.11":    0.0,
    "MariaDB 10.6":     1.5,
    "Oracle 21c":      -3.0,
    "Oracle 19c":       0.0,
    "Oracle 18c":       2.0,
}

# ── 7. DB storage config → I/O latency delta (ms) ─────────────────────────
# Larger provisioned storage often comes with higher IOPS in managed DBs.
# Field key: "storageConfig"
DB_STORAGE_LATENCY_DELTA: dict[str, float] = {
    "20 GB SSD":    4.0,    # minimum — low IOPS provisioned
    "50 GB SSD":    2.5,
    "100 GB SSD":   0.0,    # ← BASELINE
    "250 GB SSD":  -1.5,
    "500 GB SSD":  -3.0,
    "1 TB SSD":    -4.5,
    "2 TB SSD":    -5.5,
}

# ── 8. Object storage class → retrieval latency (ms) ─────────────────────
# Field key: "storageClass"
OBJ_STORAGE_LATENCY: dict[str, float] = {
    "Standard":              18.0,
    "Intelligent-Tiering":   22.0,
    "Standard-IA":           30.0,    # infrequent access — slightly slower
    "Glacier":             3000.0,    # minutes to retrieve
    "Glacier Deep Archive":36000.0,   # hours — effectively unavailable online
}

# ── 9. File system performance mode → latency (ms) ────────────────────────
# Field key: "performanceMode"
NFS_PERF_MODE_LATENCY: dict[str, float] = {
    "General Purpose": 28.0,   # ← BASELINE
    "Max I/O":         45.0,   # higher throughput but more latency
}

# ── 10. LB type → forwarding latency (ms) ─────────────────────────────────
# Field key: "lbType"
LB_TYPE_LATENCY: dict[str, float] = {
    "Application (L7)": 5.5,   # L7 inspection + routing
    "Network (L4)":     2.5,   # pure packet forwarding — fastest
    "Gateway":          3.0,
}

# ── 11. LB algorithm → routing overhead (ms added) ───────────────────────
# Field key: "algorithm"
LB_ALGORITHM_ADD: dict[str, float] = {
    "Round Robin":       0.0,   # simplest — no overhead
    "Least Connections": 0.8,   # needs connection count lookup
    "IP Hash":           0.3,   # hash computation
    "Weighted":          0.5,   # weight table lookup
}

# ── 12. API Gateway auth → validation overhead (ms added) ─────────────────
# Field key: "auth"
APIGW_AUTH_ADD: dict[str, float] = {
    "None":               0.0,
    "API Key":            1.5,   # key lookup
    "JWT / OAuth2":       4.0,   # token decode + signature verify
    "IAM":                3.0,   # IAM policy evaluation
    "Lambda Authorizer": 12.0,   # cold Lambda + custom logic
}

# ── 13. API Gateway caching → latency reduction ───────────────────────────
# Field key: "caching" (boolean)
APIGW_CACHE_REDUCTION = 0.55   # 55% latency reduction on cache hit

# ── 14. CDN cache policy → cache hit rate → effective latency ─────────────
# Field key: "cachePolicy"
CDN_CACHE_HIT_RATE: dict[str, float] = {
    "CachingOptimized":          0.90,   # 90% requests served from edge
    "CachingOptimizedForImages": 0.85,
    "CachingDisabled":           0.00,   # all requests hit origin
}

# ── 15. CDN TTL → cache freshness (affects hit rate slightly) ────────────
# Field key: "ttl"
CDN_TTL_BONUS: dict[str, float] = {
    "0s":              -0.05,   # no cache — always miss
    "3600s (1h)":       0.0,
    "86400s (1 day)":   0.05,   # longer TTL → higher hit rate
    "604800s (1w)":     0.08,
}

# ── 16. Firewall mode → inspection overhead (ms added) ────────────────────
# Field key: "mode"
FIREWALL_MODE_ADD: dict[str, float] = {
    "Detection":   3.0,   # passive inspection only
    "Prevention":  6.5,   # active blocking — needs deep packet inspection
}

# ── 17. Firewall ruleset complexity → additional overhead ─────────────────
# Field key: "rules"
FIREWALL_RULES_ADD: dict[str, float] = {
    "OWASP Top 10":   2.0,
    "Cloud Managed":  1.5,
    "Bot Control":    3.5,   # more complex pattern matching
    "Custom":         1.0,
}

# ── 18. Scaling policy → reaction time (affects overload window) ──────────
# Field key: "scalingPolicy"
ASG_POLICY_REACT_MS: dict[str, float] = {
    "CPU Utilisation":    300_000,   # ms to detect and scale (5 min)
    "Memory Utilisation": 300_000,
    "Network Traffic":    180_000,   # faster — network metric is near-real-time
    "Custom Metric":      600_000,   # slowest — depends on metric pipeline
    "Scheduled":          0.0,       # pre-scaled — no reaction lag
}

# ── 19. Overload threshold per instance type ──────────────────────────────
# Max request throughput (req/s) before a node is considered overloaded.
INSTANCE_OVERLOAD_THRESHOLD: dict[str, float] = {
    "t3.micro":    15.0,
    "t3.small":    25.0,
    "t3.medium":   50.0,
    "t3.large":    80.0,
    "m5.large":    90.0,
    "m5.xlarge":  150.0,
    "m5.2xlarge": 250.0,
    "c5.large":   130.0,
    "r5.large":   110.0,
    # DB instances
    "db.t3.micro":    20.0,
    "db.t3.small":    35.0,
    "db.t3.medium":   60.0,
    "db.m5.large":   100.0,
    "db.m5.xlarge":  160.0,
    "db.r5.large":   140.0,
    "db.r5.xlarge":  220.0,
    # Default fallback
    "default":         80.0,
}


# ═══════════════════════════════════════════════════════════════════════════
#  LATENCY CALCULATOR — one function per component family
# ═══════════════════════════════════════════════════════════════════════════

