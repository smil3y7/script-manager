#!/usr/bin/env python3
"""
Izvozi SQLite shemo (tabele, stolpci, foreign keys, indeksi) v JSON datoteko.

Uporaba:
    python3 export_schema.py <pot_do_baze.sqlite>

Prej je bila pot do baze trdo kodirana v skripti - zdaj je prvi CLI
argument, da ni treba urejati kode ob vsaki novi bazi.

OPOMBA O DASHBOARDU: ta skripta bere lokalno datoteko na disku (in piše
izhodni .schema.json zraven nje). Na Vercelu/serverless okolju nima dostopa
do tvojega lokalnega C:\\Users\\... diska - smiselna je samo za lokalni
zagon (npr. `npm run dev`), ne za produkcijski deploy.
"""

import sqlite3
import json
import sys
from pathlib import Path


def export_schema(db_path: str):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    schema = {"database": db_path, "tables": {}}

    tables = cursor.execute(
        """
        SELECT name, sql
        FROM sqlite_master
        WHERE type='table'
        AND name NOT LIKE 'sqlite_%'
        ORDER BY name
        """
    ).fetchall()

    for table_name, create_sql in tables:
        table_info = {"create_sql": create_sql}

        columns = cursor.execute(f"PRAGMA table_info('{table_name}')").fetchall()
        table_info["columns"] = [
            {
                "cid": col[0],
                "name": col[1],
                "type": col[2],
                "notnull": bool(col[3]),
                "default": col[4],
                "primary_key": bool(col[5]),
            }
            for col in columns
        ]

        fks = cursor.execute(f"PRAGMA foreign_key_list('{table_name}')").fetchall()
        table_info["foreign_keys"] = [
            {
                "id": fk[0],
                "seq": fk[1],
                "referenced_table": fk[2],
                "from_column": fk[3],
                "to_column": fk[4],
                "on_update": fk[5],
                "on_delete": fk[6],
                "match": fk[7],
            }
            for fk in fks
        ]

        indexes = cursor.execute(f"PRAGMA index_list('{table_name}')").fetchall()
        table_info["indexes"] = []
        for idx in indexes:
            idx_name = idx[1]
            idx_info = cursor.execute(f"PRAGMA index_info('{idx_name}')").fetchall()
            table_info["indexes"].append(
                {
                    "name": idx_name,
                    "unique": bool(idx[2]),
                    "columns": [x[2] for x in idx_info],
                }
            )

        schema["tables"][table_name] = table_info

    conn.close()

    output_path = Path(db_path).with_suffix(".schema.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(schema, f, indent=2, ensure_ascii=False)

    print(f"\nSchema izvožen v:\n{output_path}")


def main():
    if len(sys.argv) < 2 or not sys.argv[1].strip():
        print("Napaka: manjka pot do baze.", file=sys.stderr)
        print("Uporaba: python3 export_schema.py <pot_do_baze.sqlite>", file=sys.stderr)
        sys.exit(1)

    export_schema(sys.argv[1])


if __name__ == "__main__":
    main()
