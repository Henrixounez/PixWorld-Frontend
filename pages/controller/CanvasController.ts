import { API_URL } from "../constants/api";
import { CHUNK_SIZE, PIXEL_SIZE } from "../constants/painting";

import InteractionController from "./InteractionController";
import ConnectionController from "./ConnectionController";
import Chunk from "./Chunk";

export class CanvasController {
  canvas: HTMLCanvasElement;
  position = { x: 0, y: 0, zoom: 50 };
  size = { width: 0, height: 0 };
  chunks: Record<string, Chunk> = {};
  boundingChunks = [[0, 0], [0, 0]];

  interactionController: InteractionController;
  connectionController: ConnectionController;

  constructor() {
    this.size = {
      width: window.innerWidth,
      height: window.innerHeight,
    }
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = this.size.width;
    canvas.height = this.size.height;
    this.canvas = canvas;

    this.interactionController = new InteractionController(this);
    this.connectionController = new ConnectionController(this);
    this.loadNeighboringChunks();
  }

  destructor() {
    console.log('destructor');
    this.interactionController.destructor();
  }

  // Utils //
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
    const boundingTL = this.boundingChunks[0];
    const boundingBR = this.boundingChunks[1];

    if (chunkX < boundingTL[0] || chunkY < boundingTL[1] || chunkX > boundingBR[0] || chunkY > boundingBR[1])
      return;
    if (!reload && this.chunks[`${chunkX};${chunkY}`])
      return;

    const img = new Image();
    try {
      await new Promise((resolve) => {
        img.onerror = () => {
          resolve(true);
        }
        img.src = `${API_URL}/chunk/${chunkX}/${chunkY}`;
        img.onload = () => {
          const chunk = new Chunk({x: chunkX, y: chunkY});
          chunk.loadImage(img);
          this.chunks[`${chunkX};${chunkY}`] = chunk;
          this.render();
          resolve(true);
        }
      })
    } catch (e) {}
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
  placePixel = (coordX: number, coordY: number, color: string, send = true) => {
    const ctx = this.canvas.getContext('2d');

    if (!ctx)
      return;

    const chunkX = Math.floor(coordX / CHUNK_SIZE);
    const chunkY = Math.floor(coordY / CHUNK_SIZE);

    if (this.chunks[`${chunkX};${chunkY}`]) {
      let px = coordX % CHUNK_SIZE;
      let py = coordY % CHUNK_SIZE;
      px = px >= 0 ? px : CHUNK_SIZE + px;
      py = py >= 0 ? py : CHUNK_SIZE + py;
      const chunk = this.chunks[`${chunkX};${chunkY}`];

      if (chunk.getColorAt(px, py) !== color) {
        this.chunks[`${chunkX};${chunkY}`].placePixel(px, py, color);
        if (send)
          this.connectionController.sendToWs('placePixel', { x: coordX, y: coordY, color });
        this.render();
      }
    }
  }
  changeZoom = (delta: number, focalX: number, focalY: number) => {
    const oldZoom = this.position.zoom;
    const newZoom = this.position.zoom + delta;

    if (newZoom > 1 && newZoom < 50) {
      const changeInZoom = (oldZoom - newZoom) / 15;
      this.position.zoom = newZoom;
      const translateX = (focalX - this.position.x) * changeInZoom;
      const transtateY = (focalY - this.position.y) * changeInZoom;
      this.position.x += translateX;
      this.position.y += transtateY;
      this.render();
    }
  }
  changePosition = (deltaX: number, deltaY: number) => {
    this.position.x += deltaX;
    this.position.y += deltaY;
    this.loadNeighboringChunks();
  }
  getColorOnCoordinates(coordX: number, coordY: number) {
    const chunkX = Math.floor(coordX / CHUNK_SIZE);
    const chunkY = Math.floor(coordY / CHUNK_SIZE);

    if (this.chunks[`${chunkX};${chunkY}`]) {
      let px = coordX % CHUNK_SIZE;
      let py = coordY % CHUNK_SIZE;
      px = px >= 0 ? px : CHUNK_SIZE + px;
      py = py >= 0 ? py : CHUNK_SIZE + py;
      const chunk = this.chunks[`${chunkX};${chunkY}`];
      return chunk.getColorAt(px, py);
    } else {
      return "#000000";
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
    if (this.position.zoom > 4) {
      return;
    }

    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    const pixelSize = PIXEL_SIZE / this.position.zoom;
    const centerCoord = { x: Math.round(this.position.x), y: Math.round(this.position.y) };
    const centerPoint = this.coordinatesOnCanvas(centerCoord.x, centerCoord.y);
    const linesH = Math.ceil(height / pixelSize) + 2;
    const linesV = Math.ceil(width / pixelSize) + 2;

    ctx.strokeStyle = "#2222227E";
    for (let i = centerCoord.y - linesH; i < centerCoord.y + linesH; i++) {
      ctx.lineWidth = i % 10 === 0 ? 2 : 1;
      ctx.beginPath();
      const posY = centerPoint.posY + (i - centerCoord.y) * pixelSize;
      ctx.moveTo(0, posY);
      ctx.lineTo(width, posY);
      ctx.stroke();
    }
    for (let i = centerCoord.x - linesV; i < centerCoord.x + linesV; i++) {
      ctx.lineWidth = i % 10 === 0 ? 2 : 1;
      ctx.beginPath();
      const posX = centerPoint.posX + (i - centerCoord.x) * pixelSize;
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
    });
  }
}
let canvasController: CanvasController | null = null;

export function initCanvasController() {
  canvasController = new CanvasController();
  canvasController.render();
}
export function destructCanvasController() {
  canvasController?.destructor();
  canvasController = null;
}

export default canvasController;