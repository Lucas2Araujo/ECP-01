#!/usr/bin/env python3
"""
Script de indexação de arquivos acadêmicos para o repositório Lucas2Araujo/ECP-01.
Gera o arquivo data/index.json para ser consumido pela interface web no GitHub Pages.
"""

import os
import json
import urllib.parse
from pathlib import Path

# Configurações do Repositório
REPO_OWNER = "Lucas2Araujo"
REPO_NAME = "ECP-01"
BRANCH = "main"
RAW_BASE_URL = f"https://raw.githubusercontent.com/{REPO_OWNER}/{REPO_NAME}/{BRANCH}"

# Diretórios e arquivos a serem ignorados
IGNORED_DIRS = {".git", ".github", "scripts", "data", "node_modules"}
IGNORED_FILES = {
    ".gitignore",
    ".gitattributes",
    "README.md",
    "CNAME",
    "index.html",
    "style.css",
    "app.js",
    "package.json",
    "package-lock.json",
}

def format_size_human(size_in_bytes: int) -> str:
    """Retorna o tamanho do arquivo em formato legível para humanos."""
    for unit in ["B", "KB", "MB", "GB", "TB"]:
        if size_in_bytes < 1024.0:
            if unit in ["B", "KB"]:
                return f"{size_in_bytes:.0f} {unit}" if unit == "B" else f"{size_in_bytes:.1f} {unit}"
            return f"{size_in_bytes:.1f} {unit}"
        size_in_bytes /= 1024.0
    return f"{size_in_bytes:.1f} PB"

def generate_index(repo_root: Path) -> list:
    """Varre recursivamente o repositório e gera a lista de materiais."""
    catalog = []

    for root, dirs, files in os.walk(repo_root):
        # Ignora diretórios ocultos ou na lista de ignorados
        dirs[:] = [
            d for d in dirs
            if d not in IGNORED_DIRS and not d.startswith(".")
        ]

        current_path = Path(root)
        try:
            rel_dir = current_path.relative_to(repo_root)
        except ValueError:
            continue

        # Se estiver na raiz do repositório, não indexa arquivos soltos na raiz
        if rel_dir == Path("."):
            continue

        parts = rel_dir.parts
        discipline = parts[0]
        category = parts[1] if len(parts) > 1 else "Geral"

        for file_name in sorted(files):
            # Ignora arquivos ocultos ou na lista de ignorados
            if file_name.startswith(".") or file_name in IGNORED_FILES:
                continue

            file_path = current_path / file_name
            
            # Pula links simbólicos quebrados ou pastas que pareçam arquivos
            if not file_path.is_file():
                continue

            try:
                size_bytes = file_path.stat().st_size
            except OSError:
                size_bytes = 0

            rel_file_path = (rel_dir / file_name).as_posix()
            
            # Codificação de URL garantindo que barras '/' sejam preservadas
            encoded_path = urllib.parse.quote(rel_file_path, safe="/")
            download_url = f"{RAW_BASE_URL}/{encoded_path}"

            item = {
                "name": file_name,
                "discipline": discipline,
                "category": category,
                "relative_path": rel_file_path,
                "size_human": format_size_human(size_bytes),
                "download_url": download_url,
            }
            catalog.append(item)

    # Ordenação estável por disciplina, categoria e nome
    catalog.sort(key=lambda x: (x["discipline"].lower(), x["category"].lower(), x["name"].lower()))
    return catalog

def main():
    # Caminho do diretório raiz do repositório (um nível acima de scripts/)
    script_dir = Path(__file__).resolve().parent
    repo_root = script_dir.parent

    print(f"[*] Varrendo repositório em: {repo_root}")
    items = generate_index(repo_root)
    print(f"[*] Total de materiais catalogados: {len(items)}")

    output_dir = repo_root / "data"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / "index.json"

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

    print(f"[✓] Catálogo gerado com sucesso em: {output_file}")

if __name__ == "__main__":
    main()

