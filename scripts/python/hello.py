#!/usr/bin/env python3
"""
Primer skripte za dashboard.

Konvencija:
- Argumenti pridejo kot navadni CLI argumenti (sys.argv), v vrstnem redu,
  ki je definiran v registry/scripts.json pod "inputs".
- Izpis na stdout se prikaže v dashboardu kot rezultat.
- Napake izpiši na stderr in zaključi s sys.exit(1).
"""

import sys


def main():
    ime = sys.argv[1] if len(sys.argv) > 1 else "svet"
    print(f"Pozdravljen, {ime}!")
    print("Skripta se je uspešno izvedla.")


if __name__ == "__main__":
    main()
