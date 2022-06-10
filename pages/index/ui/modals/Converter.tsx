import { useEffect, useRef, useState } from "react";
import { useTranslation } from 'next-i18next';
import styled from "styled-components";
import { useSelector } from "react-redux";
import { ReduxState } from "../../store";
import { Colors, getColor } from "../../../constants/colors";

const Container = styled.div<{darkMode: boolean}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  button {
    color: ${({ darkMode }) => getColor(Colors.TEXT, darkMode)};
  }
`;

const ImagePreviewCanvas = styled.div<{darkMode: boolean}>`
`;

function OneDimensionToImageArray(data: Uint8ClampedArray, width: number, height: number) {
  const array = new Array<number[][]>(height);
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
  const data = new Uint8ClampedArray(size);
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
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return [
    parseInt(result![1], 16),
    parseInt(result![2], 16),
    parseInt(result![3], 16),
    255,
  ]
}

export function getRGBPalette(palette: string[]) {
  return palette.map((p) => hexToRgb(p));
}

export function FindNearestColor(pixel: number[], pal: number[][]) {
  const r = pixel[0];
  const g = pixel[1];
  const b = pixel[2];
  const a = pixel[3];

  const colorDiff = pal.map((p) => {
    const cr = p[0];
    const cg = p[1];
    const cb = p[2];
    const ca = p[3];

    const diff = Math.hypot(Math.abs(r - cr), Math.abs(g - cg), Math.abs(b - cb), Math.abs(a - ca));
    return [diff, cr, cg, cb, ca]
  })
  const nearest = colorDiff.sort(function(a, b) { return a[0] - b[0]; })[0];
  return [nearest[1], nearest[2], nearest[3], nearest[4]];
}

function ImgToPalette(data: number[][][], width: number, height: number, palette: string[]) {
  let cData = data;
  let rgbPalette = getRGBPalette(palette);
  rgbPalette.push([0, 0, 0, 0]);

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      cData[i][j] = FindNearestColor(cData[i][j], rgbPalette);
    }
  }
  return cData;
}

class Converter {
  canvas: HTMLCanvasElement | null = null;
  palette: string[] = [];

  initCanvas(palette: string[]) {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 100;
      this.canvas.height = 100;
    }
    this.palette = palette;
  }

  drawImage(img: HTMLImageElement, wantedWidth: number): HTMLCanvasElement {
    if (!this.canvas)
      this.initCanvas(this.palette);

    const ctx = this.canvas!.getContext('2d');
    
    if (ctx) {
      const scale = wantedWidth / img.width;
      const newWidth = img.width * scale;
      const newHeight = img.height * scale;
      ctx.clearRect(0, 0, newWidth, newHeight);
      ctx.imageSmoothingEnabled = false;

      if (newHeight >= 1) {
        ctx.canvas.width = newWidth;
        ctx.canvas.height = newHeight;
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        const imgData = ctx.getImageData(0, 0, newWidth, newHeight);
        const pData = imgData.data
        const imgArray = OneDimensionToImageArray(pData, imgData.width, imgData.height);

        const transformedArray = ImgToPalette(imgArray, imgData.width, imgData.height, this.palette);
        let transformedImg = ImageArrayToOneDimension(transformedArray, imgData.width, imgData.height, pData.length);

        for (let i = 0; i < pData.length; i++) {
          pData[i] = transformedImg[i];
        }
        ctx.clearRect(0, 0, imgData.width, imgData.height);
        ctx.putImageData(imgData, 0, 0);
      }
    }
    return this.canvas!;
  }
}

let converter = new Converter();

export default function ModalConverter() {
  const { t } = useTranslation('converter');
  const previewRef = useRef<HTMLCanvasElement | null>(null);
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const darkMode = useSelector((state: ReduxState) => state.darkMode);
  const currentCanvas = useSelector((state: ReduxState) => state.canvases.find((c) => c.id === state.currentCanvas));
  const [wantedWidth, setWantedWidth] = useState(50);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [grid, setGrid] = useState(false);

  useEffect(() => {
    if (image)
      displayImg(image);
  }, [wantedWidth, grid]);

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
    event.stopPropagation();
    event.preventDefault();
    setWantedWidth(Number(event.target.value));
  }

  function displayImg(img: HTMLImageElement) {
    const ctx = previewRef.current?.getContext('2d');

    if (ctx) {
      const scale = wantedWidth / img.width;
      const newWidth =  (img.width * scale) * (grid ? 5 : 1);
      const newHeight = (img.height * scale) * (grid ? 5 : 1);

      if (newHeight >= 1) {
        ctx.canvas.width = newWidth;
        ctx.canvas.height = newHeight;

        ctx.imageSmoothingEnabled = false;
        converter.initCanvas(currentCanvas?.palette ?? []);
        const imgCanvas = converter.drawImage(img, wantedWidth);
        ctx.drawImage(imgCanvas, 0, 0, newWidth, newHeight);

        if (grid) {
          ctx.strokeStyle = "#222222";
          ctx.lineWidth = 1;
          for (let i = 0; i < newWidth - newWidth % 5 + 5; i += 5) {
            ctx.beginPath();
            ctx.moveTo(i + 0.5, 0);
            ctx.lineTo(i + 0.5, newHeight);
            ctx.stroke();
            if (i % 50 === 0 && i !== 0) {
              ctx.beginPath();
              ctx.moveTo(i - 1 + 0.5, 0);
              ctx.lineTo(i - 1 + 0.5, newHeight);
              ctx.stroke();  
            }
          }
          for (let i = 0; i < newHeight - newHeight % 5 + 5; i += 5) {
            ctx.beginPath();
            ctx.moveTo(0, i + 0.5);
            ctx.lineTo(newWidth, i + 0.5);
            ctx.stroke();
            if (i % 50 === 0 && i !== 0) {
              ctx.beginPath();
              ctx.moveTo(0, i - 1 + 0.5);
              ctx.lineTo(newWidth, i - 1 + 0.5);
              ctx.stroke();  
            }
          }
        }
      }
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.stopPropagation();
    event.preventDefault();

    if (!event.target.files)
      return;

    const fileURL = URL.createObjectURL(event.target.files[0]);
    const img = new Image();    
    img.src = fileURL;

    setImage(img);
    img.onload = () => {
      displayImg(img);
    };
  }

  return (
    <Container darkMode={darkMode}>
      {t('widthText')}
      <input type="number" id="wantedWidth" defaultValue="50" min="1" onChange={WantedWidthChange}/>
      <br/>
      {t('uploadText')}
      <input type='file' id='file' ref={inputFileRef} style={{display: 'none'}} onChange={handleChange}/>
      <button onClick={UploadImage} type="button">
        {t('uploadBtn')}
      </button>
      <div onClick={(e) => { setGrid(!grid); e.stopPropagation(); }}>
        <span>{t('addGrid')}</span>
        <input type='checkbox' checked={grid} readOnly />
      </div>
      <hr/>
        <ImagePreviewCanvas darkMode={darkMode}>
          <canvas ref={previewRef} id="preview"/>
        </ImagePreviewCanvas>
      <hr/>
      <button onClick={DownloadImage} type="button">
        {t('downloadBtn')}
      </button>
    </Container>
  );
}