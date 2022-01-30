import { useEffect, useRef } from 'react';
import { destructCanvasController, initCanvasController } from '../controller/CanvasController';

function CanvasComponent({ wsHash, pos }: { wsHash: string, pos?: { x: number, y: number, zoom: number, canvas: string } }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      initCanvasController(wsHash, pos);
      return () => {
        destructCanvasController();
      }
    }
  }, [canvasRef]);

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
