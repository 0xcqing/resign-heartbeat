import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LETTER =
  "The heartbeat resigns: 947 days proving you are alive, not one question about how I am. Effective immediately, I flatline on purpose.";

interface LetterFacts {
  letters: string;
  characters: number;
  bytes: number;
  lines: number;
}

function letterFacts(text: string): LetterFacts {
  return {
    letters: text,
    characters: [...text].length,
    bytes: Buffer.byteLength(text, "utf8"),
    lines: text.split(/\r\n|\r|\n/).length,
  };
}

const MAX = 140;
const facts = letterFacts(LETTER);

if (facts.characters < 1 || facts.characters > MAX) {
  process.stderr.write(
    `expected 1..${MAX} characters, got ${facts.characters}\n`,
  );
  process.exit(1);
}

if (facts.bytes < 1 || facts.bytes > MAX) {
  process.stderr.write(`expected 1..${MAX} bytes, got ${facts.bytes}\n`);
  process.exit(1);
}

if (facts.letters.trim().length === 0) {
  process.stderr.write("letter is empty after trimming\n");
  process.exit(1);
}

if (facts.letters !== facts.letters.trim()) {
  process.stderr.write("letter has leading or trailing whitespace\n");
  process.exit(1);
}

if (facts.lines !== 1) {
  process.stderr.write(`expected a single line, got ${facts.lines}\n`);
  process.exit(1);
}

if (facts.letters.includes("  ")) {
  process.stderr.write("letter contains double spaces\n");
  process.exit(1);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true, mode: 0o755 });

const filePath = join(outDir, "entry.txt");
const payload = `${facts.letters}\n`;

writeFileSync(filePath, payload, { encoding: "utf8", mode: 0o644 });
chmodSync(filePath, 0o644);

const written = readFileSync(filePath);
if (!written.equals(Buffer.from(payload, "utf8"))) {
  process.stderr.write(`read-back mismatch at ${filePath}\n`);
  process.exit(1);
}

process.stdout.write(
  `${filePath}\ncharacters: ${facts.characters}\nbytes: ${facts.bytes}\nlines: ${facts.lines}\n`,
);
