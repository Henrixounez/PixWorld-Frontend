import { CHUNK_SIZE } from "../../constants/painting";

export default class Chunk {
  canvas: HTMLCanvasElement;
  position: {x: number, y: number} = {x: 0, y: 0};
  chunkSize: number;

  constructor(pos: { x: number, y: number }, chunkSize: number) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = CHUNK_SIZE;
    this.canvas.height = CHUNK_SIZE;
    this.position = pos;
    this.chunkSize = chunkSize;
  }
  
  private displayImg(img: HTMLImageElement) {
    const ctx = this.canvas.getContext('2d');

    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0);
    }
  }

  fetchImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image();
      img.setAttribute('crossOrigin', '');
      img.onload = () => {
        img.onload = null;
        this.displayImg(img);
        return resolve(img);
      }
      img.src = url;
    });
  }

  loadImage(img: HTMLImageElement) {
    const ctx = this.canvas.getContext('2d');

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
    if (data[3] === 0)
      return '#0000';
    return ('#' + this.toHex(data[0]) + this.toHex(data[1]) + this.toHex(data[2])).toUpperCase();
  }
  placePixel(x: number, y: number, color: string) {
    const ctx = this.canvas.getContext('2d');

    if (!ctx)
      return;

    if (color !== "#0000") {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    } else {
      ctx.clearRect(x, y, 1, 1);
    }
    return;
  }
}