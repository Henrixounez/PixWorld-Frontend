import axios from "axios";
import { store } from "../../store";
import { ADD_CHAT_MESSAGE, SET_CHAT_MESSAGE } from "../../store/actions/chat";
import { SET_COOLDOWN, SET_MODAL, SET_NB_PLAYERS } from "../../store/actions/infos";
import { SET_SHOULD_LOAD_CHUNKS } from "../../store/actions/painting";
import { SET_CANVAS } from "../../store/actions/parameters";
import { SET_NB_PIXELS, SET_USER } from "../../store/actions/user";
import { API_URL, WS_URL } from "../constants/api";
import ModalTypes from "../constants/modalTypes";
import { CanvasController } from "./CanvasController";

export default class ConnectionController {
  canvasController: CanvasController;
  ws: WebSocket;

  constructor(canvasController: CanvasController, wsHash: string) {
    this.canvasController = canvasController;
    this.ws = new WebSocket(`${WS_URL}/pix/connect?hash=${wsHash}`);
    this.ws.onopen = () => {
      this.getMe();
    }
    this.ws.onclose = (e) => {
      if (!e.wasClean || e.code === 1013)
        setTimeout(() => store?.dispatch({ type: SET_MODAL, payload: ModalTypes.PROBLEM }), 2000);
    }
    this.ws.onerror = () => {
      setTimeout(() => store?.dispatch({ type: SET_MODAL, payload: ModalTypes.PROBLEM }), 2000);
    }
    this.ws.onmessage = (mess) => {
      const { type, data } = JSON.parse(mess.data);

      switch (type) {
        case 'init':
          this.canvasController.canvases = data.canvases;
          store?.dispatch({ type: SET_SHOULD_LOAD_CHUNKS, payload: true });
          store?.dispatch({ type: SET_NB_PLAYERS, payload: data.playerNb });
          store?.dispatch({ type: SET_COOLDOWN, payload: data.cooldown });
          store?.dispatch({ type: SET_CHAT_MESSAGE, payload: data.chatMessages });
          if (!store?.getState().currentCanvas)
            store?.dispatch({ type: SET_CANVAS, payload: this.canvasController.canvases[0].id });
          break;
        case 'placePixel':
          if (data.canvas === store?.getState().currentCanvas) {
            this.canvasController.placePixel(data.x, data.y, data.color);
            this.canvasController.pixelActivity.push({ x: data.x, y: data.y, frame: 0 });
          }
          break;
        case 'playerNb':
          store?.dispatch({ type: SET_NB_PLAYERS, payload: data });
          break;
        case 'confirmPixel':
          store?.dispatch({ type: SET_COOLDOWN, payload: data.cd });
          store?.dispatch({ type: SET_NB_PIXELS, payload: { totalPixels: data.totalPixels, dailyPixels: data.dailyPixels }});
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

  getMe = async () => {
    const token = localStorage.getItem('token');

    if (!token || store?.getState().user)
      return;
    try {
      const res = await axios.get(`${API_URL}/user/me`, { headers: { 'Authorization': token }});
      localStorage.setItem('token', res.headers['authorization']);
      store?.dispatch({
        type: SET_USER,
        payload: res.data
      });
    } catch (e) {
      if (e.response?.status === 401)
        localStorage.removeItem('token');
    }
  };

  sendToWs = (type: string, data: any) => {
    const key = (window as Window & typeof globalThis & {key?: string}).key;
    this.ws.send(JSON.stringify({ type, data, key }));
  }
}