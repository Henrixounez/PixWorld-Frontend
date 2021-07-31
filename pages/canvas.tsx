import { useEffect, useRef, useState } from 'react';
import { HelpCircle, XCircle, Upload } from 'react-feather';
import styled from 'styled-components'
import { store } from '../store';
import { SET_CURSOR_POS, SET_NB_PLAYERS } from '../store/actions/infos';
import CursorPosition from './cursorPosition';
import palette from './palette';
import PlayerCounter from './playerCounter';

const Canvas = styled.canvas`
  z-index: -1;
`;
const Palette = styled.div`
  position: fixed;
  right: 10px;
  bottom: 10px;
  padding: 5px;
  background-color: #FFF;
  border: 1px solid #000;
  overflow: hidden;

  display: flex;
  flex-flow: column wrap;

  height: calc(30*25px);
  transition: 0.2s;

  @media (max-height: 800px) {
    height: calc(15 * 25px);
    width: calc(2 * 25px);
  }
  @media (max-height: 400px) {
    height: calc(6 * 25px);
    width: calc(5 * 25px);
  }
`;
const PaletteButton = styled.div<{selected: boolean}>`
  width: 25px;
  min-height: 25px;
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    transform: scale(1.2);
  }
`;
const ButtonList = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  align-items: center;

  div {
    background-color: #FFFD;
    border: 1px solid #000;
    box-sizing: border-box;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    &:hover {
      background-color: #FFFA;
    }
  }
`;
const ModalBackdrop = styled.div`
  position: absolute;
  width: 100vw;
  height: 100vh;
  z-index: 100;
  background-color: #FFFA;
`;
const ModalContent = styled.div`
  position: relative;
  margin: 10vh auto;
  width: 80vw;
  height: 80vh;
  max-width: 800px;
  background-color: white;
  box-sizing: border-box;
  padding: 2.5rem;
  font-family: Arial, Helvetica, sans-serif;
  text-align: center;
  line-height: 1.5rem;
  hr {
    margin: 2rem 0;
  }
  button {
    outline: none;
    background-color: white;
    border: 1px solid #555;
    border-radius: 2px;
    padding: 5px 10px;
    cursor: pointer;
    box-shadow: 1px 1px 2px #000;
    transition: .5s;
    &:hover {
      box-shadow: 2px 2px 3px #000;
    }
  }
`;
const CloseButton = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  transition: 0.1s;;
  &:hover {
    transform: scale(1.1);
  }
`;

const CHUNK_SIZE = 256;
const PIXEL_SIZE = 50;
const API_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : 'https://api.henrixounez.com/pixworld';
const WS_URL  = process.env.NODE_ENV === 'development' ? 'ws://localhost:8080' : 'wss://api.henrixounez.com/pixworld';
enum ModalTypes {
  INFOS,
  PROBLEM
};

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
    img.setAttribute('crossOrigin', '');

    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0);
    }
  }
  toHex(n: number) {
    const s = n.toString(16);
    return s.length === 1 ? '0' + s : s;
  }
  getColorAt(x: number, y: number) {
    const ctx = this.canvas.getContext('2d');

    if (!ctx)
      return '#000000';
    const data = ctx.getImageData(x, y, 1, 1).data;
    return ('#' + this.toHex(data[0]) + this.toHex(data[1]) + this.toHex(data[2])).toUpperCase();

  }
  placePixel(x: number, y: number, color: string) {
    const ctx = this.canvas.getContext('2d');

    if (!ctx)
      return;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
    return;
  }
}

class CanvasController {
  canvas: HTMLCanvasElement;
  shiftPressed = false;
  position = { x: 0, y: 0, zoom: 50 };
  cursorPosition = { x: 0, y: 0 };
  size = { width: 0, height: 0 };
  isMoving = false;
  isMouseDown = false;
  startMove = { x: 0, y: 0 };
  pinchDistance = 0;
  longTouchTimeout: NodeJS.Timeout | null = null;
  chunks: Record<string, Chunk> = {};
  selectedColor = palette[0];
  haveMouseOver = false;
  boundingChunks = [[0, 0], [0, 0]];
  hookSetColor: (s: string) => void;
  activateModal: (t: ModalTypes) => void;
  ws: WebSocket;

