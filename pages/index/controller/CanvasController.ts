import { API_URL } from "../../constants/api";
import { CHUNK_SIZE, PIXEL_SIZE } from "../../constants/painting";

import Chunk from "./Chunk";
import InteractionController from "./InteractionController";
import ConnectionController from "./ConnectionController";
import OverlayController from "./OverlayController";
import SoundController, { AudioType } from "./SoundController";
import { store } from "../store";
import { SET_ACTIVITY, SET_CANVAS, SET_DARK_MODE, SET_GRID_ACTIVE, SET_GRID_SIZE, SET_NOTIFICATIONS, SET_SHOW_BUTTONS, SET_SHOW_PALETTE, SET_SOUNDS, SET_ZOOM_TOWARD_CURSOR } from "../store/actions/parameters";
import { ChunkRefresh, SET_POSITION, SET_SHOULD_CLEAR_CHUNKS, SET_SHOULD_LOAD_CHUNKS, SET_SHOULD_REFRESH_CHUNKS, SET_SHOULD_RENDER } from "../store/actions/painting";
import { SET_OVERLAY_ACTIVATE, SET_OVERLAY_OPEN } from "../store/actions/overlay";
import { SET_SHOW_CHAT } from "../store/actions/chat";
import { SET_LAST_READ_NOTIFICATION_DATE } from "../store/actions/infos";

const ACTIVITY_DURATION_MS = 1000;
const ACTIVITY_REFRESH_MS = 25;
const ACTIVITY_MAX_RADIUS = 10;
const ACTIVITY_FRAME_NB = ACTIVITY_DURATION_MS / ACTIVITY_REFRESH_MS;

export const RENDER_REFRESH_MS = 25;
const LIMIT_DRAW_NORMAL_CHUNKS = 0.5;
export const MAX_ZOOM = 3000;
export const GRID_ZOOM = 6;

export interface Canvas {
  name: string;
  id: string;
  letter: string;
  boundingChunks: [[number, number],[number, number]];
  cooldownTime: number;
  size: number;
  superchunkLevels: number[];
  locked?: boolean;
  palette: string[];
}

export class CanvasController {
  canvas: HTMLCanvasElement;
  size = { width: 0, height: 0 };
  chunks: Record<string, Chunk> = {};
  historyChunks: Record<string, Chunk> = {};
  superChunks: Array<{[key: string]: Chunk}> = [];
  waitingPixels: Record<string, string> = {};
  pixelActivity: { x: number, y: number, frame: number}[] = [];
  activityTimeout: NodeJS.Timeout | null = null;

  interactionController: InteractionController;
  connectionController: ConnectionController;
  overlayController: OverlayController;
  soundController: SoundController;

  constructor(wsHash: string, pos?: { x: number, y: number, zoom: number, canvas: string }) {
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
    this.loadFromLocalStorage(pos);

  }

