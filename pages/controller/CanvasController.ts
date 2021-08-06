import { API_URL } from "../constants/api";
import { CHUNK_SIZE, PIXEL_SIZE } from "../constants/painting";
import { Unsubscribe } from "redux";

import Chunk from "./Chunk";
import InteractionController from "./InteractionController";
import ConnectionController from "./ConnectionController";
import OverlayController from "./OverlayController";
import SoundController, { AudioType } from "./SoundController";
import { store } from "../../store";
import { SET_ACTIVITY, SET_CANVAS, SET_DARK_MODE, SET_GRID_ACTIVE, SET_NOTIFICATIONS, SET_SHOW_CHAT, SET_SOUNDS, SET_ZOOM_TOWARD_CURSOR } from "../../store/actions/parameters";
import { SET_POSITION, SET_SHOULD_LOAD_CHUNKS, SET_SHOULD_RENDER } from "../../store/actions/painting";
import { SET_OVERLAY_ACTIVATE, SET_OVERLAY_OPEN } from "../../store/actions/overlay";

const ACTIVITY_DURATION_MS = 1000;
const ACTIVITY_REFRESH_MS = 25;
const ACTIVITY_MAX_RADIUS = 10;
const ACTIVITY_FRAME_NB = ACTIVITY_DURATION_MS / ACTIVITY_REFRESH_MS;

export class CanvasController {
  canvas: HTMLCanvasElement;
  size = { width: 0, height: 0 };
  chunks: Record<string, Chunk> = {};
  historyChunks: Record<string, Chunk> = {};
  canvases: Array<{ name: string, id: string, boundingChunks: [[number, number], [number, number]], locked: boolean }> = [];
  waitingPixels: Record<string, string> = {};
  pixelActivity: { x: number, y: number, frame: number}[] = [];
  activityInterval: NodeJS.Timeout;
  unsubscribe: Unsubscribe;

  interactionController: InteractionController;
  connectionController: ConnectionController;
  overlayController: OverlayController;
  soundController: SoundController;

  constructor(wsHash: string) {
    this.size = {
      width: window.innerWidth,
      height: window.innerHeight,
    }
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = this.size.width;
    canvas.height = this.size.height;
    this.canvas = canvas;
    this.canvas.focus();

    this.interactionController = new InteractionController(this);
    this.connectionController = new ConnectionController(this, wsHash);
    this.overlayController = new OverlayController(this);
    this.soundController = new SoundController(this);
    this.loadFromLocalStorage();

    this.unsubscribe = store!.subscribe(() => {
      if (store) {
        const state = store.getState();
        if (state.shouldLoadChunks)
          this.loadNeighboringChunks();
        if (state.shouldRender) {
          this.render();
        }
      }
    });

    this.activityInterval = setInterval(() => {
      if (this.pixelActivity.length && store?.getState().activity && !store.getState().history.activate) {
        store?.dispatch({ type: SET_SHOULD_RENDER, payload: true });
      } else if (this.pixelActivity.length) {
        this.pixelActivity = [];
        store?.dispatch({ type: SET_SHOULD_RENDER, payload: true });
      }
    }, ACTIVITY_REFRESH_MS);
  }

  destructor() {
    this.interactionController.destructor();
    this.connectionController.destructor();
    this.overlayController.destructor();
    clearInterval(this.activityInterval);
    this.unsubscribe();
  }

  get position() {
    return store?.getState().position!;
  }

  get currentChunks() {
    return store?.getState().history.activate ? this.historyChunks : this.chunks;
  }

  get currentCanvasId() {
    return store!.getState().currentCanvas;
  }
  get currentCanvasIndex() {
    return this.canvases.findIndex((e) => e.id === store!.getState().currentCanvas);
  }

  clearHistoryChunks() {
    this.historyChunks = {};
  }
  clearChunks() {
    this.chunks = {};
    this.waitingPixels = {};
  }

