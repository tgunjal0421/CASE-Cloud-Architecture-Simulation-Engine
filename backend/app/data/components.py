# Cloud architecture domain components

DOMAIN_COMPONENTS = [
    {
        "domain": "Compute",
        "items": [
            {
                "kind": "Virtual Machine",
                "icon": "🖥️",
                "description": "General purpose compute instance."
            },
            {
                "kind": "Container Service",
                "icon": "📦",
                "description": "Runs containerized workloads."
            },
            {
                "kind": "Serverless Function",
                "icon": "⚙️",
                "description": "Executes event-driven compute."
            }
        ]
    },
    {
        "domain": "Storage",
        "items": [
            {
                "kind": "Object Storage",
                "icon": "🗂️",
                "description": "Durable blob/object storage."
            },
            {
                "kind": "Block Storage",
                "icon": "💽",
                "description": "Persistent block volumes."
            },
            {
                "kind": "File Storage",
                "icon": "📁",
                "description": "Shared network file system."
            }
        ]
    },
    {
        "domain": "Database",
        "items": [
            {
                "kind": "SQL Database",
                "icon": "🛢️",
                "description": "Relational transactional database."
            },
            {
                "kind": "NoSQL Database",
                "icon": "📚",
                "description": "Key-value or document store."
            },
            {
                "kind": "Cache Layer",
                "icon": "⚡",
                "description": "Low-latency in-memory cache."
            }
        ]
    },
    {
        "domain": "Network",
        "items": [
            {
                "kind": "Load Balancer",
                "icon": "🔀",
                "description": "Distributes incoming requests."
            },
            {
                "kind": "API Gateway",
                "icon": "🌐",
                "description": "Routes and governs APIs."
            },
            {
                "kind": "Message Queue",
                "icon": "📨",
                "description": "Asynchronous event buffering."
            }
        ]
    },
    {
        "domain": "Security",
        "items": [
            {
                "kind": "Web Application Firewall",
                "icon": "🛡️",
                "description": "Filters malicious web traffic."
            },
            {
                "kind": "Identity Service",
                "icon": "👤",
                "description": "Authentication and authorization."
            },
            {
                "kind": "Secrets Vault",
                "icon": "🔐",
                "description": "Securely stores credentials and keys."
            }
        ]
    }
]
