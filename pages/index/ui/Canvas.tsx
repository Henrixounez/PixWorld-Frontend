import { useEffect, useRef } from 'react';
import { destructCanvasController, initCanvasController } from '../controller/CanvasController';

function CanvasComponent({ pos }: { pos?: { x: number, y: number, zoom: number, canvas: string } }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      initCanvasController(pos);
      return () => {
        destructCanvasController();
      }
    }
  }, [canvasRef, pos]);

  return (
    <canvas
      style={{
        zIndex: -1,
        outline: 'none',
      }}
      ref={canvasRef}
      id="canvas"
      tabIndex={1}
    />
  );
}

export default CanvasComponent;
