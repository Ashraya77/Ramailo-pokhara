import type React from "react";

const romanWordPattern = /[A-Za-z]/;

const romanWordOverrides: Record<string, string> = {
  pokhara: "पोखरा",
  samachar: "समाचार",
  nepal: "नेपाल",
  rajniti: "राजनीति",
  khelkud: "खेलकुद",
  prabidhi: "प्रविधि",
  pravidhi: "प्रविधि",
  manoranjan: "मनोरञ्जन",
  paryatan: "पर्यटन",
  ramailo: "रमाइलो",
};

const dependentVowels = [
  ["aai", "ाइ"],
  ["aa", "ा"],
  ["ii", "ी"],
  ["ee", "ी"],
  ["uu", "ू"],
  ["oo", "ू"],
  ["ai", "ै"],
  ["au", "ौ"],
  ["ri", "ृ"],
  ["a", ""],
  ["i", "ि"],
  ["u", "ु"],
  ["e", "े"],
  ["o", "ो"],
] as const;

const independentVowels = [
  ["aai", "आई"],
  ["aa", "आ"],
  ["ii", "ई"],
  ["ee", "ई"],
  ["uu", "ऊ"],
  ["oo", "ऊ"],
  ["ai", "ऐ"],
  ["au", "औ"],
  ["ri", "ऋ"],
  ["a", "अ"],
  ["i", "इ"],
  ["u", "उ"],
  ["e", "ए"],
  ["o", "ओ"],
] as const;

const consonants = [
  ["ksh", "क्ष"],
  ["chh", "छ"],
  ["kh", "ख"],
  ["gh", "घ"],
  ["jh", "झ"],
  ["th", "थ"],
  ["dh", "ध"],
  ["ph", "फ"],
  ["bh", "भ"],
  ["sh", "श"],
  ["ng", "ङ"],
  ["ny", "ञ"],
  ["ch", "च"],
  ["gy", "ज्ञ"],
  ["tr", "त्र"],
  ["gn", "ग्न"],
  ["k", "क"],
  ["g", "ग"],
  ["c", "क"],
  ["j", "ज"],
  ["t", "त"],
  ["d", "द"],
  ["n", "न"],
  ["p", "प"],
  ["b", "ब"],
  ["m", "म"],
  ["y", "य"],
  ["r", "र"],
  ["l", "ल"],
  ["v", "व"],
  ["w", "व"],
  ["s", "स"],
  ["h", "ह"],
  ["f", "फ"],
  ["q", "क"],
  ["x", "क्स"],
  ["z", "ज"],
] as const;

function matchPattern(
  value: string,
  start: number,
  patterns: readonly (readonly [string, string])[],
): readonly [string, string] | null {
  for (const pattern of patterns) {
    if (value.startsWith(pattern[0], start)) {
      return pattern;
    }
  }

  return null;
}

export function transliterateRomanWordToNepali(value: string): string {
  const normalized = value.toLowerCase();

  if (romanWordOverrides[normalized]) {
    return romanWordOverrides[normalized];
  }

  let index = 0;
  let output = "";
  let transformed = false;

  while (index < normalized.length) {
    const char = normalized[index];

    if (!char || !romanWordPattern.test(char)) {
      output += value[index] ?? "";
      index += 1;
      continue;
    }

    const consonant = matchPattern(normalized, index, consonants);

    if (consonant) {
      index += consonant[0].length;
      const vowel = matchPattern(normalized, index, dependentVowels);

      if (vowel) {
        output += consonant[1] + vowel[1];
        index += vowel[0].length;
      } else {
        output += consonant[1];
      }

      transformed = true;
      continue;
    }

    const vowel = matchPattern(normalized, index, independentVowels);

    if (vowel) {
      output += vowel[1];
      index += vowel[0].length;
      transformed = true;
      continue;
    }

    output += value[index] ?? "";
    index += 1;
  }

  return transformed ? output : value;
}

function findRomanWordStart(value: string, end: number): number {
  let start = end;

  while (start > 0 && romanWordPattern.test(value[start - 1] ?? "")) {
    start -= 1;
  }

  return start;
}

export function transliterateTrailingRomanWord(
  value: string,
  end = value.length,
): { start: number; end: number; replacement: string } | null {
  const start = findRomanWordStart(value, end);
  const token = value.slice(start, end);

  if (!token || !romanWordPattern.test(token)) {
    return null;
  }

  const replacement = transliterateRomanWordToNepali(token);

  if (replacement === token) {
    return null;
  }

  return { start, end, replacement };
}

function replaceNativeInputText(
  element: HTMLInputElement | HTMLTextAreaElement,
  start: number,
  end: number,
  replacement: string,
) {
  const nextValue = `${element.value.slice(0, start)}${replacement}${element.value.slice(end)}`;
  const nextCursor = start + replacement.length;

  element.value = nextValue;
  element.setSelectionRange(nextCursor, nextCursor);
  element.dispatchEvent(new Event("input", { bubbles: true }));
}

function isCommitKey(key: string): boolean {
  return key === " " || /^[,.;:!?)]$/.test(key);
}

export function handleNepaliInputCommit(
  event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  enabled: boolean,
) {
  if (
    !enabled ||
    event.nativeEvent.isComposing ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    !isCommitKey(event.key)
  ) {
    return;
  }

  const element = event.currentTarget;

  if (
    element.selectionStart === null ||
    element.selectionEnd === null ||
    element.selectionStart !== element.selectionEnd
  ) {
    return;
  }

  const match = transliterateTrailingRomanWord(
    element.value,
    element.selectionStart,
  );

  if (!match) {
    return;
  }

  event.preventDefault();
  replaceNativeInputText(
    element,
    match.start,
    match.end,
    `${match.replacement}${event.key}`,
  );
}

export function handleNepaliInputBlur(
  event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  enabled: boolean,
) {
  if (!enabled) {
    return;
  }

  const element = event.currentTarget;
  const match = transliterateTrailingRomanWord(element.value);

  if (!match) {
    return;
  }

  replaceNativeInputText(element, match.start, match.end, match.replacement);
}
