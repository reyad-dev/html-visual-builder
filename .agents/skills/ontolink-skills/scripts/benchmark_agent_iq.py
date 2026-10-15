"""Small deterministic retrieval benchmark for the optional Project Intelligence layer."""
from __future__ import annotations

import argparse
import json
import time

from rdf_store import Store, O, TYPE
from retrieval import search


def fixture(size: int):
    graph = Store(); project = O + 'project:benchmark'
    graph.add(project, TYPE, O + 'Project', True); graph.add(project, O + 'title', 'Benchmark'); graph.add(project, O + 'revision', '0')
    records = []
    for i in range(size):
        records.append({'id': f'file-{i}', 'type': 'SourceFile', 'path': f'src/module_{i}.py', 'language': 'python', 'summary': f'generic module {i}'})
    target = size // 2
    records[target]['summary'] = 'authentication refresh token rotation service'
    records.append({'id': 'refresh-target', 'type': 'FunctionSymbol', 'path': f'src/module_{target}.py', 'symbolName': 'refresh_token', 'summary': 'authentication refresh token rotation'})
    return graph, {'version': 1, 'records': records}


def run(size: int):
    graph, index = fixture(size)
    start = time.perf_counter()
    hits = search(graph, index, 'authentication refresh token', limit=10)
    elapsed = (time.perf_counter() - start) * 1000
    ids = [hit.id for hit in hits]
    return {'records': len(index['records']), 'query_ms': round(elapsed, 3), 'target_rank': ids.index('refresh-target') + 1 if 'refresh-target' in ids else None}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--size', type=int, default=1000)
    args = parser.parse_args()
    print(json.dumps(run(args.size), indent=2))


if __name__ == '__main__':
    main()
