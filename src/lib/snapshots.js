// src/lib/snapshots.js
import fs from "fs/promises";
import path from "path";

const DEFAULT_DIR = process.env.SNAPSHOTS_DIR || path.join(process.cwd(), "data", "scrapes");

function stamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

/**
 * Guarda un JSON "bonito" en disco y retorna metadatos.
 * @param {string} prefix - nombre lógico (p.ej. "sigad_import")
 * @param {any} payload - objeto/array a persistir
 * @returns {{ absPath: string, relPath: string, bytes: number, when: string }}
 */
export async function save_json_snapshot(prefix, payload) {
  const dir = DEFAULT_DIR;
  const when = stamp();
  const fileName = `${prefix}_${when}.json`;
  const absPath = path.join(dir, fileName);

  await fs.mkdir(dir, { recursive: true });
  const content = JSON.stringify(payload, null, 2);
  await fs.writeFile(absPath, content, "utf8");

  return { absPath, relPath: path.relative(process.cwd(), absPath), bytes: Buffer.byteLength(content), when };
}
