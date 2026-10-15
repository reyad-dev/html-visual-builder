"""Backward-compatible project-intelligence context extension.

The existing mediator packet is preserved exactly. This module only attaches a
budgeted ``project_intelligence`` section, so current consumers of
``task_index`` and the seven-phase workflow continue to work unchanged.
"""
from __future__ import annotations

import json
import math


def estimate_tokens(payload) -> int:
    return math.ceil(len(json.dumps(payload, ensure_ascii=False, separators=(',', ':')).encode('utf-8')) / 3)


def compile_context(base_packet: dict, hits, budget: int = 4000) -> dict:
    packet = dict(base_packet)
    section = {
        'mode': 'optional-generated-index',
        'retrieved': [],
        'note': 'Generated index is navigational only; source files and knowledge.owl remain authoritative.',
    }
    packet['project_intelligence'] = section

    for hit in hits:
        item = hit.as_dict() if hasattr(hit, 'as_dict') else dict(hit)
        section['retrieved'].append(item)
        if estimate_tokens(packet) > budget:
            section['retrieved'].pop()
            break

    estimate = estimate_tokens(packet)
    section['context_budget'] = {
        'estimate': estimate,
        'limit': budget,
        'overflow': estimate > budget,
        'method': 'UTF-8 bytes/3 heuristic for combined packet only',
        'policy': 'Legacy mediator packet is preserved; optional project-intelligence hits are pruned first.',
    }
    return packet
