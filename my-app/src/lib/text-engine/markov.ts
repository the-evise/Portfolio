export function markovGenerate(wordCount: number): string[] {
    // You can expand this by building Markov chains over your wordlist.
    // For now, simple approximation:

    const result: string[] = [];
    const starters = ["the", "a", "this", "that", "when", "where", "how"];

    let current = starters[Math.floor(Math.random() * starters.length)];

    for (let i = 0; i < wordCount; i++) {
        result.push(current);

        // fake Markov: mutate last word
        current = mutateWordLikeMarkov(current);
    }

    return result;
}

function mutateWordLikeMarkov(w: string): string {
    const rnd = Math.random();
    if (rnd < 0.33) return w + "ing";
    if (rnd < 0.66) return w.slice(0, 2) + "er";
    return w.slice(0, 3) + "ed";
}
