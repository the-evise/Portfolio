// components/Emoji.tsx
interface EmojiProps {
    name: string;
    className?: string;
}

const EMOJI_MAP: Record<string, string> = {
    whale: "🐋",
    palette: "🎨",
    alien: "👾",
    crystal: "🔮",
    pumpkin: "🎃",
};

export default function Emoji({ name, className }: EmojiProps) {
    return (
        <span className={className}>
      {EMOJI_MAP[name] ?? "❓"}
    </span>
    );
}
