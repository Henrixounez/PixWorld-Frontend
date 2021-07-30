import { useEffect, useRef, useState } from 'react';
import { HelpCircle, XCircle } from 'react-feather';
import styled from 'styled-components'
import palette from './palette';

const Canvas = styled.canvas`
  z-index: -1;
`;
const Palette = styled.div`
  position: absolute;
  right: 10px;
  bottom: 10px;
  padding: 5px;
  background-color: #FFF;
  border: 1px solid #000;

  .palette-color {
    width: 25px;
    height: 25px;
    cursor: pointer;
    transition: 0.2s;
    &:hover {
      transform: scale(1.2);
    }
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
  position = { x: 0, y: 0, zoom: 1 };
  cursorPosition = { x: 0, y: 0 };
  size = { width: 0, height: 0 };
  isMoving = false;
  isMouseDown = false;
  startMove = { x: 0, y: 0 };
  chunks: Record<string, Chunk> = {};
  selectedColor = palette[0];
  haveMouseOver = false;
  hookSetColor: (s: string) => void;
  ws: WebSocket;

  constructor(setColor: (s: string) => void) {
    this.hookSetColor = setColor;
    this.size = {
      width: window.innerWidth,
      height: window.innerHeight,
    }
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = this.size.width;
    canvas.height = this.size.height;
    this.canvas = canvas;

    // TODO: Reconnecti
    this.ws = new WebSocket(`${WS_URL}/pix/connect`);
    this.ws.onopen = (mess) => {
      console.info('[WS] Open', mess);
    }
    this.ws.onerror = (err) => {
      console.info('[WS] Error', err);
    }
    this.ws.onmessage = (mess) => {
      const { type, data } = JSON.parse(mess.data);

      switch (type) {
        case 'placePixel':
          this.placePixel(data.x, data.y, data.color, false);
        break;
      }
    }

    this.loadNeighboringChunks();
    this.canvas.addEventListener('mousedown', this.mouseDown);
    this.canvas.addEventListener('mousemove', this.mouseMove);
    this.canvas.addEventListener('mouseup', this.mouseUp);
    this.canvas.addEventListener('mouseenter', this.mouseEnter);
    this.canvas.addEventListener('mouseleave', this.mouseLeave);
    this.canvas.addEventListener('auxclick', this.auxclick);
    this.canvas.addEventListener('wheel', this.zoom);
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
    document.removeEventListener('keypress', this.keypress);
    document.removeEventListener('keydown', this.keydown);
    document.removeEventListener('keyup', this.keyup);
    window.removeEventListener('resize', this.resize);
  }

  // Utils //
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
    const boundingTL = [0, 0];
    const boundingBR = [0, 0];

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
  changeZoom = (delta: number, _focalX: number, _focalY: number) => {
    const newZoom = this.position.zoom + delta;
    this.position.zoom = newZoom < 1 ? 1 : newZoom > 50 ? 50 : newZoom;

    this.render();
  }
  changePosition = (deltaX: number, deltaY: number) => {
    this.position.x += deltaX;
    this.position.y += deltaY;
    this.loadNeighboringChunks();
    this.render();
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
      if (this.shiftPressed === true) {
        const { coordX, coordY } = this.canvasToCoordinates(this.cursorPosition.x, this.cursorPosition.y);
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
    this.changeZoom(e.deltaY / 2, coordX, coordY);
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
    }
  }
  keyup = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Shift':
        this.shiftPressed = false;
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
  const controller = useRef<CanvasController | null>();
  const [selectedColor, setSelectedColor] = useState(palette[0]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      let _controller: CanvasController | null = new CanvasController(setSelectedColor);
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
            <h3>Welcome on PixWorld - Bienvenue sur PixWorld</h3>
            <hr/>
            Place pixels where you want on this canvas !<br/>
            Placez des pixels où vous voulez sur cette carte !
            <hr/>
            Website made by Henrixounez & MXS<br/>
            Available Open Source on Github: <a href="https://github.com/Henrixounez/PixWorld-Frontend">Frontend</a> & <a href="https://github.com/Henrixounez/PixWorld-Backend">Backend</a><br/>
            Join our <a href="https://discord.gg/kQPsRxNuDr">Discord</a>
          </ModalContent>
        </ModalBackdrop>
      )}
      <ButtonList>
        <div onClick={() => setShowModal(true)}>
          <HelpCircle color="#000" />
        </div>
      </ButtonList>
      <Palette>
        {palette.map((color, i) => (
          <div
            key={i}
            className="palette-color"
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
      <Canvas
        // @ts-ignore
        ref={canvasRef}
        id="canvas"
      />
    </>
  );
}

export default CanvasComponent;