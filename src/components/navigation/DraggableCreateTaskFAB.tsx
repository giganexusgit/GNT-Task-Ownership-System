import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface DraggableCreateTaskFABProps {
  onClick: () => void;
}

export const DraggableCreateTaskFAB: React.FC<DraggableCreateTaskFABProps> = ({ onClick }) => {
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);

  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
  });

  const hasMovedRef = useRef(false);
  const autoSnapTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (autoSnapTimerRef.current) {
        clearTimeout(autoSnapTimerRef.current);
      }
    };
  }, []);

  const scheduleSnapBack = () => {
    if (autoSnapTimerRef.current) {
      clearTimeout(autoSnapTimerRef.current);
    }
    // After 3.5 seconds of inactivity, smoothly snap back to bottom-right (0, 0)
    autoSnapTimerRef.current = setTimeout(() => {
      setIsSnapping(true);
      setPosition({ x: 0, y: 0 });
      // Reset snapping flag after animation completes
      setTimeout(() => {
        setIsSnapping(false);
      }, 500);
    }, 3500);
  };

  const handlePointerDown = (clientX: number, clientY: number) => {
    if (autoSnapTimerRef.current) {
      clearTimeout(autoSnapTimerRef.current);
    }
    setIsSnapping(false);
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const deltaX = clientX - dragStartRef.current.startX;
    const deltaY = clientY - dragStartRef.current.startY;

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasMovedRef.current = true;
    }

    setPosition({
      x: dragStartRef.current.posX + deltaX,
      y: dragStartRef.current.posY + deltaY,
    });
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (!hasMovedRef.current) {
      // Tap detected -> trigger onClick action
      onClick();
    } else {
      // Drag completed -> schedule auto-snap back
      scheduleSnapBack();
    }
  };

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handlePointerDown(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handlePointerMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handlePointerUp();
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handlePointerDown(e.clientX, e.clientY);

    const onMouseMove = (moveEvt: MouseEvent) => {
      handlePointerMove(moveEvt.clientX, moveEvt.clientY);
    };

    const onMouseUp = () => {
      handlePointerUp();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
      className={`fixed bottom-6 right-6 z-40 md:hidden ${
        isSnapping || !isDragging ? 'transition-transform duration-500 ease-out' : 'transition-none'
      }`}
    >
      <button
        type="button"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-xl shadow-blue-600/40 border border-blue-400/40 flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none"
        aria-label="Create New Task"
        title="Create Task (Drag to move, auto-snaps back)"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </div>
  );
};
