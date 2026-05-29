from __future__ import annotations
import random
from .constants import *

def calculate_latency(
    node_type:          str,
    config_values:      dict,          # node.data.config_values from frontend
    traffic_multiplier: float,
    replica_count:      int = 1,       # numberOfInstances or ASG min
) -> float:
    """
    Calculate realistic latency for a single node based on its spec.

    General formula:
        base_ms
        × instance_multiplier          (how powerful the compute is)
        + spec_deltas                  (OS, storage, version, mode, etc.)
        × load_factor                  (how busy the node is)
        / replica_factor               (more replicas = load shared)
        + jitter                       (real-world variance ±15%)

    Each component type extracts different keys from config_values.
    """
    # ── Load factor — queuing increases with traffic ─────────────────────
    # At 1× → factor = 1.10  (10% overhead)
    # At 5× → factor = 1.85
    # At 10× → factor = 2.50  (queue saturation)
    load_factor = 1.0 + (traffic_multiplier / 10.0) * 1.5

    # ── Replica factor — load is split across instances ──────────────────
    # Uses square-root dampening — 4 replicas ≠ 4× throughput (coordination cost)
    effective_replicas = max(1, replica_count)
    replica_factor     = 1.0 / (effective_replicas ** 0.45)

    # ── Route to the right calculator ────────────────────────────────────
    if node_type == "vm":
        raw = _vm_latency(config_values)
    elif node_type == "autoscaling":
        raw = _asg_latency(config_values)
    elif node_type in ("postgresql", "mysql", "oracle", "mssql", "mariadb"):
        raw = _db_latency(node_type, config_values)
    elif node_type == "loadbalancer":
        raw = _lb_latency(config_values)
    elif node_type == "apigateway":
        raw = _apigw_latency(config_values)
    elif node_type == "cdn":
        raw = _cdn_latency(config_values)
    elif node_type == "firewall":
        raw = _firewall_latency(config_values)
    elif node_type == "objectstorage":
        raw = _obj_storage_latency(config_values)
    elif node_type == "nfs":
        raw = _nfs_latency(config_values)
    elif node_type == "blockstorage":
        raw = BASE_LATENCY["blockstorage"]
    elif node_type == "vmsnapshot":
        raw = BASE_LATENCY["vmsnapshot"]
    elif node_type == "snapshot":
        raw = BASE_LATENCY["snapshot"]
    elif node_type == "backup":
        raw = BASE_LATENCY["backup"]
    elif node_type in ("vpc", "dns"):
        raw = BASE_LATENCY[node_type]
    else:
        raw = BASE_LATENCY["default"]

    # ── Apply load + replica scaling ─────────────────────────────────────
    scaled = raw * load_factor * replica_factor

    # ── Jitter — ±15% random variance to model real-world fluctuation ────
    jitter = (random.random() - 0.5) * scaled * 0.30

    return max(0.5, round(scaled + jitter, 2))


# ── Component-specific latency functions ──────────────────────────────────

def _vm_latency(cv: dict) -> float:
    """
    config_values fields used:
      type         → INSTANCE_LATENCY_MULT
      flavor       → FLAVOR_LATENCY_ADD
      os           → OS_LATENCY_ADD
      rootVolume   → ROOT_VOLUME_LATENCY_ADD
    """
    base     = BASE_LATENCY["vm"]
    inst     = cv.get("type", "t3.medium")
    flavor   = cv.get("flavor", "Standard")
    os_name  = cv.get("os", "Ubuntu")
    root_vol = cv.get("rootVolume", "50 GB")

    inst_mult     = INSTANCE_LATENCY_MULT.get(inst, 1.0)
    flavor_add    = FLAVOR_LATENCY_ADD.get(flavor, 0.0)
    os_add        = OS_LATENCY_ADD.get(os_name, 0.0)
    vol_add       = ROOT_VOLUME_LATENCY_ADD.get(root_vol, 0.0)

    return (base * inst_mult) + flavor_add + os_add + vol_add


def _asg_latency(cv: dict) -> float:
    """
    config_values fields used:
      osSelection  → OS_LATENCY_ADD
      minimumSize  → used as replica_count (caller passes it)
      scalingPolicy → affects log messages but not per-request latency directly
    Note: replica_count is passed separately from numberOfInstances/minimumSize
    """
    base    = BASE_LATENCY["autoscaling"]
    os_name = cv.get("osSelection", "Ubuntu")
    os_add  = OS_LATENCY_ADD.get(os_name, 0.0)
    return base + os_add


