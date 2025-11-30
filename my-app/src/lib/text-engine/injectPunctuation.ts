export function injectPunctuation(words: string[]) {
    const punct = [".", ",", "?", "!", ":", ";"];

    return words.map((word, i) => {
        if (Math.random() < 0.15) {
            return word + punct[Math.floor(Math.random() * punct.length)];
        }
        return word;
    });
}
