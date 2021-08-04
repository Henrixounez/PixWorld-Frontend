import { CHUNK_SIZE } from "../constants/painting";

export default class Chunk {
  canvas: HTMLCanvasElement;
  position: {x: number, y: number} = {x: 0, y: 0};

  constructor(pos: { x: number, y: number }) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = CHUNK_SIZE;
    this.canvas.height = CHUNK_SIZE;
    this.position = pos;
  }
  
  backgroundImageToColor = (data: ImageData) => {
    for (let i = 0; i < data.data.length; i += 4) {
      if (data.data[i] == 0) {
        data.data[i]     = 202;
        data.data[i + 1] = 227;
        data.data[i + 2] = 255;
      }
    }
    return data;
  }

  private displayImg(img: HTMLImageElement) {
    const ctx = this.canvas.getContext('2d');
    img.setAttribute('crossOrigin', '');

    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0);
    }
  }

  fetchImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image();
      let firstLoad = false;
      img.onload = () => {
        if (firstLoad) {
          img.onload = null;
          return resolve(img);
        }
        this.displayImg(img);
        firstLoad = true;
      }
      img.src = url;
    });
  }

  loadImage(img: HTMLImageElement, bg: HTMLImageElement) {
    const ctx = this.canvas.getContext('2d');
    img.setAttribute('crossOrigin', '');
    bg.setAttribute('crossOrigin', '');

    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(bg, 0, 0);
      let data = ctx.getImageData(0, 0, CHUNK_SIZE, CHUNK_SIZE);

      ctx.putImageData(this.backgroundImageToColor(data), 0, 0);
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