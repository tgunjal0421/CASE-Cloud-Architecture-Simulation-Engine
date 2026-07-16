backend/
│
├── app/
│   ├── main.py                 # FastAPI entry point
│   ├── config.py               # configs (env, constants)
│
│   ├── api/                    # API routes (matches UI actions)
│   │   ├── simulation.py       # /simulate, /start, /stop
│   │   ├── architecture.py     # save/load architecture
│   │   ├── metrics.py          # fetch metrics
│
│   ├── schemas/                # Pydantic models (input/output)
│   │   ├── simulation.py
│   │   ├── architecture.py
│   │   ├── component.py        # 🔥 NEW (component definition)
│   │   ├── metrics.py
│
│   ├── simulation/             # CORE LOGIC (MOST IMPORTANT)
│   │   ├── engine.py           # main simulation engine
│   │   ├── events.py           # event-driven logic
│   │   ├── component_registry.py  # 🔥 maps type → class
│   │   │
│   │   ├── components/         # 🔥 ALL COMPONENT LOGIC HERE
│   │   │   ├── compute.py      # VM, Container, Serverless
│   │   │   ├── storage.py      # Object, Block, File storage
│   │   │   ├── database.py     # SQL, NoSQL, Cache
│   │   │   ├── network.py      # LB, API Gateway, Queue
│   │   │   ├── security.py     # WAF, Identity, Secrets
│   │   │
│   │   ├── routing.py          # request flow logic (replaces LB-only logic)
│   │   ├── metrics.py          # latency, throughput calc
│   │   ├── failure.py          # failure simulation
│   │   ├── scaling.py          # auto-scaling logic
│
│   ├── services/               # business logic layer
│   │   ├── simulation_service.py
│   │   ├── architecture_service.py
│
│   ├── db/                     # database handling
│   │   ├── postgres.py
│   │   ├── redis.py
│   │   ├── models.py
│
│   ├── utils/                  # helper functions
│   │   ├── constants.py        # base latency, configs
│   │   ├── helpers.py
│
├── requirements.txt
├── Dockerfile
└── README.md