  destructor() {
    this.interactionController.destructor();
    this.connectionController.destructor();
    this.overlayController.destructor();
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
  get canvases() {
    return store!.getState().canvases;
  }
  get currentCanvas() {
    return this.canvases!.find((e) => e.id === store!.getState().currentCanvas)!;
  }

  clearHistoryChunks() {
    this.historyChunks = {};
  }
  clearChunks(chunksToRefresh: ChunkRefresh[]) {
    if (chunksToRefresh.length) {
      [...chunksToRefresh].forEach((chunk) => {
        if (chunk.canvas === this.currentCanvasId)
          delete this.chunks[`${chunk.x};${chunk.y}`];
      })
    } else {
      this.chunks = {};
      this.waitingPixels = {};
      this.historyChunks = {};
      this.superChunks = this.currentCanvas?.superchunkLevels.map(() => ({})) || [];
    }
    store?.dispatch({ type: SET_SHOULD_CLEAR_CHUNKS, payload: false });
  }

  loadFromLocalStorage(pos?: { x: number, y: number, zoom: number, canvas: string }) {
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

    const overlayActive = localStorage.getItem('overlayActive')
    if (overlayActive)
      store?.dispatch({ type: SET_OVERLAY_ACTIVATE, payload: overlayActive === "true" });

    const overlayOpen = localStorage.getItem('overlayOpen')
    if (overlayOpen)
      store?.dispatch({ type: SET_OVERLAY_OPEN, payload: overlayOpen === "true" });

    const canvas = localStorage.getItem('canvas')
    if (pos)
      store?.dispatch({ type: SET_CANVAS, payload: pos.canvas });
    else if (canvas)
      store?.dispatch({ type: SET_CANVAS, payload: canvas });
    else
      store?.dispatch({ type: SET_CANVAS, payload: store.getState().canvases[0].id })

    const position = localStorage.getItem('position')
    if (pos)
      store?.dispatch({ type: SET_POSITION, payload: { x: pos.x, y: pos.y, zoom: pos.zoom }});
    else if (position)
      store?.dispatch({ type: SET_POSITION, payload: JSON.parse(position) });
  
    const darkMode = localStorage.getItem('darkMode')
    if (darkMode)
      store?.dispatch({ type: SET_DARK_MODE, payload: darkMode === "true" });
    
    const gridSize = localStorage.getItem('gridSize')
    if (gridSize)
      store?.dispatch({ type: SET_GRID_SIZE, payload: Number(gridSize) });

    const showButtons = localStorage.getItem('showButtons')
    if (showButtons)
      store?.dispatch({ type: SET_SHOW_BUTTONS, payload: showButtons === "true" });

    const showPalette = localStorage.getItem('showPalette')
    if (showPalette)
      store?.dispatch({ type: SET_SHOW_PALETTE, payload: showPalette === "true" });

    const lastReadNotificationDate = localStorage.getItem('lastReadNotificationDate')
    if (lastReadNotificationDate)
      store?.dispatch({ type: SET_LAST_READ_NOTIFICATION_DATE, payload: lastReadNotificationDate });
  
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
  coordinatesOnCanvas = (targetX: number, targetY: number, _zoom?: number) => {
    const { x, y } = this.position;
    const zoom = _zoom ? _zoom : this.position.zoom;
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
  canSuperchunkLoadOrDisplay = (i: number, canvas: Canvas) => {
    const pixelSize = PIXEL_SIZE / this.position.zoom;
    return i === canvas?.superchunkLevels?.length - 1 || pixelSize > 0.25 ** (i + 2);
  }
  loadSuperchunks = async () => {
    const canvas = this.currentCanvas;
    const width = this.size.width;
    const height = this.size.height;

    if (!canvas)
      return;

    if (this.superChunks.length === 0)
      this.superChunks = canvas.superchunkLevels.map(() => ({}));

    canvas.superchunkLevels.forEach(async (chunkNb, i) => {
      if (!this.canSuperchunkLoadOrDisplay(i, canvas))
        return;

      const superChunkSize = canvas.size * CHUNK_SIZE / chunkNb;

      const coordsStart = this.canvasToCoordinates(0, 0);
      const coordsEnd = this.canvasToCoordinates(width, height);

      const halfCanvasSize = canvas.size * CHUNK_SIZE / 2;
      for (let x = coordsStart.coordX + halfCanvasSize - superChunkSize / 2; x < coordsEnd.coordX + halfCanvasSize + superChunkSize / 2; x += superChunkSize) {
        for (let y = coordsStart.coordY + halfCanvasSize - superChunkSize / 2; y < coordsEnd.coordY + halfCanvasSize + superChunkSize / 2; y += superChunkSize) {
          let toLoadX = Math.floor(x / superChunkSize);
          let toLoadY = Math.floor(y / superChunkSize);

          const posX = toLoadX - chunkNb / 2;
          const posY = toLoadY - chunkNb / 2;

          if (toLoadX >= chunkNb || toLoadY >= chunkNb || toLoadX < 0 || toLoadY < 0)
            continue;

          if (this.superChunks[i][`${toLoadX};${toLoadY}`])
            continue;
          const chunk = new Chunk({ x: posX , y: posY }, (canvas.size * CHUNK_SIZE) / chunkNb);
          const img = chunk.fetchImage(`${API_URL}/superchunk/${this.currentCanvasId}/${i}/${toLoadX}/${toLoadY}`);
          this.superChunks[i][`${toLoadX};${toLoadY}`] = chunk;
          chunk.loadImage(await img);
        }
      }
      store?.dispatch({ type: SET_SHOULD_RENDER, payload: true });
    })
  }
  getChunkUrl = (chunkX: number, chunkY: number, history: boolean) => {
    const { date, hour } = store!.getState().history;

    if (history) {
      return `${API_URL}/history/chunk/${date}/${hour}/${this.currentCanvasId}/${chunkX}/${chunkY}`;
    } else {
      return `${API_URL}/chunk/${this.currentCanvasId}/${chunkX}/${chunkY}${store?.getState().eraserMode ? '?noBg' : ''}`;
    }
  }
  loadChunk = async (chunkX: number, chunkY: number, reload: boolean = false) => {
    if (this.currentCanvasIndex === -1)
      return;

    const boundingTL = this.currentCanvas.boundingChunks[0];
    const boundingBR = this.currentCanvas.boundingChunks[1];

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
      const chunk = new Chunk({x: chunkX, y: chunkY}, CHUNK_SIZE);
      const img = chunk.fetchImage(imgUrl);
      this.currentChunks[`${chunkX};${chunkY}`] = chunk;
      chunk.loadImage(await img);
      store?.dispatch({ type: SET_SHOULD_RENDER, payload: true });
    } catch (e) {
      console.error(e);
    }
  }
  loadNeighboringChunks = async () => {
    store?.dispatch({ type: SET_SHOULD_LOAD_CHUNKS, payload: false });

    if (this.canvases.length)
      this.loadSuperchunks();

    const pixelSize = PIXEL_SIZE / this.position.zoom;
    if (pixelSize < LIMIT_DRAW_NORMAL_CHUNKS)
      return;
    
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
  }
  refreshChunks = async (chunks: ChunkRefresh[]) => {
    const chunksToRefreshs = [...chunks]
    store?.dispatch({ type: SET_SHOULD_REFRESH_CHUNKS, payload: { refresh: false, chunks: [] } });

    const pixelSize = PIXEL_SIZE / this.position.zoom;
    if (pixelSize < LIMIT_DRAW_NORMAL_CHUNKS)
      return;

    const chunkLoading: Promise<void>[] = [];
    for (let i = 0; i < chunksToRefreshs.length; i++) {
      if (chunksToRefreshs[i].canvas !== this.currentCanvasId)
        continue;
      delete this.chunks[`${chunksToRefreshs[i].x};${chunksToRefreshs[i].y}`];
      chunkLoading.push(this.loadChunk(chunksToRefreshs[i].x, chunksToRefreshs[i].y))
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
      const overlayColor = this.overlayController.getColorAt(coordX - (overlayPos.x ?? 0), coordY - (overlayPos.y ?? 0));
      if (!overlayColor)
        return;
      color = overlayColor;
    }
    if (store?.getState().eraserMode)
      color = "#0000";

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
    this.interactionController.isAutoBrushing = false;
    this.interactionController.isMouseDown = false;
  }
  confirmPixel = (coordX: number, coordY: number) => {
    delete this.waitingPixels[`${coordX};${coordY}`];
    this.soundController.playSound(AudioType.NEUTRAL);
  }
  changeZoom = (delta: number, focalX: number, focalY: number) => {
    const { coordX, coordY } = this.canvasToCoordinates(focalX, focalY);
    const { posX: startPosX, posY: startPosY } = this.coordinatesOnCanvas(coordX, coordY);
    let newZoom = this.position.zoom * delta;
    if (newZoom >= 1 && newZoom < MAX_ZOOM) {
      const { posX, posY } = this.coordinatesOnCanvas(coordX, coordY, newZoom);
      
      const diffX = startPosX - posX;
      const diffY = startPosY - posY;
      const pixelSize = PIXEL_SIZE / newZoom;
      const toMoveX = diffX / pixelSize;
      const toMoveY = diffY / pixelSize;

      // Optimization for being less CPU intensive due to Redux dispatch
      store!.getState().position.zoom = newZoom;
      store!.getState().position.x = this.position.x - toMoveX;
      store!.getState().position.y = this.position.y - toMoveY;
      this.loadNeighboringChunks();
      this.render();
    }
  }
  setZoom = (zoom: number) => {
    store?.dispatch({ type: SET_POSITION, payload: { ...this.position, zoom } });
  }
  setPosition = (x: number, y: number) => {
    store?.dispatch({ type: SET_POSITION, payload: { ...this.position, x, y } });
  }
  changePosition = (deltaX: number, deltaY: number) => {
    const newPositionX = this.position.x + deltaX;
    const newPositionY = this.position.y + deltaY;
    store?.dispatch({
      type: SET_POSITION,
      payload: { ...this.position, x: newPositionX, y: newPositionY }
    });
  }
  getColorOnCoordinates(coordX: number, coordY: number, inHistory: boolean = false) {
    const chunkX = Math.floor(coordX / CHUNK_SIZE);
    const chunkY = Math.floor(coordY / CHUNK_SIZE);
    
    let workingChunk;
    if (inHistory) {
      workingChunk = this.historyChunks;
    }
    else {
      workingChunk = this.currentChunks
    }

    if (workingChunk[`${chunkX};${chunkY}`]) {
      let px = coordX % CHUNK_SIZE;
      let py = coordY % CHUNK_SIZE;
      px = px >= 0 ? px : CHUNK_SIZE + px;
      py = py >= 0 ? py : CHUNK_SIZE + py;
      const chunk = workingChunk[`${chunkX};${chunkY}`];
      return chunk.getColorAt(px, py);
    } else {
      return "";
    }
  }

  // Drawing //
  render = () => {
    const ctx = this.canvas.getContext('2d');
    if (!ctx)
      return;

    store?.dispatch({ type: SET_SHOULD_RENDER, payload: false });
    ctx.clearRect(0, 0, this.size.width, this.size.height);
    if (!store?.getState().eraserMode && !store?.getState().history.activate) {
      this.drawSuperChunks(ctx);
    } else {
      ctx.fillStyle = "lightblue"
      ctx.fillRect(0, 0, this.size.width, this.size.height);  
    }
    if (PIXEL_SIZE / this.position.zoom > LIMIT_DRAW_NORMAL_CHUNKS)
      this.drawChunks(ctx);
    if (store?.getState().npzMode)
      this.drawNpz(ctx);
    this.drawGrid(ctx);
    this.drawSquare(ctx);
    this.drawActivity(ctx);
    this.overlayController.render(ctx);
  }
  drawGrid = (ctx: CanvasRenderingContext2D) => {
    if (this.position.zoom > GRID_ZOOM || !store?.getState().gridActive) {
      return;
    }

    const gridSize = store?.getState().gridSize || 10;
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    const pixelSize = PIXEL_SIZE / this.position.zoom;
    const centerCoord = { x: Math.round(this.position.x), y: Math.round(this.position.y) };
    const centerPoint = this.coordinatesOnCanvas(centerCoord.x, centerCoord.y);
    const linesH = Math.ceil(height / pixelSize) + 2;
    const linesV = Math.ceil(width / pixelSize) + 2;

    ctx.strokeStyle = "#2222227E";
    for (let i = centerCoord.y - linesH; i < centerCoord.y + linesH; i++) {
      ctx.lineWidth = i % gridSize === 0 ? 2 : 1;
      ctx.beginPath();
      const posY = centerPoint.posY + (i - centerCoord.y) * pixelSize;
      ctx.moveTo(0, posY);
      ctx.lineTo(width, posY);
      ctx.stroke();
    }
    for (let i = centerCoord.x - linesV; i < centerCoord.x + linesV; i++) {
      ctx.lineWidth = i % gridSize === 0 ? 2 : 1;
      ctx.beginPath();
      const posX = centerPoint.posX + (i - centerCoord.x) * pixelSize;
      ctx.moveTo(posX, 0);
      ctx.lineTo(posX, height);
      ctx.stroke();
    }
  }
  drawSquare = (ctx: CanvasRenderingContext2D) => {
    if (this.position.zoom > GRID_ZOOM) {
      return;
    }

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
  drawSuperChunks = (ctx: CanvasRenderingContext2D) => {
    ctx.imageSmoothingEnabled = false;
    const pixelSize = PIXEL_SIZE / this.position.zoom;
    const canvas = this.currentCanvas;

    this.superChunks.slice().filter((_, i) => this.canSuperchunkLoadOrDisplay(i, canvas)).reverse().forEach((superChunks) => {
      Object.keys(superChunks).map((name) => {
        const chunk = superChunks[name];

        const { posX, posY } = this.coordinatesOnCanvas(chunk.position.x * chunk.chunkSize, chunk.position.y * chunk.chunkSize);
        ctx.drawImage(chunk.canvas, posX, posY, chunk.chunkSize * pixelSize, chunk.chunkSize * pixelSize);
      });
    })
  }
  drawChunks = (ctx: CanvasRenderingContext2D) => {
    ctx.imageSmoothingEnabled = false;
    const pixelSize = PIXEL_SIZE / this.position.zoom;
    const width = this.size.width;
    const height = this.size.height;
    const coordsStart = this.canvasToCoordinates(0, 0);
    const coordsEnd = this.canvasToCoordinates(width, height);

    for (let x = coordsStart.coordX - CHUNK_SIZE; x < coordsEnd.coordX + CHUNK_SIZE; x += CHUNK_SIZE) {
      for (let y = coordsStart.coordY - CHUNK_SIZE; y < coordsEnd.coordY + CHUNK_SIZE; y += CHUNK_SIZE) {
        const toDisplayX = Math.floor(x / CHUNK_SIZE);
        const toDisplayY = Math.floor(y / CHUNK_SIZE);

        const chunk = this.currentChunks[`${toDisplayX};${toDisplayY}`];

        if (!chunk)
          continue;

        const { posX, posY } = this.coordinatesOnCanvas(chunk.position.x * CHUNK_SIZE, chunk.position.y * CHUNK_SIZE);
        ctx.drawImage(chunk.canvas, posX, posY, chunk.chunkSize * pixelSize, chunk.chunkSize * pixelSize);
      }
    }
  }
  drawNpz = (ctx: CanvasRenderingContext2D) => {
    const pixelSize = PIXEL_SIZE / this.position.zoom;
    const width = this.size.width;
    const height = this.size.height;
    const coordsStart = this.canvasToCoordinates(0, 0);
    const coordsEnd = this.canvasToCoordinates(width, height);

    const npzToDisplay = (store?.getState().npzList ?? []).filter((npz) => npz.startX <= coordsEnd.coordX && npz.startY <= coordsEnd.coordY && npz.endX >= coordsStart.coordX && npz.endY >= coordsStart.coordY);

    ctx.beginPath();
    npzToDisplay.forEach((npz) => {
      const { posX: startPosX, posY: startPosY } = this.coordinatesOnCanvas(npz.startX, npz.startY);

      ctx.moveTo(startPosX, startPosY);
      ctx.lineTo(startPosX + (npz.endX - npz.startX) * pixelSize, startPosY);
      ctx.lineTo(startPosX + (npz.endX - npz.startX) * pixelSize, startPosY + (npz.endY - npz.startY) * pixelSize);
      ctx.lineTo(startPosX, startPosY + (npz.endY - npz.startY) * pixelSize);
    })
    ctx.fillStyle = "#FF000066";
    ctx.closePath();
    ctx.fill();
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

    if (this.pixelActivity.length && store?.getState().activity && !store.getState().history.activate) {
      if (this.activityTimeout) {
        clearTimeout(this.activityTimeout);
      }
      this.activityTimeout = setTimeout(() => {
        store?.dispatch({ type: SET_SHOULD_RENDER, payload: true });
        this.activityTimeout = null;
      }, RENDER_REFRESH_MS);
    } else if (this.pixelActivity.length) {
      this.pixelActivity = [];
      if (this.activityTimeout) {
        clearTimeout(this.activityTimeout);
      }
      this.activityTimeout = setTimeout(() => {
        store?.dispatch({ type: SET_SHOULD_RENDER, payload: true });
        this.activityTimeout = null;
      }, RENDER_REFRESH_MS);
    }

  }
}
let canvasController: CanvasController | null = null;

export function getCanvasController() {
  return canvasController;
}
export function initCanvasController(wsHash: string, pos?: { x: number, y: number, zoom: number, canvas: string }) {
  canvasController = new CanvasController(wsHash, pos);
}
export function destructCanvasController() {
  canvasController?.destructor();
  canvasController = null;
}