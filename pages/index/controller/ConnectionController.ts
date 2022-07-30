import axios from "axios";
import { store } from "../store";
import { ADD_CHAT_MESSAGE, SET_CHAT_MESSAGE, CLEAR_CHAT_MESSAGES } from "../store/actions/chat";
import { SET_ALERT, SET_COOLDOWN, SET_DISCONNECT, SET_LAST_NOTIFICATION_DATE, SET_MODAL, SET_NB_PLAYERS } from "../store/actions/infos";
import { SET_SELECTED_COLOR, SET_SHOULD_LOAD_CHUNKS, SET_SHOULD_REFRESH_CHUNKS, SET_SHOULD_RENDER } from "../store/actions/painting";
import { SET_CANVAS } from "../store/actions/parameters";
import { SET_NB_PIXELS, SET_USER } from "../store/actions/user";
import { API_URL, WS_URL } from "../../constants/api";
import ModalTypes from "../../constants/modalTypes";
import { CanvasController } from "./CanvasController";
import { Colors } from "../../constants/colors";

export default class ConnectionController {
  canvasController: CanvasController;
  ws: WebSocket;
  isInit: boolean = false;

  constructor(canvasController: CanvasController, wsHash: string) {
    this.canvasController = canvasController;
    this.ws = new WebSocket(`${WS_URL}/pix/connect?hash=${wsHash}`);
    this.ws.onopen = () => {
      this.getMe();
    }
    this.ws.onclose = (e) => {
      this.isInit = false;
      if (!e.wasClean || e.code === 1013)
        setTimeout(() => store?.dispatch({ type: SET_MODAL, payload: ModalTypes.PROBLEM }), 2000);
    }
    this.ws.onerror = () => {
      this.isInit = false;
      setTimeout(() => store?.dispatch({ type: SET_MODAL, payload: ModalTypes.PROBLEM }), 2000);
    }
    this.ws.onmessage = (mess) => {
      const { type, data } = JSON.parse(mess.data);

      switch (type) {
        case 'init':
          this.isInit = true;
          store?.dispatch({ type: SET_SHOULD_LOAD_CHUNKS, payload: true });
          store?.dispatch({ type: SET_NB_PLAYERS, payload: data.playerNb });
          store?.dispatch({ type: SET_COOLDOWN, payload: data.cooldown });
          store?.dispatch({ type: SET_CHAT_MESSAGE, payload: data.chatMessages });
          store?.dispatch({ type: SET_LAST_NOTIFICATION_DATE, payload: data.lastNotification });
          if (!store?.getState().currentCanvas) {
            store?.dispatch({ type: SET_CANVAS, payload: this.canvasController.canvases[0].id });
            store?.dispatch({ type: SET_SELECTED_COLOR, payload: this.canvasController.canvases[0].palette[0] })
          }
          this.getMe();
          localStorage.removeItem('badConnection');
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
          store?.dispatch({ type: SET_ALERT, payload: { show: true, text: data.reason, color: Colors.ALERT }});
          this.canvasController.restorePixel(data.pos.x, data.pos.y);
          break;
        case 'chatMessage':
          store?.dispatch({ type: ADD_CHAT_MESSAGE, payload: data });
          break;
        case 'clearChatMessages':
          store?.dispatch({ type: CLEAR_CHAT_MESSAGES, payload: data });
          break;
        case 'captchaNeeded':
          store?.dispatch({ type: SET_MODAL, payload: ModalTypes.CAPTCHA });
          this.canvasController.restorePixel(data.pos.x, data.pos.y);
          break;
        case 'refreshChunks':
          store?.dispatch({ type: SET_SHOULD_REFRESH_CHUNKS, payload: { refresh: true, chunks: data.chunks } });
          store?.dispatch({ type: SET_SHOULD_RENDER, payload: true });
          break;
        case 'disconnect':
          this.isInit = false;
          store?.dispatch({ type: SET_DISCONNECT, payload: data });
          store?.dispatch({ type: SET_MODAL, payload: ModalTypes.PROBLEM });
          if (data === 'Bad connection request.') {
            const hadBadConnection = localStorage.getItem('badConnection');
            if (hadBadConnection === 'true') {
              localStorage.removeItem('token');
              localStorage.removeItem('badConnection');
            } else {
              localStorage.setItem('badConnection', 'true');
              location.reload();
            }
          }
          break;
        case 'newNotification':
          store?.dispatch({ type: SET_LAST_NOTIFICATION_DATE, payload: data });
          break;
      }
    }
  }
  destructor() {
    this.ws.close();
  }

  getMe = async () => {
    const token = localStorage.getItem('token');

    if (!this.isInit || !token || store?.getState().user)
      return;
    try {
      const res = await axios.get(`${API_URL}/user/me`, { headers: { 'Authorization': token }});
      localStorage.setItem('token', res.headers['authorization']);
      store?.dispatch({
        type: SET_USER,
        payload: res.data
      });
    } catch (e) {
      if ((e as any).response?.status === 401)
        localStorage.removeItem('token');
    }
  };

  sendToWs = (type: string, data: any) => {
    if (this.ws.readyState === WebSocket.CLOSING || this.ws.readyState === WebSocket.CLOSED) {
      window.location.reload();
      return;
    }
    if (this.ws.readyState === WebSocket.CONNECTING)
      return;
    this.ws.send(JSON.stringify({ type, data }));
  }
}