  constructor(setColor: (s: string) => void, activateModal: (t: ModalTypes) => void) {
    this.hookSetColor = setColor;
    this.activateModal = activateModal;
    this.size = {
      width: window.innerWidth,
      height: window.innerHeight,
    }
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = this.size.width;
    canvas.height = this.size.height;
    this.canvas = canvas;

    this.ws = new WebSocket(`${WS_URL}/pix/connect`);
    this.connectWs();

    this.loadNeighboringChunks();
    this.canvas.addEventListener('mousedown', this.mouseDown);
    this.canvas.addEventListener('mousemove', this.mouseMove);
    this.canvas.addEventListener('mouseup', this.mouseUp);
    this.canvas.addEventListener('mouseenter', this.mouseEnter);
    this.canvas.addEventListener('mouseleave', this.mouseLeave);
    this.canvas.addEventListener('auxclick', this.auxclick);
    this.canvas.addEventListener('wheel', this.zoom);
    this.canvas.addEventListener('touchstart', this.touchStart);
    this.canvas.addEventListener('touchend', this.touchEnd);
    this.canvas.addEventListener('touchcancel', this.touchCancel);
    this.canvas.addEventListener('touchleave', this.touchLeave);
    this.canvas.addEventListener('touchmove', this.touchMove);
    document.addEventListener('keypress', this.keypress);
    document.addEventListener('keydown', this.keydown);
    document.addEventListener('keyup', this.keyup);
    window.addEventListener('resize', this.resize);
  }

  destructor() {
    console.log('destructor');
    this.ws.close();
    this.canvas.removeEventListener('mousedown', this.mouseDown);
    this.canvas.removeEventListener('mousemove', this.mouseMove);
    this.canvas.removeEventListener('mouseup', this.mouseUp);
    this.canvas.removeEventListener('mouseenter', this.mouseEnter);
    this.canvas.removeEventListener('mouseleave', this.mouseLeave);
    this.canvas.removeEventListener('auxclick', this.auxclick);
    this.canvas.removeEventListener('wheel', this.zoom);
    this.canvas.removeEventListener('touchstart', this.touchStart);
    this.canvas.removeEventListener('touchend', this.touchEnd);
    this.canvas.removeEventListener('touchcancel', this.touchCancel);
    this.canvas.removeEventListener('touchleave', this.touchLeave);
    this.canvas.removeEventListener('touchmove', this.touchMove);
    document.removeEventListener('keypress', this.keypress);
    document.removeEventListener('keydown', this.keydown);
    document.removeEventListener('keyup', this.keyup);
    window.removeEventListener('resize', this.resize);
  }

