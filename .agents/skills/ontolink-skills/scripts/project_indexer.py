"""Generated project-code index for OntoLink.

The index is deliberately separate from ``knowledge.owl``. It contains only
rediscoverable project structure such as files, symbols and lightweight route
hints. Source files remain the source of truth; the index may be deleted and
rebuilt at any time.
"""
from __future__ import annotations

import argparse
import ast
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re

INDEX_VERSION = 1
INDEX_RELATIVE_PATH = Path('.ontolink/index/project-index.json')
EXCLUDED_DIRS = {
    '.git', '.idea', '.vscode', '.dart_tool', '.ontolink', 'node_modules',
    'build', 'dist', 'coverage', '__pycache__', '.venv', 'venv', 'Pods',
    'DerivedData',
}
LANGUAGE = {
    '.py': 'python', '.dart': 'dart', '.js': 'javascript', '.jsx': 'javascript',
    '.ts': 'typescript', '.tsx': 'typescript', '.java': 'java', '.kt': 'kotlin',
    '.go': 'go', '.rs': 'rust', '.cs': 'csharp', '.php': 'php', '.rb': 'ruby',
}
CLASS_RE = re.compile(r'(?m)^\s*(?:export\s+)?(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*)')
FUNC_RE = re.compile(r'(?m)^\s*(?:export\s+)?(?:async\s+)?(?:function\s+)?([A-Za-z_$][\w$]*)\s*\([^;{}]*\)\s*(?:=>|\{)')
ROUTE_RE = re.compile(r"(?i)\b(GET|POST|PUT|PATCH|DELETE)\s+['\"]([^'\"]+)['\"]")


def _sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _slug(text: str, limit: int = 72) -> str:
    raw = re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-') or 'node'
    if len(raw) <= limit:
        return raw
    digest = hashlib.sha1(text.encode('utf-8')).hexdigest()[:10]
    return raw[: limit - 11].rstrip('-') + '-' + digest


def _file_id(relative: Path) -> str:
    return 'file-' + _slug(relative.as_posix(), 70)


def _symbol_id(relative: Path, kind: str, name: str, line: int) -> str:
    return _slug(f'{kind}-{relative.as_posix()}-{name}-{line}', 79)


def _base_file(root: Path, path: Path) -> dict:
    rel = path.relative_to(root)
    language = LANGUAGE.get(path.suffix.lower(), 'text')
    return {
        'id': _file_id(rel),
        'type': 'SourceFile',
        'path': rel.as_posix(),
        'contentHash': _sha(path),
        'language': language,
        'summary': f'{language} source file {rel.as_posix()}',
    }


def _python_symbols(root: Path, path: Path) -> list[dict]:
    rel = path.relative_to(root)
    source = path.read_text(encoding='utf-8', errors='replace')
    try:
        tree = ast.parse(source, filename=str(rel))
    except SyntaxError:
        return []
    records = []
    for node in ast.walk(tree):
        if not isinstance(node, (ast.ClassDef, ast.FunctionDef, ast.AsyncFunctionDef)):
            continue
        kind = 'ClassSymbol' if isinstance(node, ast.ClassDef) else 'FunctionSymbol'
        line = int(getattr(node, 'lineno', 1))
        end = int(getattr(node, 'end_lineno', line))
        record = {
            'id': _symbol_id(rel, kind, node.name, line),
            'type': kind,
            'symbolName': node.name,
            'qualifiedName': f'{rel.as_posix()}::{node.name}',
            'declaredIn': _file_id(rel),
            'path': rel.as_posix(),
            'lineStart': line,
            'lineEnd': end,
            'language': 'python',
            'summary': f'{kind} {node.name} in {rel.as_posix()}',
            'indexMethod': 'python-ast',
        }
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            args = [arg.arg for arg in node.args.args]
            record['signature'] = f"{node.name}({', '.join(args)})"
        records.append(record)
    return records


