/**
 * oneiro_QA_max_stress_test_console_script.js
 *
 * Stress/benchmark orodja za Oneiro aplikacijo - delajo direktno z
 * brskalniškim IndexedDB ('DreamInterpreterDB') in localStorage.
 *
 * TIP SKRIPTE: brskalniški devtools console script.
 * Ni namenjen zagonu prek Node.js ali tega dashboarda - poganjaš ga tako,
 * da odpreš devtools konzolo na strani Oneiro aplikacije (kjer baza že
 * obstaja v brskalniku) in prilepiš celotno vsebino spodaj. Po nalaganju
 * so v konzoli na voljo funkcije:
 *
 *   stressInsertMax(count, batchSize)    - vstavi N testnih sanj
 *   bulkInsertMax(count, batchSize)      - vstavi sanje + interpretacije
 *   benchmarkWritesMax(n, batchSize)     - izmeri hitrost pisanja
 *   fillLocalQuotaMax()                  - napolni localStorage do limita
 *   cleanupLocalQuotaMax()               - počisti testne vnose iz localStorage
 */

(async () => {
  console.log('🔹 Oneiro MAX Stress Test initializing...');

  const DB_NAME = 'DreamInterpreterDB';

  // Helper: open DB
  async function openDB(version) {
    const req = indexedDB.open(DB_NAME, version);
    return new Promise((resolve, reject) => {
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  // 1️⃣ MAX Stress Insert - Dreams only
  window.stressInsertMax = async function(count = 50000, batchSize = 2000) {
    const db = await openDB();
    console.log(`⏳ MAX Stress inserting ${count} dreams in batches of ${batchSize}...`);
    const start = performance.now();

    for (let offset = 0; offset < count; offset += batchSize) {
      const tx = db.transaction(['dreams'], 'readwrite');
      const store = tx.objectStore('dreams');

      for (let i = offset; i < Math.min(offset + batchSize, count); i++) {
        store.add({
          id: crypto.randomUUID(),
          title: "MAX Stress Dream " + i,
          content: "Lorem ipsum dolor sit amet ".repeat(30),
          createdAt: Date.now(),
          tags: ["max-stress"]
        });
      }

      await new Promise((res, rej) => {
        tx.oncomplete = res;
        tx.onerror = () => rej(tx.error);
      });

      console.log(`Inserted batch: ${offset}-${Math.min(offset + batchSize, count)-1}`);
    }

    const end = performance.now();
    console.log("✅ MAX Stress insert done. Total seconds:", (end - start)/1000);
  };

  // 2️⃣ MAX Bulk Insert - Dreams + Interpretations
  window.bulkInsertMax = async function(count = 50000, batchSize = 2000) {
    const db = await openDB();
    console.log(`⏳ MAX Bulk inserting ${count} dreams + interpretations in batches of ${batchSize}...`);
    const start = performance.now();

    for (let offset = 0; offset < count; offset += batchSize) {
      const tx = db.transaction(['dreams', 'interpretations'], 'readwrite');
      const dreamStore = tx.objectStore('dreams');
      const interpStore = tx.objectStore('interpretations');

      for (let i = offset; i < Math.min(offset + batchSize, count); i++) {
        const dreamId = crypto.randomUUID();
        dreamStore.add({
          id: dreamId,
          title: "MAX Bulk " + i,
          content: "Bulk content ".repeat(30),
          createdAt: Date.now()
        });

        interpStore.add({
          id: crypto.randomUUID(),
          dreamId,
          text: "AI interpretation ".repeat(20)
        });
      }

      await new Promise((res, rej) => {
        tx.oncomplete = res;
        tx.onerror = () => rej(tx.error);
      });

      console.log(`Processed batch: ${offset}-${Math.min(offset + batchSize, count)-1}`);
    }

    const end = performance.now();
    console.log("✅ MAX Bulk insert done. Total seconds:", (end - start)/1000);
  };

  // 3️⃣ MAX Benchmark Writes
  window.benchmarkWritesMax = async function(n = 10000, batchSize = 2000) {
    const db = await openDB();
    console.log(`⏳ MAX Benchmarking ${n} writes in batches of ${batchSize}...`);
    const start = performance.now();

    for (let offset = 0; offset < n; offset += batchSize) {
      const tx = db.transaction(['dreams'], 'readwrite');
      const store = tx.objectStore('dreams');

      for (let i = offset; i < Math.min(offset + batchSize, n); i++) {
        store.add({
          id: crypto.randomUUID(),
          title: "MAX Bench",
          content: "Test",
          createdAt: Date.now()
        });
      }

      await new Promise((res, rej) => {
        tx.oncomplete = res;
        tx.onerror = () => rej(tx.error);
      });

      console.log(`Benchmark batch: ${offset}-${Math.min(offset + batchSize, n)-1}`);
    }

    const end = performance.now();
    console.log("✅ MAX Benchmark done. Avg ms/write:", (end - start)/n);
  };

  // 4️⃣ LocalStorage MAX Quota Helpers
  window.fillLocalQuotaMax = () => {
    let chunk = "x".repeat(1024*1024); // 1MB
    let i = 0;
    try {
      while(true) {
        localStorage.setItem("quota_test_" + i, chunk);
        i++;
      }
    } catch(e) {
      console.log("⚠️ LocalStorage quota hit approx:", i, "MB");
    }
  };

  window.cleanupLocalQuotaMax = () => {
    Object.keys(localStorage)
      .filter(k => k.startsWith("quota_test_"))
      .forEach(k => localStorage.removeItem(k));
    console.log("✅ LocalStorage quota cleanup done");
  };

  console.log('🎯 Oneiro MAX Stress Test ready!');
})();
