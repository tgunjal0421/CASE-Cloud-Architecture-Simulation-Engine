"""Simple CLI harness to run the engine for multiple ticks and print summaries.
Usage:
    python3 backend/scripts/sim_harness.py --ticks 5 --traffic 100
"""
import sys
import json
import time
import argparse
import os

# Ensure backend package is importable when running this script from repository root
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..'))
sys.path.insert(0, BACKEND_ROOT)
from app.simulation.engine import run_tick, empty_state


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--ticks', type=int, default=5)
    p.add_argument('--traffic', type=int, default=100)
    p.add_argument('--pipeline', action='store_true')
    args = p.parse_args()

    nodes = [
        {'id':'lb-1','type':'loadbalancer', 'label': 'Load Balancer'},
        {'id':'app-1','type':'vm', 'label': 'App Server'},
        {'id':'db-1','type':'database', 'label': 'Primary DB'},
    ]
    edges = [{'source':'lb-1','target':'app-1'},{'source':'app-1','target':'db-1'}]

    state = empty_state()
    for t in range(1, args.ticks + 1):
        payload = {'nodes': nodes, 'edges': edges, 'traffic': args.traffic, 'chaos': False}
        state = run_tick(payload, state)
        metrics = state['system_metrics']
        print(f"Tick {t}: throughput={metrics['totalThroughput']} latency={metrics['avgLatency']} err={metrics['errorRate']} logs={len(state.get('logs', []))}")
        time.sleep(0.1)

    print('\nFinal metrics:')
    print(json.dumps(metrics, indent=2))

if __name__ == '__main__':
    main()
