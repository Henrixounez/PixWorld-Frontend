import { useEffect, useRef } from 'react';
import styled from 'styled-components'

const CHUNK_SIZE = 20;
const PIXEL_SIZE = 50;

class Chunk {
  canvas: HTMLCanvasElement;
  position: {x: number, y: number} = {x: 0, y: 0};

  constructor(pos: { x: number, y: number }) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = CHUNK_SIZE;
    this.canvas.height = CHUNK_SIZE;
    this.position = pos;
  }
  
  loadImage(img: HTMLImageElement) {
    const ctx = this.canvas.getContext('2d');

    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0);
    }
  }
  placePixel(x: number, y: number, color: string) {
    const ctx = this.canvas.getContext('2d');

    if (!ctx)
      return;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  }
}

const Canvas = styled.canvas`
`;

class CanvasController {
  canvas: HTMLCanvasElement;
  position = { x: 0, y: 0, zoom: 1 };
  size = { width: 0, height: 0 };
  isMoving = false;
  isMouseDown = false;
  startMove = { x: 0, y: 0 };
  chunks: Record<string, Chunk> = {};

  constructor() {
    this.size = {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    }
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = this.size.width;
    canvas.height = this.size.height;
    this.canvas = canvas;

    this.loadChunk(0, 0);

    window.addEventListener('resize', this.resize);
    window.addEventListener('mousedown', this.mouseDown);
    window.addEventListener('mousemove', this.mouseMove);
    window.addEventListener('mouseup', this.mouseUp);
    // @ts-ignore
    window.addEventListener('mousewheel', this.zoom);
  }

  destructor() {
    console.log('destructor');
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('mousedown', this.mouseDown);
    window.removeEventListener('mousemove', this.mouseMove);
    window.removeEventListener('mouseup', this.mouseUp);
    // @ts-ignore
    window.removeEventListener('mousewheel', this.zoom);
  }

  // Utils //
  setCanvasSize = () => {
    this.canvas.width = document.documentElement.clientWidth;
    this.canvas.height = document.documentElement.clientHeight
  }
  coordinatesOnCanvas = (targetX: number, targetY: number) => {
    const { zoom, x, y } = this.position;
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    const pixelSize = PIXEL_SIZE / zoom;
    const centerX = (width / 2);
    const centerY = (height / 2);

    const posX = centerX + (x + targetX * pixelSize);
    const posY = centerY  + (y + targetY * pixelSize);

    return { posX, posY };
  }
  canvasToCoordinates = (posX: number, posY: number) => {
    const { zoom, x, y } = this.position;
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    const pixelSize = PIXEL_SIZE / zoom;
    const centerX = (width / 2);
    const centerY = (height / 2);

    const coordX = Math.floor((posX - centerX - x) / pixelSize);
    const coordY = Math.floor((posY - centerY - y) / pixelSize);

    return { coordX, coordY };
  };
  loadChunk = (chunkX: number, chunkY: number) => {
    const img = new Image();
    img.src = '/pixels.png'
    img.onload = () => {
      const chunk = new Chunk({x: chunkX, y: chunkY});
      chunk.loadImage(img);
      this.chunks[`${chunkX}-${chunkY}`] = chunk;
      this.render();
    }
    img.onerror = (e) => {
      console.error(e)
    }
  }
  placePixel = (coordX: number, coordY: number) => {
    const ctx = this.canvas.getContext('2d');

    if (!ctx)
      return;

    const chunkX = Math.floor(coordX / CHUNK_SIZE);
    const chunkY = Math.floor(coordY / CHUNK_SIZE);


    if (this.chunks[`${chunkX}-${chunkY}`]) {
      this.chunks[`${chunkX}-${chunkY}`].placePixel(coordX % CHUNK_SIZE, coordY % CHUNK_SIZE, "#FF0000");
      this.render();
    }
  }


  // Actions //
  resize = () => {
    this.setCanvasSize();
    this.render();
  }
  mouseDown = () => {
    this.isMouseDown = true;
  }
  mouseMove = (e: MouseEvent) => {
    if (this.isMouseDown === true) {
      if (!this.isMoving) {
        this.startMove = {
          x: e.clientX,
          y: e.clientY,
        }
        this.isMoving = true;
      }
      this.position = {
        ...this.position,
        x: this.position.x + (e.clientX - this.startMove.x),
        y: this.position.y + (e.clientY - this.startMove.y),
      }
      this.render();
      this.startMove = {
        x: e.clientX,
        y: e.clientY,
      }
    }
  }
  mouseUp = (e: MouseEvent) => {
    if (this.isMoving === true) {
      this.startMove = { x: 0, y: 0 };
      this.isMoving = false;
    } else {
      const { coordX, coordY } = this.canvasToCoordinates(e.clientX, e.clientY);
      this.placePixel(coordX, coordY);
    }
    this.isMouseDown = false
  }
  zoom = (e: WheelEvent) => {
    const newZoom = this.position.zoom + (e.deltaY / PIXEL_SIZE);
    this.position = {
      ...this.position,
      zoom: newZoom < 1 ? 1 : newZoom,
    };
    this.render();
  }

  // Drawing //
  render = () => {
    const ctx = this.canvas.getContext('2d');
    if (!ctx)
      return;

    ctx.clearRect(0, 0, this.size.width, this.size.height);
    this.drawChunks(ctx);
    this.drawGrid(ctx);
  }
  drawGrid = (ctx: CanvasRenderingContext2D) => {
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    const { zoom, x, y } = this.position;
    const pixelSize = PIXEL_SIZE / zoom;
    const centerH = (width / 2) + x % pixelSize;
    const centerV = (height / 2) + y % pixelSize;
    const linesH = Math.ceil(height / pixelSize) + 2;
    const linesV = Math.ceil(width / pixelSize) + 2;

    if (zoom < 4) {
      for (let i = Math.floor(-linesH / 2); i < Math.ceil(linesH / 2); i++) {
        ctx.strokeStyle = "#000000";
        // if (i === 0)
        //   ctx.strokeStyle = "#FF0000";
        ctx.beginPath();
        const posY = centerV + i * pixelSize;
        ctx.moveTo(0, posY);
        ctx.lineTo(width, posY);
        ctx.stroke();
      }
      for (let i = Math.floor(-linesV / 2); i < Math.ceil(linesV / 2); i++) {
        ctx.strokeStyle = "#000000";
        // if (i === 0)
        //   ctx.strokeStyle = "#FF0000";
        ctx.beginPath();
        const posX = centerH + i * pixelSize;
        ctx.moveTo(posX, 0);
        ctx.lineTo(posX, height);
        ctx.stroke();
      }
    }
  }
  drawChunks = (ctx: CanvasRenderingContext2D) => {
    ctx.imageSmoothingEnabled = false;
    const pixelSize = PIXEL_SIZE / this.position.zoom;
    Object.keys(this.chunks).map((name) => {
      const chunk = this.chunks[name];
      const {posX, posY} = this.coordinatesOnCanvas(0, 0);

      ctx.drawImage(chunk.canvas, posX, posY, chunk.canvas.width * pixelSize, chunk.canvas.height * pixelSize);
    })
  }
}

function CanvasComponent() {
  const canvasRef = useRef<HTMLCanvasElement>();

  useEffect(() => {
    if (canvasRef.current) {
      let controller: CanvasController | null = new CanvasController();
      controller.render();
      return () => {
        controller?.destructor();
        controller = null;
      }
    }
  }, [canvasRef])

  return (
    <Canvas
      // @ts-ignore
      ref={canvasRef}
      id="canvas"
    />
  );
}

export default CanvasComponent;