  // Utils //
  connectWs = () => {
    this.ws.onopen = () => {
    }
    this.ws.onclose = (e) => {
      if (!e.wasClean)
        setTimeout(() => this.activateModal(ModalTypes.PROBLEM), 2000);
    }
    this.ws.onerror = () => {
      setTimeout(() => this.activateModal(ModalTypes.PROBLEM), 2000);
    }
    this.ws.onmessage = (mess) => {
      const { type, data } = JSON.parse(mess.data);

      switch (type) {
        case 'init':
          this.boundingChunks = data.boundingChunks;
          this.loadNeighboringChunks();
          store?.dispatch({ type: SET_NB_PLAYERS, payload: data.playerNb });
          break;
        case 'placePixel':
          this.placePixel(data.x, data.y, data.color, false);
          break;
        case 'playerNb':
          store?.dispatch({ type: SET_NB_PLAYERS, payload: data });
          break;
      }
    }
  }
  sendToWs = (type: string, data: any) => {
    this.ws.send(JSON.stringify({ type, data }));
  }
  setSelectedColor = (color: string) => {
    this.selectedColor = color;
    this.hookSetColor(color);
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
          this.sendToWs('placePixel', { x: coordX, y: coordY, color });
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

  // Actions //
  resize = (e: UIEvent) => {
    const eWindow = e.target as Window;
    this.size = {
      width: eWindow.innerWidth,
      height: eWindow.innerHeight,
    };
    this.canvas.width = this.size.width;
    this.canvas.height = this.size.height;
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
      const { coordX, coordY } = this.canvasToCoordinates(this.cursorPosition.x, this.cursorPosition.y);
      store?.dispatch({ type: SET_CURSOR_POS, payload: { x: coordX, y: coordY }});
      if (this.shiftPressed === true) {
        this.placePixel(coordX, coordY, this.selectedColor);
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
      if (e.button === 0) {
        const { coordX, coordY } = this.canvasToCoordinates(e.clientX, e.clientY);
        this.placePixel(coordX, coordY, this.selectedColor);
      }
    }
    this.isMouseDown = false
  }
  mouseEnter = () => {
    this.haveMouseOver = true;
  }
  mouseLeave = () => {
    this.haveMouseOver = false;
    this.shiftPressed = false;
    this.startMove = { x: 0, y: 0};
    this.isMoving = false;
    this.isMouseDown = false;
  }
  auxclick = (e: MouseEvent) => {
    if (e.button === 1) {
      const { coordX, coordY } = this.canvasToCoordinates(e.clientX, e.clientY);
      this.setSelectedColor(this.getColorOnCoordinates(coordX, coordY));
      e.stopPropagation();
    }
  }
  zoom = (e: WheelEvent) => {
    const { coordX, coordY } = this.canvasToCoordinates(e.clientX, e.clientY);
    this.changeZoom(e.deltaY < 0 ? -1 : 1, coordX, coordY);
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
        if (this.haveMouseOver) {
          this.shiftPressed = true;
          const { coordX, coordY } = this.canvasToCoordinates(this.cursorPosition.x, this.cursorPosition.y);
          this.placePixel(coordX, coordY, this.selectedColor);
        }
        break;
      case 'Control':
        const { coordX, coordY } = this.canvasToCoordinates(this.cursorPosition.x, this.cursorPosition.y);
        this.setSelectedColor(this.getColorOnCoordinates(coordX, coordY));
        break;
    }
  }
  keypress = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'e':
        this.changeZoom(-1, this.position.x, this.position.y);
        break;
      case 'a':
        this.changeZoom(1, this.position.x, this.position.y);
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
    }
  }
  keyup = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Shift':
        this.shiftPressed = false;
    }
  }
  onLongTouch = (e: TouchEvent) => {
    const { coordX, coordY } = this.canvasToCoordinates(e.touches[0].clientX, e.touches[0].clientY);
    this.setSelectedColor(this.getColorOnCoordinates(coordX, coordY));
  }
  touchStart = (e: TouchEvent) => {
    this.isMouseDown = true;
    this.longTouchTimeout = setTimeout(() => this.onLongTouch(e), 500);
  }
  touchEnd = () => {
    this.pinchDistance = 0;
    if (this.longTouchTimeout)
      clearTimeout(this.longTouchTimeout);
    this.longTouchTimeout = null;
    this.pinchDistance = 0;
    if (this.isMoving === true) {
      this.startMove = { x: 0, y: 0 };
      this.isMoving = false;
    }
    this.isMouseDown = false
  }
  touchCancel = () => {
    this.touchEnd();
  }
  touchLeave = () => {
    this.touchEnd();
  }
  touchMove = (e: TouchEvent) => {
    const touches = e.touches;

    if (this.longTouchTimeout)
      clearTimeout(this.longTouchTimeout);
    this.longTouchTimeout = null;

    if (touches.length === 1) {
      e.preventDefault();
      const touch = touches[0];
      if (!this.isMoving) {
        this.startMove = {
          x: touch.clientX,
          y: touch.clientY,
        }
        this.isMoving = true;
      }
      const pixelSize = PIXEL_SIZE / this.position.zoom;
      this.changePosition((this.startMove.x - touch.clientX) / pixelSize, (this.startMove.y - touch.clientY) / pixelSize);
      this.startMove = {
        x: touch.clientX,
        y: touch.clientY,
      }
    } else if (touches.length === 2) {
      const distX = touches[0].clientX - touches[1].clientX;
      const distY = touches[0].clientY - touches[1].clientY;
      const pinchDistance = Math.hypot(distX, distY);
      this.changeZoom((this.pinchDistance - pinchDistance) / 10, this.position.x, this.position.y);
      this.pinchDistance = pinchDistance;
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

function OneDimensionToImageArray(data: Uint8ClampedArray, width: number, height: number) {
  var array = new Array<number[][]>(height);
  for (let i = 0; i < height; i++) {
    array[i] = new Array<number[]>(width);
    for (let j = 0; j < width; j++) {
      let index = (i * width * 4 +  j * 4);
      array[i][j] = [data[index], data[index + 1], data[index + 2], data[index + 3]];
    }
  }
  return array;
}

function ImageArrayToOneDimension(array: number[][][], width: number, height: number, size: number) {
  var data = new Uint8ClampedArray(size);
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      let index = (i * width * 4 +  j * 4);
      data[index] = array[i][j][0];
      data[index + 1] = array[i][j][1];
      data[index + 2] = array[i][j][2];
      data[index + 3] = array[i][j][3];
    }
  }
  return data;
}

