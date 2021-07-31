import { useEffect, useRef, useState } from "react";
import palette from "../../constants/palette";

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
    parseInt(result![3], 16)]
}

export function getRGBPalette() {
  let newPalette = Array<number[]>(palette.length);
  for (let i = 0; i < palette.length; i++) {
    newPalette[i] = hexToRgb(palette[i]);
  }
  return newPalette;
}

export function FindNearestColor(pixel: number[], pal: number[][]) {
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

export default function ModalConverter() {
  const previewRef = useRef<HTMLCanvasElement | null>(null);
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const [wantedWidth, setWantedWidth] = useState(50);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (image)
      displayImg(image);
  }, [wantedWidth]);

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
      const scale = wantedWidth/img.width;
      const newWidth = img.width * scale;
      const newHeight = img.height * scale;

      if (newHeight >= 1) {
        console.log(newWidth, newHeight);
        ctx.canvas.width = newWidth;
        ctx.canvas.height = newHeight;
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        const imgData = ctx.getImageData(0, 0, newWidth, newHeight);
        const pData = imgData.data
        const imgArray = OneDimensionToImageArray(pData, imgData.width, imgData.height);

        const transformedArray = ImgToPalette(imgArray, imgData.width, imgData.height);
        const transformedImg = ImageArrayToOneDimension(transformedArray, imgData.width, imgData.height, pData.length);
        
        for (let i = 0; i < pData.length; i++) {
          pData[i] = transformedImg[i];
        }

        ctx.clearRect(0, 0, imgData.width, imgData.height);
        ctx.putImageData(imgData, 0, 0);
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
    <>
      <h3>
        Converter - Convert your picture!
      </h3>
      <hr/>
      Width of the final image: 
      <input type="number" id="wantedWidth" defaultValue="50" min="1" onChange={WantedWidthChange}/>
      <br/>
      Upload your image  
      <input type='file' id='file' ref={inputFileRef} style={{display: 'none'}} onChange={handleChange}/>
      <button onClick={UploadImage} type="button">
        Upload
      </button>
      <hr/>
      <canvas  ref={previewRef} id="preview"/>
      <hr/>
      <button onClick={DownloadImage} type="button">
        Download?
      </button>
    </>
  );
}