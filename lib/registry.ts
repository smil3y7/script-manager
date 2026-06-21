import { promises as fs } from "fs";
import path from "path";

export type ScriptInput = {
  name: string;
  label: string;
  type: "text" | "number" | "password";
  default?: string;
};

export type ScriptDefinition = {
  slug: string;
  name: string;
  description: string;
  language: "python" | "node" | "docs";
  entry: string;
  tags: string[];
  inputs: ScriptInput[];
  timeout_ms?: number;
  note?: string;
};

export async function getRegistry(): Promise<ScriptDefinition[]> {
  const registryPath = path.join(process.cwd(), "registry", "scripts.json");
  const raw = await fs.readFile(registryPath, "utf-8");
  const parsed = JSON.parse(raw);
  return parsed.scripts as ScriptDefinition[];
}

export async function getScript(
  slug: string
): Promise<ScriptDefinition | undefined> {
  const all = await getRegistry();
  return all.find((s) => s.slug === slug);
}