function hexToRgb(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return [
    parseInt(result![1], 16),
    parseInt(result![2], 16),
    parseInt(result![3], 16)]
}

function getRGBPalette() {
  let newPalette = Array<number[]>(palette.length);
  for (let i = 0; i < palette.length; i++) {
    newPalette[i] = hexToRgb(palette[i]);
  }
  return newPalette;
}

function FindNearestColor(pixel: number[], pal: number[][]) {
  let r = pixel[0];
  let g = pixel[1];
  let b = pixel[2];

  let colorDiff = new Array<number[]>();
  for (let i = 0; i < pal.length; i++) {
    let cr = pal[i][0];
    let cg = pal[i][1];
    let cb = pal[i][2];

    let diff = Math.sqrt(Math.pow(Math.abs(r - cr), 2) + Math.pow(Math.abs(g - cg), 2) + Math.pow(Math.abs(b - cb), 2));
    colorDiff[i] = [diff, cr, cg, cb]
  }
  let nearest = colorDiff.sort(function(a, b) { return a[0] - b[0]; });
  return [nearest[0][1], nearest[0][2], nearest[0][3], 255];
}

function ImgToPalette(data: number[][][], width: number, height: number) {
  let cData = data;
  let rgbPalette = getRGBPalette();

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      cData[i][j] = FindNearestColor(cData[i][j], rgbPalette);
    }
  }
  return cData;
}

