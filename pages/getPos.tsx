import { Canvas as CanvasType } from "./index/controller/CanvasController";

export default function getOriginalPos(canvases: Array<CanvasType>, pos: string) {
  const regex = /(.)\((-?\d*),\s*(-?\d*),\s*(-?\d*)\)/;
  const res = pos.match(regex);

  if (!res || res.length !== 5) return null;;

  const letter = res[1];
  const x = Number(res[2]);
  const y = Number(res[3]);
  const zoom = Number(res[4]);

  const canvas = canvases.find((e) => e.letter === letter);

  if (!canvas) return null;

  return {
    x,
    y,
    zoom,
    canvas: canvas.id,
  };
}