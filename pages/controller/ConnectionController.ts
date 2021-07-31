import { store } from "../../store";
import { SET_MODAL, SET_NB_PLAYERS } from "../../store/actions/infos";
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
          break;
        case 'placePixel':
          this.canvasController.placePixel(data.x, data.y, data.color, false);
          break;
        case 'playerNb':
          store?.dispatch({ type: SET_NB_PLAYERS, payload: data });
          break;
      }
    }
  }
  destructor() {
    this.ws.close();
  }

  sendToWs = (type: string, data: any) => {
    this.ws.send(JSON.stringify({ type, data }));
  }
}