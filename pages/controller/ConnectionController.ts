import { store } from "../../store";
import { ADD_CHAT_MESSAGE, SET_CHAT_MESSAGE } from "../../store/actions/chat";
import { SET_COOLDOWN, SET_MODAL, SET_NB_PLAYERS } from "../../store/actions/infos";
import { SET_NB_PIXELS } from "../../store/actions/user";
import { WS_URL } from "../constants/api";
import ModalTypes from "../constants/modalTypes";
import { CanvasController } from "./CanvasController";

export default class ConnectionController {
  canvasController: CanvasController;
  ws: WebSocket;

  constructor(canvasController: CanvasController) {
    this.canvasController = canvasController;
    this.ws = new WebSocket(`${WS_URL}/pix/connect`);
    this.ws.onopen = () => {
    }
    this.ws.onclose = (e) => {
      if (!e.wasClean)
        setTimeout(() => store?.dispatch({ type: SET_MODAL, payload: ModalTypes.PROBLEM }), 2000);
    }
    this.ws.onerror = () => {
      setTimeout(() => store?.dispatch({ type: SET_MODAL, payload: ModalTypes.PROBLEM }), 2000);
    }
    this.ws.onmessage = (mess) => {
      const { type, data } = JSON.parse(mess.data);

      switch (type) {
        case 'init':
          this.canvasController.boundingChunks = data.boundingChunks;
          this.canvasController.loadNeighboringChunks();
          store?.dispatch({ type: SET_NB_PLAYERS, payload: data.playerNb });
          store?.dispatch({ type: SET_COOLDOWN, payload: data.cooldown });
          store?.dispatch({ type: SET_CHAT_MESSAGE, payload: data.chatMessages });
          break;
        case 'placePixel':
          this.canvasController.placePixel(data.x, data.y, data.color);
          this.canvasController.pixelActivity.push({ x: data.x, y: data.y, frame: 0 });
          break;
        case 'playerNb':
          store?.dispatch({ type: SET_NB_PLAYERS, payload: data });
          break;
        case 'confirmPixel':
          store?.dispatch({ type: SET_COOLDOWN, payload: data.cd });
          store?.dispatch({ type: SET_NB_PIXELS, payload: data.totalPixels });
          this.canvasController.confirmPixel(data.pos.x, data.pos.y);
          break;
        case 'refusePixel':
          store?.dispatch({ type: SET_COOLDOWN, payload: data.cd });
          this.canvasController.restorePixel(data.pos.x, data.pos.y);
          break;
        case 'chatMessage':
          store?.dispatch({ type: ADD_CHAT_MESSAGE, payload: data });
          break;
        case 'captchaNeeded':
          store?.dispatch({ type: SET_MODAL, payload: ModalTypes.CAPTCHA });
          this.canvasController.restorePixel(data.pos.x, data.pos.y);
          break;
      }
    }
  }
  destructor() {
    this.ws.close();
  }

  sendToWs = (type: string, data: any) => {
    const key = (window as Window & typeof globalThis & {key?: string}).key;
    this.ws.send(JSON.stringify({ type, data, key }));
  }
}