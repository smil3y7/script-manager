"use client";

import { useState } from "react";
import type { ScriptDefinition } from "@/lib/registry";

type RunResult = {
  ok: boolean;
  stdout: string;
  stderr: string;
  durationMs: number;
};

const LANG_LABEL: Record<string, string> = {
  python: "PY",
  node: "JS",
  docs: "DOC",
};

export default function ScriptCard({ script }: { script: ScriptDefinition }) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(script.inputs.map((i) => [i.name, i.default ?? ""]))
  );
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [result, setResult] = useState<RunResult | null>(null);
  const [expanded, setExpanded] = useState(false);

  async function handleRun() {
    setStatus("running");
    setExpanded(true);
    setResult(null);
    try {
      const res = await fetch(`/api/run/${script.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({
        ok: false,
        stdout: "",
        stderr: "Klic ni uspel - preveri povezavo ali poskusi znova.",
        durationMs: 0,
      });
    } finally {
      setStatus("done");
    }
  }

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-head-left">
          <span className="lang-badge">{LANG_LABEL[script.language] ?? "?"}</span>
          <div>
            <h3 className="card-title">{script.name}</h3>
            <p className="card-desc">{script.description}</p>
          </div>
        </div>
        <button
          onClick={handleRun}
          disabled={status === "running"}
          className="run-btn"
        >
          {status === "running"
            ? "Teče…"
            : script.language === "docs"
            ? "Pokaži kodo"
            : "Zaženi"}
        </button>
      </div>

      {script.note && <p className="card-note">{script.note}</p>}

      {script.tags.length > 0 && (
        <div className="tag-row">
          {script.tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      )}

      {script.inputs.length > 0 && (
        <div className="input-row">
          {script.inputs.map((input) => (
            <label key={input.name} className="input-field">
              <span>{input.label}</span>
              <input
                type={input.type}
                value={values[input.name] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [input.name]: e.target.value }))
                }
              />
            </label>
          ))}
        </div>
      )}

      {expanded && (
        <div className="output-panel">
          <div className="output-head">
            <span
              className={
                status === "running"
                  ? "status-dot status-running"
                  : !result?.ok
                  ? "status-dot status-fail"
                  : script.language === "docs"
                  ? "status-dot status-info"
                  : "status-dot status-ok"
              }
            />
            <span className="output-head-label">
              {status === "running"
                ? "nalagam …"
                : !result?.ok
                ? "napaka"
                : script.language === "docs"
                ? "koda za ročno uporabo"
                : `končano · ${result.durationMs}ms`}
            </span>
            <button className="close-btn" onClick={() => setExpanded(false)}>
              skrij
            </button>
          </div>
          <pre className="output-body">
            {status === "running" && "čakam na izpis…"}
            {result?.stdout}
            {result?.stderr && (
              <span className="output-stderr">{"\n" + result.stderr}</span>
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
