import { useLayoutEffect, useState, type RefObject } from 'react';

export interface AnchoredPosition {
  top: number;
  left: number;
  width: number;
  above: boolean;
}

/**
 * Where to place a dropdown panel under (or above, when there is no room) an anchor element.
 * Used with a portal so scrolling or overflow-hidden parents cannot clip the panel.
 */
export function useAnchoredPosition(open: boolean, anchor: RefObject<HTMLElement | null>, minWidth = 240) {
  const [pos, setPos] = useState<AnchoredPosition | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    const place = () => {
      const rect = anchor.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.max(rect.width, minWidth);
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
      const above = window.innerHeight - rect.bottom < 280 && rect.top > 280;
      setPos({ top: above ? rect.top - 4 : rect.bottom + 4, left, width, above });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, anchor, minWidth]);

  return pos;
}

/** CSS for a fixed-position panel at the computed spot */
export function anchoredStyle(pos: AnchoredPosition): React.CSSProperties {
  return {
    position: 'fixed',
    left: pos.left,
    width: pos.width,
    ...(pos.above ? { bottom: window.innerHeight - pos.top } : { top: pos.top }),
  };
}
