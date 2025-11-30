import { baseWords } from "./wordlist";
import { injectPunctuation } from "./injectPunctuation";
import { injectNumbers } from "./injectNumbers";
import { shuffle } from "./shuffle";
import { markovGenerate } from "./markov";

interface GenerateTextOptions {
    mode: "time" | "words" | "quote";
    count: number;
    punctuation: boolean;
    numbers: boolean;
    difficulty?: "easy" | "medium" | "hard";
}

export function generateText({
                                 mode,
                                 count,
                                 punctuation,
                                 numbers,
                                 difficulty = "easy",
                             }: GenerateTextOptions) {

    // 1) Pick strategy based on mode
    let rawWords: string[] = [];

    if (mode === "quote") {
        rawWords = markovGenerate(count);    // quotes need flow
    }
    else {
        rawWords = shuffle(baseWords).slice(0, count);
    }

    // 2) Difficulty scaling
    if (difficulty === "medium") {
        rawWords = rawWords.map(w => w.length > 5 ? w : w + w);
    }

    if (difficulty === "hard") {
        rawWords = rawWords.map(w => w + w);
    }

    // 3) Optional transformations
    if (punctuation) rawWords = injectPunctuation(rawWords);
    if (numbers) rawWords = injectNumbers(rawWords);

    // 4) Output
    return rawWords.join(" ");
}
