import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { getScript } from "@/lib/registry";

export const maxDuration = 60; // Vercel: max trajanje funkcije v sekundah (Pro plan)

function runProcess(
  command: string,
  args: string[],
  timeoutMs: number
): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      timeout: timeoutMs,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));

    child.on("close", (code) => {
      resolve({ stdout, stderr, code });
    });

    child.on("error", (err) => {
      resolve({ stdout, stderr: stderr + "\n" + err.message, code: -1 });
    });
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const script = await getScript(slug);

  if (!script) {
    return NextResponse.json(
      { error: `Skripta '${slug}' ni registrirana.` },
      { status: 404 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const values: Record<string, string> = body.values || {};

  // Argumenti se sestavijo v vrstnem redu, kot so definirani v registru.
  const args = script.inputs.map((input) => values[input.name] ?? input.default ?? "");

  const entryPath = path.join(
    /* turbopackIgnore: true */ process.cwd(),
    script.entry
  );
  const startedAt = Date.now();

  if (script.language === "docs") {
    const fs = await import("fs/promises");
    try {
      const content = await fs.readFile(entryPath, "utf-8");
      return NextResponse.json({
        ok: true,
        stdout: content,
        stderr: "",
        durationMs: Date.now() - startedAt,
        isDocs: true,
      });
    } catch (err) {
      return NextResponse.json({
        ok: false,
        stdout: "",
        stderr: `Datoteke ni bilo mogoče prebrati: ${err}`,
        durationMs: Date.now() - startedAt,
      });
    }
  }

  if (script.language === "node") {
    const result = await runProcess(
      "node",
      [entryPath, ...args],
      script.timeout_ms ?? 30000
    );
    return NextResponse.json({
      ok: result.code === 0,
      stdout: result.stdout,
      stderr: result.stderr,
      durationMs: Date.now() - startedAt,
    });
  }

  if (script.language === "python") {
    // POMEMBNO: Vercel Node serverless funkcije privzeto nimajo Python
    // interpreterja na voljo. Ta veja deluje lokalno (npm run dev) in na
    // strežnikih, kjer je `python3` nameščen, ne pa nujno na Vercelu.
    // Glej README.md, razdelek "Python skripte na Vercelu" za rešitve.
    const result = await runProcess(
      "python3",
      [entryPath, ...args],
      script.timeout_ms ?? 30000
    );

    if (result.code === -1 && /ENOENT/i.test(result.stderr)) {
      return NextResponse.json({
        ok: false,
        stdout: "",
        stderr:
          "Python interpreter ni na voljo v tem okolju. Na Vercelu privzeto ni Python runtime za Node funkcije - glej README.md za rešitve (Vercel Python funkcija ali zunanji runner).",
        durationMs: Date.now() - startedAt,
      });
    }

    return NextResponse.json({
      ok: result.code === 0,
      stdout: result.stdout,
      stderr: result.stderr,
      durationMs: Date.now() - startedAt,
    });
  }

  return NextResponse.json(
    { error: `Nepodprt jezik: ${script.language}` },
    { status: 400 }
  );
}