  loadFromLocalStorage() {
    const gridActive = localStorage.getItem('gridActive');
    if (gridActive)
      store?.dispatch({ type: SET_GRID_ACTIVE, payload: gridActive === "true" });

    const zoomTowardCursor = localStorage.getItem('zoomTowardCursor')
    if (zoomTowardCursor)
      store?.dispatch({ type: SET_ZOOM_TOWARD_CURSOR, payload: zoomTowardCursor === "true" });

    const activity = localStorage.getItem('activity');
    if (activity)
      store?.dispatch({ type: SET_ACTIVITY, payload: activity === "true" });

    const showChat = localStorage.getItem('showChat');
    if (showChat)
      store?.dispatch({ type: SET_SHOW_CHAT, payload: showChat === "true" });
    
    const position = localStorage.getItem('position')
    if (position)
      store?.dispatch({ type: SET_POSITION, payload: JSON.parse(position) });

    const overlayActive = localStorage.getItem('overlayActive')
    if (overlayActive)
      store?.dispatch({ type: SET_OVERLAY_ACTIVATE, payload: overlayActive === "true" });

    const overlayOpen = localStorage.getItem('overlayOpen')
    if (overlayOpen)
      store?.dispatch({ type: SET_OVERLAY_OPEN, payload: overlayOpen === "true" });

    const canvas = localStorage.getItem('canvas')
    if (canvas)
      store?.dispatch({ type: SET_CANVAS, payload: canvas });

    const darkMode = localStorage.getItem('darkMode')
    if (darkMode)
      store?.dispatch({ type: SET_DARK_MODE, payload: darkMode === "true" });
  
    const notifications = localStorage.getItem('notifications')
    if (notifications) {
      store?.dispatch({ type: SET_NOTIFICATIONS, payload: notifications === "true" });  
    } else {
      (async () => {
        const res = await Notification.requestPermission();
        if (res === 'granted')
          store?.dispatch({ type: SET_NOTIFICATIONS, payload: true });  
        else
          store?.dispatch({ type: SET_NOTIFICATIONS, payload: false });  
      })();
    }

    const sounds = localStorage.getItem('sounds')
    if (sounds)
      store?.dispatch({ type: SET_SOUNDS, payload: sounds === "true" });
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
  getChunkUrl = (chunkX: number, chunkY: number, history: boolean) => {
    const { date, hour } = store!.getState().history;

    if (history) {
      return `${API_URL}/history/chunk/${date}/${hour}/${this.currentCanvasId}/${chunkX}/${chunkY}`;
    } else {
      return `${API_URL}/chunk/${this.currentCanvasId}/${chunkX}/${chunkY}`;
    }
  }
  loadChunk = async (chunkX: number, chunkY: number, reload: boolean = false) => {
    if (this.currentCanvasIndex === -1)
      return;

    const boundingTL = this.canvases[this.currentCanvasIndex].boundingChunks[0];
    const boundingBR = this.canvases[this.currentCanvasIndex].boundingChunks[1];

    if (chunkX < boundingTL[0] || chunkY < boundingTL[1] || chunkX > boundingBR[0] || chunkY > boundingBR[1])
      return;

    const { activate, date, hour } = store!.getState().history;

    if (activate && (date === '' || hour === ''))
      return;
    const history = activate;

    const imgUrl = this.getChunkUrl(chunkX, chunkY, history);

    if (!reload && this.currentChunks[`${chunkX};${chunkY}`])
      return;
    try {
      const chunk = new Chunk({x: chunkX, y: chunkY});
      const [img] = await Promise.all([chunk.fetchImage(imgUrl)]);
      chunk.loadImage(img);
      this.currentChunks[`${chunkX};${chunkY}`] = chunk;
      store?.dispatch({ type: SET_SHOULD_RENDER, payload: true });
    } catch (e) {
      console.error(e);
    }
  }
  loadNeighboringChunks = async () => {
    const width = this.size.width;
    const height = this.size.height;

    store?.dispatch({ type: SET_SHOULD_LOAD_CHUNKS, payload: false });
    const chunkNbX = Math.ceil(width / CHUNK_SIZE) + 2;
    const chunkNbY = Math.ceil(height / CHUNK_SIZE) + 2;
    const chunkLoading = [];
    for (let x = this.position.x - CHUNK_SIZE * (chunkNbX / 2); x < this.position.x + CHUNK_SIZE * (chunkNbX / 2); x+= CHUNK_SIZE) {
      for (let y = this.position.y - CHUNK_SIZE * (chunkNbY / 2); y < this.position.y + CHUNK_SIZE * (chunkNbY / 2); y+= CHUNK_SIZE) {
        chunkLoading.push(this.loadChunk(Math.floor(x / CHUNK_SIZE), Math.floor(y / CHUNK_SIZE)));
      }
    }
    await Promise.all(chunkLoading);
  }
  placePixel = (coordX: number, coordY: number, color: string) => {
    const chunkX = Math.floor(coordX / CHUNK_SIZE);
    const chunkY = Math.floor(coordY / CHUNK_SIZE);

    if (this.chunks[`${chunkX};${chunkY}`]) {
      let px = coordX % CHUNK_SIZE;
      let py = coordY % CHUNK_SIZE;
      px = px >= 0 ? px : CHUNK_SIZE + px;
      py = py >= 0 ? py : CHUNK_SIZE + py;
      const chunk = this.chunks[`${chunkX};${chunkY}`];
      const currentColor = chunk.getColorAt(px, py);

      if (currentColor !== color) {
        this.chunks[`${chunkX};${chunkY}`].placePixel(px, py, color);
        store?.dispatch({ type: SET_SHOULD_RENDER, payload: true });
        return currentColor;
      }
    }
    return null;
  }
  placeUserPixel = (coordX: number, coordY: number, _color: string) => {
    if (this.position.zoom > 10 || store?.getState().history.activate) {
      return;
    }
    let color = _color;

    if (store?.getState().overlay.activate && store?.getState().overlay.autoColor) {
      const overlayPos = store.getState().overlay.position;
      const overlayColor = this.overlayController.getColorAt(coordX - overlayPos.x, coordY - overlayPos.y);
      if (!overlayColor)
        return;
      color = overlayColor;
    }

    const lastColor = this.placePixel(coordX, coordY, color);
    if (lastColor) {
      this.waitingPixels[`${coordX};${coordY}`] = lastColor;
      this.connectionController.sendToWs('placePixel', { x: coordX, y: coordY, color, canvas: this.currentCanvasId  });
    }
  }
  restorePixel = (coordX: number, coordY: number) => {
    const color = this.waitingPixels[`${coordX};${coordY}`];
    delete this.waitingPixels[`${coordX};${coordY}`];
    this.placePixel(coordX, coordY, color);
    this.soundController.playSound(AudioType.BAD);
    this.interactionController.shiftPressed = false;
  }
  confirmPixel = (coordX: number, coordY: number) => {
    delete this.waitingPixels[`${coordX};${coordY}`];
    this.soundController.playSound(AudioType.NEUTRAL);
  }
  changeZoom = (delta: number, focalX: number, focalY: number) => {
    const oldZoom = this.position.zoom;
    const newZoom = this.position.zoom + delta;

    if (newZoom >= 1 && newZoom < 50) {
      const changeInZoom = (oldZoom - newZoom) / 15;
      if (store?.getState().zoomTowardCursor) {
        const translateX = (focalX - this.position.x) * changeInZoom;
        const transtateY = (focalY - this.position.y) * changeInZoom;
        this.changePosition(translateX, transtateY);
      }
      this.setZoom(newZoom);
      localStorage.setItem('position', JSON.stringify(this.position));
    }
  }
  setZoom = (zoom: number) => {
    store?.dispatch({ type: SET_POSITION, payload: { ...this.position, zoom } });
  }
  setPosition = (x: number, y: number) => {
    store?.dispatch({ type: SET_POSITION, payload: { ...this.position, x, y } });
  }
  changePosition = (deltaX: number, deltaY: number) => {
    store?.dispatch({ type: SET_POSITION, payload: { ...this.position, x: this.position.x + deltaX, y: this.position.y + deltaY } });
  }
  getColorOnCoordinates(coordX: number, coordY: number) {
    const chunkX = Math.floor(coordX / CHUNK_SIZE);
    const chunkY = Math.floor(coordY / CHUNK_SIZE);

    if (this.currentChunks[`${chunkX};${chunkY}`]) {
      let px = coordX % CHUNK_SIZE;
      let py = coordY % CHUNK_SIZE;
      px = px >= 0 ? px : CHUNK_SIZE + px;
      py = py >= 0 ? py : CHUNK_SIZE + py;
      const chunk = this.currentChunks[`${chunkX};${chunkY}`];
      return chunk.getColorAt(px, py);
    } else {
      return null;
    }
  }

  // Drawing //
  render = () => {
    const ctx = this.canvas.getContext('2d');
    if (!ctx)
      return;

    store?.dispatch({ type: SET_SHOULD_RENDER, payload: false });
    ctx.clearRect(0, 0, this.size.width, this.size.height);
    this.drawChunks(ctx);
    this.drawGrid(ctx);
    this.drawActivity(ctx);
    this.overlayController.render(ctx);
  }
  drawGrid = (ctx: CanvasRenderingContext2D) => {
    if (this.position.zoom > 6 || !store?.getState().gridActive) {
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
    this.drawSquare(ctx);
  }
  drawSquare = (ctx: CanvasRenderingContext2D) => {
    const pos = store?.getState().cursorPos;

    if (pos) {
      const pixelSize = PIXEL_SIZE / this.position.zoom;
      const { posX, posY } = this.coordinatesOnCanvas(pos.x, pos.y);
      const color = this.getColorOnCoordinates(pos.x, pos.y);
      const BORDER_WIDTH = 3;

      ctx.fillStyle = store?.getState().selectedColor || "#FFFFFF";
      ctx.strokeStyle = "#000000";
      ctx.fillRect(posX, posY, pixelSize, pixelSize);
      ctx.strokeRect(posX, posY, pixelSize, pixelSize);
      ctx.fillStyle = color || "lightblue";
      ctx.fillRect(posX + BORDER_WIDTH, posY + BORDER_WIDTH, pixelSize - BORDER_WIDTH * 2, pixelSize - BORDER_WIDTH * 2)
      ctx.strokeRect(posX + BORDER_WIDTH, posY + BORDER_WIDTH, pixelSize - BORDER_WIDTH * 2, pixelSize - BORDER_WIDTH * 2);
    }
  }
  drawChunks = (ctx: CanvasRenderingContext2D) => {
    ctx.imageSmoothingEnabled = false;
    const pixelSize = PIXEL_SIZE / this.position.zoom;
    Object.keys(this.currentChunks).map((name) => {
      const chunk = this.currentChunks[name];

      const { posX, posY } = this.coordinatesOnCanvas(chunk.position.x * CHUNK_SIZE, chunk.position.y * CHUNK_SIZE);
      ctx.drawImage(chunk.canvas, posX, posY, chunk.canvas.width * pixelSize, chunk.canvas.height * pixelSize);
    });
  }
  drawActivity = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#FF000066";
    const pixelSize = PIXEL_SIZE / this.position.zoom;
    this.pixelActivity = this.pixelActivity.map(({ x, y, frame }) => {
      if (frame <= ACTIVITY_FRAME_NB) {
        const { posX, posY } = this.coordinatesOnCanvas(x, y);
        ctx.beginPath();
        ctx.arc(posX + pixelSize / 2, posY + pixelSize / 2, pixelSize * frame / (ACTIVITY_FRAME_NB / ACTIVITY_MAX_RADIUS), 0, 2 * Math.PI);
        ctx.fill();
      }
      return { x, y, frame: frame + 1 };
    });
    this.pixelActivity = this.pixelActivity.filter((e) => e.frame <= ACTIVITY_FRAME_NB + 1);
  }
}
let canvasController: CanvasController | null = null;

export function getCanvasController() {
  return canvasController;
}
export function initCanvasController(wsHash: string) {
  canvasController = new CanvasController(wsHash);
}
export function destructCanvasController() {
  canvasController?.destructor();
  canvasController = null;
}