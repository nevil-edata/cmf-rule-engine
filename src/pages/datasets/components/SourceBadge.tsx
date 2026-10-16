interface SourceBadgeProps {
  text: string;
}

export default function SourceBadge({ text }: SourceBadgeProps) {
  return (
    <span className="inline-flex items-center border border-input text-muted-foreground text-xs px-2 py-0.5 rounded">
      {text}
    </span>
  );
}