def _generic_symbols(root: Path, path: Path) -> list[dict]:
    rel = path.relative_to(root)
    text = path.read_text(encoding='utf-8', errors='replace')
    language = LANGUAGE.get(path.suffix.lower(), 'text')
    records = []
    for match in CLASS_RE.finditer(text):
        name = match.group(1)
        line = text.count('\n', 0, match.start()) + 1
        records.append({
            'id': _symbol_id(rel, 'ClassSymbol', name, line), 'type': 'ClassSymbol',
            'symbolName': name, 'qualifiedName': f'{rel.as_posix()}::{name}',
            'declaredIn': _file_id(rel), 'path': rel.as_posix(), 'lineStart': line,
            'language': language, 'summary': f'Heuristic class {name} in {rel.as_posix()}',
            'indexMethod': 'heuristic-regex',
        })
    for match in FUNC_RE.finditer(text):
        name = match.group(1)
        if name in {'if', 'for', 'while', 'switch', 'catch'}:
            continue
        line = text.count('\n', 0, match.start()) + 1
        records.append({
            'id': _symbol_id(rel, 'FunctionSymbol', name, line), 'type': 'FunctionSymbol',
            'symbolName': name, 'qualifiedName': f'{rel.as_posix()}::{name}',
            'declaredIn': _file_id(rel), 'path': rel.as_posix(), 'lineStart': line,
            'language': language, 'summary': f'Heuristic function {name} in {rel.as_posix()}',
            'indexMethod': 'heuristic-regex',
        })
    for match in ROUTE_RE.finditer(text):
        method, route = match.groups()
        line = text.count('\n', 0, match.start()) + 1
        records.append({
            'id': _symbol_id(rel, 'ApiEndpoint', method + '-' + route, line),
            'type': 'ApiEndpoint', 'httpMethod': method.upper(), 'route': route,
            'declaredIn': _file_id(rel), 'path': rel.as_posix(), 'lineStart': line,
            'language': language, 'summary': f'{method.upper()} {route} in {rel.as_posix()}',
            'indexMethod': 'heuristic-regex',
        })
    return records


def iter_source_files(root: Path):
    root = root.resolve()
    for path in root.rglob('*'):
        if not path.is_file():
            continue
        parts = path.relative_to(root).parts
        if any(part in EXCLUDED_DIRS for part in parts):
            continue
        if path.suffix.lower() in LANGUAGE:
            yield path


def _records_for_file(root: Path, path: Path) -> list[dict]:
    records = [_base_file(root, path)]
    suffix = path.suffix.lower()
    if suffix == '.py':
        records.extend(_python_symbols(root, path))
    elif suffix in {'.dart', '.js', '.jsx', '.ts', '.tsx'}:
        records.extend(_generic_symbols(root, path))
    return records


def build_index(root: Path) -> dict:
    root = root.resolve()
    records = []
    for path in iter_source_files(root):
        records.extend(_records_for_file(root, path))
    return {
        'version': INDEX_VERSION,
        'generatedAt': datetime.now(timezone.utc).isoformat(),
        'root': '.',
        'recordCount': len(records),
        'records': records,
    }


def update_index(root: Path, index: dict, changed_paths: list[str]) -> dict:
    """Incrementally refresh records for changed project-relative paths."""
    root = root.resolve()
    changed = {Path(value).as_posix() for value in changed_paths}
    kept = [r for r in index.get('records', []) if r.get('path') not in changed]
    for relative in sorted(changed):
        path = (root / relative).resolve()
        if not path.is_relative_to(root):
            raise ValueError(f'Changed path escapes project root: {relative}')
        if path.is_file() and path.suffix.lower() in LANGUAGE and not any(part in EXCLUDED_DIRS for part in Path(relative).parts):
            kept.extend(_records_for_file(root, path))
    return {
        'version': INDEX_VERSION,
        'generatedAt': datetime.now(timezone.utc).isoformat(),
        'root': '.',
        'recordCount': len(kept),
        'records': kept,
    }


def default_index_path(root: Path) -> Path:
    return root.resolve() / INDEX_RELATIVE_PATH


def load_index(path: Path) -> dict:
    data = json.loads(path.read_text(encoding='utf-8'))
    if data.get('version') != INDEX_VERSION or not isinstance(data.get('records'), list):
        raise ValueError('Unsupported or invalid OntoLink project index')
    return data


def write_index(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path.cwd())
    parser.add_argument('--output', type=Path)
    parser.add_argument('--changed', action='append', default=[], help='Project-relative path to refresh; repeatable')
    args = parser.parse_args()
    output = args.output or default_index_path(args.root)
    if args.changed and output.exists():
        data = update_index(args.root, load_index(output), args.changed)
    else:
        data = build_index(args.root)
    write_index(output, data)
    print(json.dumps({'index': str(output), 'records': data['recordCount'], 'incremental': bool(args.changed)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
