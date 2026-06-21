import { getRegistry } from "@/lib/registry";
import ScriptCard from "@/components/ScriptCard";

export default async function Home() {
  const scripts = await getRegistry();
  const allTags = Array.from(new Set(scripts.flatMap((s) => s.tags))).sort();

  return (
    <main className="page">
      <header className="page-header">
        <div className="eyebrow">SKRIPTARNA · {scripts.length} REGISTRIRANIH</div>
        <h1 className="page-title">Skripte na enem mestu</h1>
        <p className="page-subtitle">
          Vse avtomatizacije, zbrane na enem nadzorni plošči. Dodaj novo
          skripto v <code>scripts/</code>, registriraj jo v{" "}
          <code>registry/scripts.json</code> - tukaj se pojavi sama.
        </p>
        {allTags.length > 0 && (
          <div className="tag-row tag-row-header">
            {allTags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        )}
      </header>

      {scripts.length === 0 ? (
        <div className="empty-state">
          <p>Še nič tu ni registrirano.</p>
          <p className="empty-state-sub">
            Dodaj vnos v <code>registry/scripts.json</code> in skripto v{" "}
            <code>scripts/python/</code> ali <code>scripts/js/</code>.
          </p>
        </div>
      ) : (
        <div className="card-grid">
          {scripts.map((script) => (
            <ScriptCard key={script.slug} script={script} />
          ))}
        </div>
      )}

      <footer className="page-footer">
        <span>deploy: vercel · register: registry/scripts.json</span>
      </footer>
    </main>
  );
}
