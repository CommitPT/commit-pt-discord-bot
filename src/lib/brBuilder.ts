type BrPart = string | number | null | undefined | false | readonly BrPart[];

function flatten(parts: readonly BrPart[]): string[] {
  const result: string[] = [];

  for (const part of parts) {
    if (!part) continue;

    if (Array.isArray(part)) {
      result.push(...flatten(part));
      continue;
    }

    const text = String(part).trim();
    if (text) result.push(text);
  }

  return result;
}

export function brBuilder(...parts: readonly BrPart[]): string {
  return flatten(parts).join('\n');
}
