import { KeyboardEvent, useEffect, useRef } from 'react';
import styled from 'styled-components'

const CHUNK_SIZE = 256;
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

    this.loadNeighboringChunks();
    window.addEventListener('resize', this.resize);
    window.addEventListener('mousedown', this.mouseDown);
    window.addEventListener('mousemove', this.mouseMove);
    window.addEventListener('mouseup', this.mouseUp);
    // @ts-ignore
    window.addEventListener('mousewheel', this.zoom);
    // @ts-ignore
    window.addEventListener('keydown', this.keydown);
  }

  destructor() {
    console.log('destructor');
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('mousedown', this.mouseDown);
    window.removeEventListener('mousemove', this.mouseMove);
    window.removeEventListener('mouseup', this.mouseUp);
    // @ts-ignore
    window.removeEventListener('mousewheel', this.zoom);
    // @ts-ignore
    window.removeEventListener('keydown', this.keydown);
  }

  // Utils //
  setCanvasSize = () => {
    this.size = {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    };
    this.canvas.width = this.size.width;
    this.canvas.height = this.size.height;
  }
  coordinatesOnCanvas = (targetX: number, targetY: number) => {
    const { zoom, x, y } = this.position;
    const width = this.size.width;
    const height = this.size.height;
    const pixelSize = PIXEL_SIZE / zoom;
    const centerX = (width / 2);
    const centerY = (height / 2);

    const posX = centerX + (x + targetX * pixelSize);
    const posY = centerY  + (y + targetY * pixelSize);

    return { posX, posY };
  }
  canvasToCoordinates = (posX: number, posY: number) => {
    const { zoom, x, y } = this.position;
    const width = this.size.width;
    const height = this.size.height;
    const pixelSize = PIXEL_SIZE / zoom;
    const centerX = (width / 2);
    const centerY = (height / 2);

    const coordX = Math.floor((posX - centerX - x) / pixelSize);
    const coordY = Math.floor((posY - centerY - y) / pixelSize);

    return { coordX, coordY };
  };
  loadChunk = (chunkX: number, chunkY: number, reload: boolean = false) => {
    if (!reload && this.chunks[`${chunkX};${chunkY}`])
      return;

    const img = new Image();
    img.src = '/pixels2.png'
    img.onload = () => {
      const chunk = new Chunk({x: chunkX, y: chunkY});
      chunk.loadImage(img);
      this.chunks[`${chunkX};${chunkY}`] = chunk;
      this.render();
    }
    img.onerror = (e) => {
      console.error(e)
    }
  }
  loadNeighboringChunks = () => {
    const width = this.size.width;
    const height = this.size.height;
    const centerX = (width / 2);
    const centerY = (height / 2);

    const { coordX, coordY } = this.canvasToCoordinates(centerX, centerY);

    const chunkNbX = Math.ceil(width / CHUNK_SIZE) + 2;
    const chunkNbY = Math.ceil(height / CHUNK_SIZE) + 2;
    for (let x = coordX - CHUNK_SIZE * (chunkNbX / 2); x < coordX + CHUNK_SIZE * (chunkNbX / 2); x+= CHUNK_SIZE) {
      for (let y = coordY - CHUNK_SIZE * (chunkNbY / 2); y < coordY + CHUNK_SIZE * (chunkNbY / 2); y+= CHUNK_SIZE) {
          this.loadChunk(Math.floor(x / CHUNK_SIZE), Math.floor(y / CHUNK_SIZE));
      }
    }
  }
  placePixel = (coordX: number, coordY: number) => {
    const ctx = this.canvas.getContext('2d');

    if (!ctx)
      return;

      console.log(coordX, coordY);
    const chunkX = Math.floor(coordX / CHUNK_SIZE);
    const chunkY = Math.floor(coordY / CHUNK_SIZE);

    if (this.chunks[`${chunkX};${chunkY}`]) {
      const px = (coordX > 0 ? coordX : CHUNK_SIZE + coordX ) % CHUNK_SIZE;
      const py = (coordY > 0 ? coordY : CHUNK_SIZE + coordY ) % CHUNK_SIZE;
      this.chunks[`${chunkX};${chunkY}`].placePixel(px, py, "#FF0000");
      this.render();
    }
  }
  changeZoom = (delta: number) => {
    const newZoom = this.position.zoom + (delta / PIXEL_SIZE);
    this.position = {
      ...this.position,
      zoom: newZoom < 1 ? 1 : newZoom > 50 ? 50 : newZoom,
    };
    this.loadNeighboringChunks();
    this.render();
  }
  changePosition = (deltaX: number, deltaY: number) => {
    this.position.x += deltaX;
    this.position.y += deltaY;
    this.loadNeighboringChunks();
    this.render();
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
      this.changePosition(e.clientX - this.startMove.x, e.clientY - this.startMove.y);
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
    this.changeZoom(e.deltaY);
  }
  keydown = (e: KeyboardEvent) => {
    console.log(e.key);
    switch (e.key) {
      case 'e':
        this.changeZoom(-this.position.zoom * 2);
        break;
      case 'a':
        this.changeZoom(this.position.zoom * 2);
        break;
      case 'ArrowUp':
        this.changePosition(0, 4 * PIXEL_SIZE);
        break;
      case 'ArrowDown':
        this.changePosition(0, -4 * PIXEL_SIZE);
        break;
      case 'ArrowLeft':
        this.changePosition(4 * PIXEL_SIZE, 0);
        break;
      case 'ArrowRight':
        this.changePosition(-4 * PIXEL_SIZE, 0);
        break;
    }
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
      const { posX, posY } = this.coordinatesOnCanvas(chunk.position.x * CHUNK_SIZE, chunk.position.y * CHUNK_SIZE);

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