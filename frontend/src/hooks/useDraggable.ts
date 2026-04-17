import { useRef, useState, useCallback } from 'react';

interface Position { x: number; y: number }

/**
 * Returns a ref to attach to the drag handle element and the current
 * CSS top/left position. Initial position is calculated lazily on first drag.
 */
export function useDraggable(initialX: number, initialY: number) {
  const [pos, setPos] = useState<Position>({ x: initialX, y: initialY });
  const dragging = useRef(false);
  const offset = useRef<Position>({ x: 0, y: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    // Only drag on primary button; ignore clicks on buttons inside the panel
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    dragging.current = true;
    offset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    e.preventDefault();

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 260, ev.clientX - offset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 80, ev.clientY - offset.current.y)),
      });
    };

    const onUp = () => {
      dragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [pos]);

  return { pos, onMouseDown };
}
