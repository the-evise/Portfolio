export function injectNumbers(words: string[]) {
    return words.map((word) => {
        if (Math.random() < 0.2) {
            return Math.floor(Math.random() * 9999).toString();
        }
        return word;
    });
}
