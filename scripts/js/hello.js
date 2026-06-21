#!/usr/bin/env node
/**
 * Primer skripte za dashboard.
 *
 * Konvencija:
 * - Argumenti pridejo kot navadni CLI argumenti (process.argv.slice(2)),
 *   v vrstnem redu, definiranem v registry/scripts.json pod "inputs".
 * - Izpis na stdout se prikaže v dashboardu kot rezultat.
 * - Napake izpiši na stderr in zaključi s process.exit(1).
 */

console.log("Pozdravljen iz Node.js skripte!");
console.log("Skripta se je uspešno izvedla.");
