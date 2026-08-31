const independentVowels: Record<string, string> = {
  अ: "a",
  आ: "aa",
  इ: "i",
  ई: "ii",
  उ: "u",
  ऊ: "uu",
  ऋ: "ri",
  ए: "e",
  ऐ: "ai",
  ओ: "o",
  औ: "au",
};

const vowelMarks: Record<string, string> = {
  "ा": "aa",
  "ि": "i",
  "ी": "ii",
  "ु": "u",
  "ू": "uu",
  "ृ": "ri",
  "े": "e",
  "ै": "ai",
  "ो": "o",
  "ौ": "au",
};

const consonants: Record<string, string> = {
  क: "k",
  ख: "kh",
  ग: "g",
  घ: "gh",
  ङ: "ng",
  च: "ch",
  छ: "chh",
  ज: "j",
  झ: "jh",
  ञ: "ny",
  ट: "t",
  ठ: "th",
  ड: "d",
  ढ: "dh",
  ण: "n",
  त: "t",
  थ: "th",
  द: "d",
  ध: "dh",
  न: "n",
  प: "p",
  फ: "ph",
  ब: "b",
  भ: "bh",
  म: "m",
  य: "y",
  र: "r",
  ल: "l",
  व: "v",
  श: "sh",
  ष: "sh",
  स: "s",
  ह: "h",
};

const marks: Record<string, string> = {
  "ं": "n",
  "ँ": "n",
  "ः": "h",
};

function transliterateDevanagari(value: string): string {
  let output = "";

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index] ?? "";
    const next = value[index + 1] ?? "";

    if (independentVowels[char]) {
      output += independentVowels[char];
      continue;
    }

    if (consonants[char]) {
      if (next === "्") {
        output += consonants[char];
        index += 1;
        continue;
      }

      if (vowelMarks[next]) {
        output += consonants[char] + vowelMarks[next];
        index += 1;
        continue;
      }

      output += consonants[char] + "a";
      continue;
    }

    if (marks[char]) {
      output += marks[char];
      continue;
    }

    output += char;
  }

  return output;
}

function normalizeToAscii(value: string): string {
  return transliterateDevanagari(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function slugify(value: string): string {
  return normalizeToAscii(value)
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function createFallbackSlug(prefix = "news"): string {
  const safePrefix = slugify(prefix) || "news";
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 8);

  return `${safePrefix}-${date}-${random}`;
}

export function slugifyOrFallback(value: string, prefix = "news"): string {
  return slugify(value) || createFallbackSlug(prefix);
}