function CanvasComponent() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewRef = useRef<HTMLCanvasElement | null>(null);
  const controller = useRef<CanvasController | null>(null);
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const [selectedColor, setSelectedColor] = useState(palette[0]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(ModalTypes.INFOS);
  const [showConverter, setShowConverter] = useState(false);
  const [wantedWidth, setWantedWidth] = useState(50);

  const activateModal = (type: ModalTypes) => {
    setShowModal(true);
    setModalType(type);
  }

  const UploadImage = () => {
    if (inputFileRef.current)
      inputFileRef.current.click();
  }

  const DownloadImage = () => {
    const ctx = previewRef.current?.getContext('2d');

    if (ctx) {
      const url = ctx.canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'converter.png';
      link.href = url;
      link.click();
    }
  }
  function WantedWidthChange(event: React.ChangeEvent<HTMLInputElement>) {
    setWantedWidth(parseInt(event.target.value));
  }
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.stopPropagation();
    event.preventDefault();

    if (!event.target.files)
      return;

    const fileURL = URL.createObjectURL(event.target.files[0]);
    const ctx = previewRef.current?.getContext('2d');
    console.log(fileURL);

    const img = new Image();
    
    img.src = fileURL;

    img.onload = () => {
      if (ctx) {
        const scale = wantedWidth/img.width;
        const newWidth = img.width * scale;
        const newHeight = img.height * scale;

        ctx.canvas.width = newWidth;
        ctx.canvas.height = newHeight;
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        const imgData = ctx.getImageData(0, 0, newWidth, newHeight);
        const pData = imgData.data
        const imgArray = OneDimensionToImageArray(pData, imgData.width, imgData.height);

        const transformedArray = ImgToPalette(imgArray, imgData.width, imgData.height);
        const transformedImg = ImageArrayToOneDimension(transformedArray, imgData.width, imgData.height, pData.length);
        
        for (var i = 0; i < pData.length; i++) {
          pData[i] = transformedImg[i];
        }

        ctx.clearRect(0, 0, imgData.width, imgData.height);
        ctx.putImageData(imgData, 0, 0);
      }
    }
  }


  useEffect(() => {
    if (canvasRef.current) {
      let _controller: CanvasController | null = new CanvasController(
        setSelectedColor,
        activateModal,
      );
      _controller.render();
      controller.current = _controller;
      return () => {
        _controller?.destructor();
        _controller = null;
        controller.current = null;
      }
    }
  }, [canvasRef])

  return (
    <>
      { showModal && (
        <ModalBackdrop onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowModal(false)}>
              <XCircle color="#000" />
            </CloseButton>
            { modalType === ModalTypes.INFOS && (
              <>
                <h3>Welcome on PixWorld - Bienvenue sur PixWorld</h3>
                <hr/>
                Place pixels where you want on this canvas !<br/>
                Placez des pixels où vous voulez sur cette carte !
                <hr/>
                Website made by Henrixounez & MXS<br/>
                Available Open Source on Github: <a href="https://github.com/Henrixounez/PixWorld-Frontend">Frontend</a> & <a href="https://github.com/Henrixounez/PixWorld-Backend">Backend</a><br/>
                Join our <a href="https://discord.gg/kQPsRxNuDr">Discord</a>
              </>
            )}
            { modalType === ModalTypes.PROBLEM && (
              <>
                <h3>Connection lost with the server - Connexion perdue avec le serveur</h3>
                <hr/>
                Please refresh the page - Veuillez rafraichir la page
                <br/>
                <br/>
                <button onClick={() => location.reload()}>
                  Refresh - Rafraichir
                </button>
              </>
            )}
          </ModalContent>
        </ModalBackdrop>
      )}
      {showConverter && (
        <ModalBackdrop onClick = {() => setShowConverter(false)}>
          <ModalContent onClick = {(e) => e.stopPropagation()}>
            <CloseButton onClick = {() => setShowConverter(false)}>
              <XCircle color = "#000" />
            </CloseButton>
            <h3> Converter - Convert your picture!</h3>
            <hr/> Width of the final image: 
            <input type="text" id="wantedWidth" defaultValue="50" onChange={WantedWidthChange}/>
            <br/>
            Upload your image  
            <input type='file' id='file' ref={inputFileRef} style={{display: 'none'}} onChange={handleChange}/>
            <button onClick={UploadImage} type="button">Upload</button>
            <hr/>
            <canvas 
            // @ts-ignore
            ref={previewRef} 
            id="preview"
            />
            <hr/>
            <button onClick={DownloadImage} type="button">Download?</button>
          </ModalContent>
        </ModalBackdrop>
      )}

      <ButtonList>
        <div onClick={() => activateModal(ModalTypes.INFOS)}>
          <HelpCircle color="#000" />
        </div>
        <div onClick = {() => setShowConverter(true)}>
          <Upload color = "#000" />
        </div>
      </ButtonList>
      <Palette>
        {palette.map((color, i) => (
          <PaletteButton
            key={i}
            selected={selectedColor === color}
            style={{
              backgroundColor: color,
              transform: selectedColor === color ? "scale(1.2)" : '',
            }}
            onClick={() => {
              controller.current?.setSelectedColor(color);
            }}
          />
        ))}
      </Palette>
      <PlayerCounter/>
      <CursorPosition/>
      <Canvas
        // @ts-ignore
        ref={canvasRef}
        id="canvas"
      />
    </>
  );
}

export default CanvasComponent;
