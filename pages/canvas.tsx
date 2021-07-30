import { useEffect, useRef } from 'react';
import styled from 'styled-components'

const CHUNK_SIZE = 256;
const PIXEL_SIZE = 50;
const ZOOM_STEP = 16;

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
  shiftPressed = false;
  position = { x: 0, y: 0, zoom: 50 };
  zoomInfos = {mousePosX: 0, mousePosY: 0}
  cursorPosition = { x: 0, y: 0 };
  size = { width: 0, height: 0 };
  isMoving = false;
  isMouseDown = false;
  zoomed = false;
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
    window.addEventListener('wheel', this.zoom);
    window.addEventListener('keypress', this.keypress);
    window.addEventListener('keydown', this.keydown);
    window.addEventListener('keyup', this.keyup);
  }

  destructor() {
    console.log('destructor');
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('mousedown', this.mouseDown);
    window.removeEventListener('mousemove', this.mouseMove);
    window.removeEventListener('mouseup', this.mouseUp);
    window.removeEventListener('wheel', this.zoom);
    window.removeEventListener('keypress', this.keypress);
    window.removeEventListener('keydown', this.keydown);
    window.removeEventListener('keyup', this.keyup);
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

    const posX = centerX + (-x + targetX) * pixelSize;
    const posY = centerY + (-y + targetY) * pixelSize;

    return { posX, posY };
  }
  canvasToCoordinates = (posX: number, posY: number) => {
    const { zoom, x, y } = this.position;
    const width = this.size.width;
    const height = this.size.height;
    const pixelSize = PIXEL_SIZE / zoom;
    const centerX = (width / 2);
    const centerY = (height / 2);

    const coordX = Math.floor((posX - centerX + (x * pixelSize)) / pixelSize);
    const coordY = Math.floor((posY - centerY + (y * pixelSize)) / pixelSize);

    return { coordX, coordY };
  };
  loadChunk = async (chunkX: number, chunkY: number, reload: boolean = false) => {
    if (!reload && this.chunks[`${chunkX};${chunkY}`])
      return;

    const img = new Image();
    await new Promise((resolve) => {
      img.src = '/pixels2.png'
      img.onload = () => {
        const chunk = new Chunk({x: chunkX, y: chunkY});
        chunk.loadImage(img);
        this.chunks[`${chunkX};${chunkY}`] = chunk;
        resolve(true);
      }
      img.onerror = (e) => {
        console.error(e)
        resolve(true);
      }
    })
  }
  loadNeighboringChunks = async () => {
    const width = this.size.width;
    const height = this.size.height;

    const chunkNbX = Math.ceil(width / CHUNK_SIZE) + 2;
    const chunkNbY = Math.ceil(height / CHUNK_SIZE) + 2;
    const chunkLoading = [];
    for (let x = this.position.x - CHUNK_SIZE * (chunkNbX / 2); x < this.position.x + CHUNK_SIZE * (chunkNbX / 2); x+= CHUNK_SIZE) {
      for (let y = this.position.y - CHUNK_SIZE * (chunkNbY / 2); y < this.position.y + CHUNK_SIZE * (chunkNbY / 2); y+= CHUNK_SIZE) {
        chunkLoading.push(this.loadChunk(Math.floor(x / CHUNK_SIZE), Math.floor(y / CHUNK_SIZE)));
      }
    }
    await Promise.all(chunkLoading);
    this.render();
  }
  placePixel = (coordX: number, coordY: number) => {
    const ctx = this.canvas.getContext('2d');

    if (!ctx)
      return;

    const chunkX = Math.floor(coordX / CHUNK_SIZE);
    const chunkY = Math.floor(coordY / CHUNK_SIZE);

    if (this.chunks[`${chunkX};${chunkY}`]) {
      const px = (coordX > 0 ? coordX : CHUNK_SIZE + coordX ) % CHUNK_SIZE;
      const py = (coordY > 0 ? coordY : CHUNK_SIZE + coordY ) % CHUNK_SIZE;
      this.chunks[`${chunkX};${chunkY}`].placePixel(px, py, "#FF0000");
      this.render();
    }
  }
  changeZoom = (delta: number, _focalX: number, _focalY: number) => {

    const zoomIn = delta < 0;
    console.log(zoomIn);
    const deltaX = _focalX - this.canvas.width / 2;

    if (this.position.zoom != 1 && zoomIn) {
      this.changePosition((_focalX - this.canvas.width / 2) / (PIXEL_SIZE / this.position.zoom) / (1 + 0.6 * (this.position.zoom/50)), (_focalY - this.canvas.height / 2) / (PIXEL_SIZE / this.position.zoom) / (1 + 0.6 * (this.position.zoom/50)));
    }

    this.zoomInfos.mousePosX = ((this.canvas.width / 2 - _focalX) / (PIXEL_SIZE / this.position.zoom)) / 2;
    this.zoomInfos.mousePosY = ((this.canvas.height / 2 - _focalY) / (PIXEL_SIZE / this.position.zoom)) / 2;
    const newZoom = this.position.zoom + delta;
    this.position.zoom = newZoom < 1 ? 1 : newZoom > 50 ? 50 : newZoom;

    this.zoomed = true;

    this.render();
  }
  changePosition = (deltaX: number, deltaY: number, rend = true) => {
    this.position.x += deltaX;
    this.position.y += deltaY;
    this.loadNeighboringChunks();
    if(rend) {
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
      const pixelSize = PIXEL_SIZE / this.position.zoom;
      this.changePosition((this.startMove.x - e.clientX) / pixelSize, (this.startMove.y - e.clientY) / pixelSize);
      this.startMove = {
        x: e.clientX,
        y: e.clientY,
      }
    } else {
      this.cursorPosition = {
        x: e.clientX,
        y: e.clientY
      };
      if (this.shiftPressed === true) {
        const { coordX, coordY } = this.canvasToCoordinates(this.cursorPosition.x, this.cursorPosition.y);
        this.placePixel(coordX, coordY);
      } else {
        this.render();
      }
    }
  }
  mouseUp = (e: MouseEvent) => {
    if (this.isMoving === true) {
      this.startMove = { x: 0, y: 0 };
      this.isMoving = false;
    } else {
      const { coordX, coordY } = this.canvasToCoordinates(e.pageX, e.pageY);
      this.placePixel(coordX, coordY);
    }
    this.isMouseDown = false
  }
  zoom = (e: WheelEvent) => {
    const { coordX, coordY } = this.canvasToCoordinates(e.clientX, e.clientY);
    this.changeZoom(e.deltaY / ZOOM_STEP, e.clientX, e.clientY);
  }
  keydown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        this.changePosition(0, -4 * this.position.zoom);
        break;
      case 'ArrowDown':
        this.changePosition(0, 4 * this.position.zoom);
        break;
      case 'ArrowLeft':
        this.changePosition(-4 * this.position.zoom, 0);
        break;
      case 'ArrowRight':
        this.changePosition(4 * this.position.zoom, 0);
        break;
      case 'Shift':
        this.shiftPressed = true;
        const { coordX, coordY } = this.canvasToCoordinates(this.cursorPosition.x, this.cursorPosition.y);
        this.placePixel(coordX, coordY);
        break;
      default:
        console.log('[KeyDown]', e.key);
    }
  }
  keypress = (e: KeyboardEvent) => {
    console.log('keypress', e);
    switch (e.key) {
      case 'e':
        this.changeZoom(-this.position.zoom * 0.5, this.position.x, this.position.y);
        break;
      case 'a':
        this.changeZoom(this.position.zoom, this.position.x, this.position.y);
        break;
      case 'ArrowUp':
        this.changePosition(0, -4 * this.position.zoom);
        break;
      case 'ArrowDown':
        this.changePosition(0, 4 * this.position.zoom);
        break;
      case 'ArrowLeft':
        this.changePosition(-4 * this.position.zoom, 0);
        break;
      case 'ArrowRight':
        this.changePosition(4 * this.position.zoom, 0);
        break;
      default:
        console.log('[KeyPress]', e.key);
    }
  }
  keyup = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Shift':
        this.shiftPressed = false;
      default:
        console.log('[KeyUp]', e.key);
    }
  }
  // Drawing //
  render = () => {
    const ctx = this.canvas.getContext('2d');
    if (!ctx)
      return;

    ctx.clearRect(0, 0, this.size.width, this.size.height);
    this.drawChunks(ctx);
    //this.drawGrid(ctx);

    if (this.zoomed) {
      this.zoomed = false;
      if (this.position.zoom != 1 && this.position.zoom != PIXEL_SIZE) {
        this.changePosition(this.zoomInfos.mousePosX, this.zoomInfos.mousePosY);
      }
    }
  }
  drawGrid = (ctx: CanvasRenderingContext2D) => {
    if (this.position.zoom > 4) {
      return;
    }

    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    const pixelSize = PIXEL_SIZE / this.position.zoom;
    const centerH = (width / 2) - this.position.x * pixelSize % pixelSize;
    const centerV = (height / 2) - this.position.y * pixelSize % pixelSize;
    const linesH = Math.ceil(height / pixelSize) + 2;
    const linesV = Math.ceil(width / pixelSize) + 2;

    for (let i = Math.floor(-linesH / 2); i < Math.ceil(linesH / 2); i++) {
      ctx.strokeStyle = "#000000";
      ctx.beginPath();
      const posY = centerV + i * pixelSize;
      ctx.moveTo(0, posY);
      ctx.lineTo(width, posY);
      ctx.stroke();
    }
    for (let i = Math.floor(-linesV / 2); i < Math.ceil(linesV / 2); i++) {
      ctx.strokeStyle = "#000000";
      ctx.beginPath();
      const posX = centerH + i * pixelSize;
      ctx.moveTo(posX, 0);
      ctx.lineTo(posX, height);
      ctx.stroke();
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
    <>
      <Canvas
        // @ts-ignore
        ref={canvasRef}
        id="canvas"
      />
    </>
  );
}

export default CanvasComponent;