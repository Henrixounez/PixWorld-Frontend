import { Unsubscribe } from "redux";
import { store } from "../store";
import { SET_OVERLAY_AUTOCOLOR, SET_OVERLAY_POSITION, SET_OVERLAY_TAINTED } from "../store/actions/overlay";
import { SET_SHOULD_RENDER } from "../store/actions/painting";
import { PIXEL_SIZE } from "../../constants/painting";
import { FindNearestColor, getRGBPalette } from "../ui/modals/Converter";
import { CanvasController } from "./CanvasController";

export default class OverlayController {
  canvasController: CanvasController;
  imgUrl: string;
  unsubscribe: Unsubscribe;
  canvas: HTMLCanvasElement;

  constructor(canvasController: CanvasController) {
    this.canvasController = canvasController;

    this.canvas = document.createElement('canvas');
    this.canvas.width = 0;
    this.canvas.height = 0;

    this.imgUrl = store?.getState().overlay.image || "";
    if (this.imgUrl)
      this.setImage(this.imgUrl);

    this.unsubscribe = store!.subscribe(() => {
      if (store) {
        const state = store.getState();
        const imgUrl = state.overlay.image;
        if (imgUrl !== this.imgUrl && imgUrl)
          this.setImage(imgUrl);
        if (state.overlay.positionMouse && ((state.overlay.position.x ?? 0) !== state.cursorPos.x || (state.overlay.position.y ?? 0) !== state.cursorPos.y))
          store.dispatch({ type: SET_OVERLAY_POSITION, payload: state.cursorPos });
      }
    })
  }
  destructor() {
    this.unsubscribe();
  }

  get activate() {
    return store!.getState().overlay.activate;
  }
  get position() {
    return store!.getState().overlay.position;
  }
  get transparency() {
    return store!.getState().overlay.transparency;
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.imgUrl && this.activate && this.canvas.height > 0) {
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = this.transparency;
      const pixelSize = PIXEL_SIZE / this.canvasController.position.zoom;
      const { posX, posY } = this.canvasController.coordinatesOnCanvas(this.position.x ?? 0, this.position.y ?? 0);
      ctx.drawImage(this.canvas, posX, posY, this.canvas.width * pixelSize, this.canvas.height * pixelSize);
      ctx.globalAlpha = 1;
    }
  }
  setImage(imgUrl: string, reloadTry: boolean = false) {
    this.imgUrl = imgUrl;
    const img = new Image();
    if (!reloadTry)
      img.crossOrigin = "anonymous";
    img.src = imgUrl;
    img.onload = () => {
      const ctx = this.canvas.getContext('2d');
      this.canvas.width = img.width
      this.canvas.height = img.height;

      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0);
        store?.dispatch({ type: SET_SHOULD_RENDER, payload: true });
      }
      try {
        ctx?.getImageData(0, 0, 1, 1);
        store?.dispatch({ type: SET_OVERLAY_TAINTED, payload: false });
      } catch (e) {
        store?.dispatch({ type: SET_OVERLAY_AUTOCOLOR, payload: false });
        store?.dispatch({ type: SET_OVERLAY_TAINTED, payload: true });
      }
    }
    img.onerror = () => {
      if (!reloadTry)
        this.setImage(imgUrl, true);
    }
  }

  toHex(n: number) {
    const s = n.toString(16);
    return s.length === 1 ? '0' + s : s;
  }
  getColorAt(x: number, y: number) {
    const ctx = this.canvas.getContext('2d');

    if (!ctx)
      return null;
    const data = ctx.getImageData(x, y, 1, 1).data;
    const palette = getRGBPalette(store?.getState().canvases.find((c) => c.id === store?.getState().currentCanvas)?.palette ?? []);
    palette.push([0, 0, 0, 0]);

    const color = FindNearestColor([data[0], data[1], data[2], data[3]], palette);

    if (color[0] === 0 && color[1] === 0 && color[2] === 0 && color[3] === 0)
      return null;

    return ('#' + this.toHex(color[0]) + this.toHex(color[1]) + this.toHex(color[2])).toUpperCase();
  }
}