def _db_latency(node_type: str, cv: dict) -> float:
    """
    config_values fields used:
      computeConfig → INSTANCE_LATENCY_MULT  (instance class)
      storageConfig → DB_STORAGE_LATENCY_DELTA  (storage tier)
      dbVersion     → DB_VERSION_LATENCY_DELTA  (optimizer version)
    """
    base         = BASE_LATENCY.get(node_type, 45.0)
    compute      = cv.get("computeConfig", "db.t3.medium")
    storage      = cv.get("storageConfig", "100 GB SSD")
    db_version   = cv.get("dbVersion", "")

    inst_mult    = INSTANCE_LATENCY_MULT.get(compute, 1.0)
    storage_add  = DB_STORAGE_LATENCY_DELTA.get(storage, 0.0)
    version_add  = DB_VERSION_LATENCY_DELTA.get(db_version, 0.0)

    return (base * inst_mult) + storage_add + version_add


def _lb_latency(cv: dict) -> float:
    """
    config_values fields used:
      lbType    → LB_TYPE_LATENCY
      algorithm → LB_ALGORITHM_ADD
    """
    lb_type   = cv.get("lbType", "Application (L7)")
    algorithm = cv.get("algorithm", "Round Robin")

    base = LB_TYPE_LATENCY.get(lb_type, 4.0)
    add  = LB_ALGORITHM_ADD.get(algorithm, 0.0)
    return base + add


def _apigw_latency(cv: dict) -> float:
    """
    config_values fields used:
      auth    → APIGW_AUTH_ADD
      caching → APIGW_CACHE_REDUCTION (boolean toggle)
    """
    auth      = cv.get("auth", "None")
    caching   = cv.get("caching", False)

    base      = BASE_LATENCY["apigateway"]
    auth_add  = APIGW_AUTH_ADD.get(auth, 0.0)
    raw       = base + auth_add

    if caching:
        # Simulate cache hit (90% of requests) vs miss (10%)
        if random.random() < 0.90:
            return raw * (1 - APIGW_CACHE_REDUCTION)   # cache hit — fast
        # else: cache miss — full latency
    return raw


def _cdn_latency(cv: dict) -> float:
    """
    config_values fields used:
      cachePolicy → CDN_CACHE_HIT_RATE
      ttl         → CDN_TTL_BONUS (small adjustment to hit rate)
    """
    cache_policy = cv.get("cachePolicy", "CachingOptimized")
    ttl          = cv.get("ttl", "86400s (1 day)")

    base      = BASE_LATENCY["cdn"]
    hit_rate  = CDN_CACHE_HIT_RATE.get(cache_policy, 0.7)
    hit_rate += CDN_TTL_BONUS.get(ttl, 0.0)
    hit_rate  = max(0.0, min(1.0, hit_rate))   # clamp 0–1

    if random.random() < hit_rate:
        return base * 0.30    # edge cache hit — serve from PoP
    else:
        return base * 4.0     # cache miss — round trip to origin


def _firewall_latency(cv: dict) -> float:
    """
    config_values fields used:
      mode  → FIREWALL_MODE_ADD
      rules → FIREWALL_RULES_ADD
    """
    mode  = cv.get("mode",  "Prevention")
    rules = cv.get("rules", "OWASP Top 10")

    base = BASE_LATENCY["firewall"]
    return base + FIREWALL_MODE_ADD.get(mode, 0.0) + FIREWALL_RULES_ADD.get(rules, 0.0)


def _obj_storage_latency(cv: dict) -> float:
    """
    config_values fields used:
      storageClass → OBJ_STORAGE_LATENCY
    """
    storage_class = cv.get("storageClass", "Standard")
    return OBJ_STORAGE_LATENCY.get(storage_class, 18.0)


def _nfs_latency(cv: dict) -> float:
    """
    config_values fields used:
      performanceMode → NFS_PERF_MODE_LATENCY
      size            → larger FS = slightly more metadata overhead
    """
    perf_mode = cv.get("performanceMode", "General Purpose")
    size_gb   = int(cv.get("size", 100))

    base     = NFS_PERF_MODE_LATENCY.get(perf_mode, 28.0)
    size_add = min(size_gb / 2000.0, 5.0)   # up to +5ms for very large volumes
    return base + size_add


# ── Throughput calculator ──────────────────────────────────────────────────

