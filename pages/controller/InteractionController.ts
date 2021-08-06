import { store } from "../../store";
import { SET_ALERT, SET_CURSOR_POS, SET_SEARCH } from "../../store/actions/infos";
import { SET_OVERLAY_ACTIVATE, SET_OVERLAY_POSITION_MOUSE } from "../../store/actions/overlay";
import { SET_SELECTED_COLOR, SET_SHOULD_RENDER } from "../../store/actions/painting";
import { SET_ACTIVITY, SET_GRID_ACTIVE, SET_SOUNDS } from "../../store/actions/parameters";
import { SET_HISTORY_MODE_ACTIVE } from "../../store/actions/history";
import { PIXEL_SIZE } from "../constants/painting";
import palette from "../constants/palette";
import { CanvasController } from "./CanvasController";
import { AudioType } from "./SoundController";

export default class InteractionController {
  canvasController: CanvasController;

  shiftPressed = false;
  isMouseDown = false;
  isMoving = false;
  startMove = { x: 0, y: 0 };
  pinchDistance = 0;
  longTouchTimeout: NodeJS.Timeout | null = null;
  haveMouseOver = true;
  cursorPosition = { x: 0, y: 0 };

  constructor(canvasController: CanvasController) {
    this.canvasController = canvasController;

    this.canvas.addEventListener('mousedown', this.mouseDown);
    this.canvas.addEventListener('mousemove', this.mouseMove);
    this.canvas.addEventListener('mouseup', this.mouseUp);
    this.canvas.addEventListener('mouseenter', this.mouseEnter);
    this.canvas.addEventListener('mouseleave', this.mouseLeave);
    this.canvas.addEventListener('auxclick', this.auxclick);
    this.canvas.addEventListener('wheel', this.zoom);
    this.canvas.addEventListener('touchstart', this.touchStart);
    this.canvas.addEventListener('touchend', this.touchEnd);
    this.canvas.addEventListener('touchcancel', this.touchCancel);
    this.canvas.addEventListener('touchleave', this.touchLeave);
    this.canvas.addEventListener('touchmove', this.touchMove);
    this.canvas.addEventListener('keypress', this.keypress);
    this.canvas.addEventListener('keydown', this.keydown);
    this.canvas.addEventListener('keyup', this.keyup);
    window.addEventListener('resize', this.resize);
  }

  destructor() {
    this.canvas.removeEventListener('mousedown', this.mouseDown);
    this.canvas.removeEventListener('mousemove', this.mouseMove);
    this.canvas.removeEventListener('mouseup', this.mouseUp);
    this.canvas.removeEventListener('mouseenter', this.mouseEnter);
    this.canvas.removeEventListener('mouseleave', this.mouseLeave);
    this.canvas.removeEventListener('auxclick', this.auxclick);
    this.canvas.removeEventListener('wheel', this.zoom);
    this.canvas.removeEventListener('touchstart', this.touchStart);
    this.canvas.removeEventListener('touchend', this.touchEnd);
    this.canvas.removeEventListener('touchcancel', this.touchCancel);
    this.canvas.removeEventListener('touchleave', this.touchLeave);
    this.canvas.removeEventListener('touchmove', this.touchMove);
    this.canvas.removeEventListener('keypress', this.keypress);
    this.canvas.removeEventListener('keydown', this.keydown);
    this.canvas.removeEventListener('keyup', this.keyup);
    window.removeEventListener('resize', this.resize);
  }

  // Getters
  get position() {
    return this.canvasController.position;
  }
  get currentColor() {
    return store?.getState().selectedColor || palette[0];
  }
  get canvas() {
    return this.canvasController.canvas;
  }


  // Setters
  setSelectedColor = (color: string) => {
    store?.dispatch({ type: SET_SELECTED_COLOR, payload: color });
  }


  // Actions
  resize = (e: UIEvent) => {
    const eWindow = e.target as Window;
    this.canvasController.size = {
      width: eWindow.innerWidth,
      height: eWindow.innerHeight,
    };
    this.canvas.width = this.canvasController.size.width;
    this.canvas.height = this.canvasController.size.height;
    store?.dispatch({ type: SET_SHOULD_RENDER, payload: true });
  }


  // Mouse
  mouseDown = () => {
    this.isMouseDown = true;
  }
  mouseMove = (e: MouseEvent) => {
    if (this.isMouseDown === true) {
      if (!this.isMoving) {
        this.startMove = {
          x: e.clientX,
          y: e.clientY,
        }
        this.isMoving = true;
      }
      const pixelSize = PIXEL_SIZE / this.position.zoom;
      this.canvasController.changePosition((this.startMove.x - e.clientX) / pixelSize, (this.startMove.y - e.clientY) / pixelSize);
      this.startMove = {
        x: e.clientX,
        y: e.clientY,
      }
    } else {
      this.cursorPosition = {
        x: e.clientX,
        y: e.clientY
      };
      const { coordX, coordY } = this.canvasController.canvasToCoordinates(this.cursorPosition.x, this.cursorPosition.y);
      store?.dispatch({ type: SET_CURSOR_POS, payload: { x: coordX, y: coordY }});
      if (this.shiftPressed === true)
        this.canvasController.placeUserPixel(coordX, coordY, this.currentColor);
    }
  }
  mouseUp = (e: MouseEvent) => {
    if (this.isMoving === true) {
      this.startMove = { x: 0, y: 0 };
      this.isMoving = false;
    } else {
      if (e.button === 0) {
        if (store?.getState().overlay.positionMouse) {
          store.dispatch({ type: SET_OVERLAY_POSITION_MOUSE, payload: false });
        } else {
          const { coordX, coordY } = this.canvasController.canvasToCoordinates(e.clientX, e.clientY);
          this.canvasController.placeUserPixel(coordX, coordY, this.currentColor);
        }
      }
    }
    this.isMouseDown = false
  }
  mouseEnter = () => {
    this.haveMouseOver = true;
  }
  mouseLeave = () => {
    this.haveMouseOver = false;
    this.shiftPressed = false;
    this.startMove = { x: 0, y: 0};
    this.isMoving = false;
    this.isMouseDown = false;
  }
  auxclick = (e: MouseEvent) => {
    if (e.button === 1) {
      const { coordX, coordY } = this.canvasController.canvasToCoordinates(e.clientX, e.clientY);
      const newColor = this.canvasController.getColorOnCoordinates(coordX, coordY)

      if (newColor)
        this.setSelectedColor(newColor);
      e.stopPropagation();
    }
  }
  zoom = (e: WheelEvent) => {
    const { coordX, coordY } = this.canvasController.canvasToCoordinates(e.clientX, e.clientY);
    this.canvasController.changeZoom(e.deltaY < 0 ? -2 : 2, coordX, coordY);
  }


  // Keyboard
  keydown = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'ArrowUp':
        this.canvasController.changePosition(0, -4 * this.position.zoom);
        break;
      case 'ArrowDown':
        this.canvasController.changePosition(0, 4 * this.position.zoom);
        break;
      case 'ArrowLeft':
        this.canvasController.changePosition(-4 * this.position.zoom, 0);
        break;
      case 'ArrowRight':
        this.canvasController.changePosition(4 * this.position.zoom, 0);
        break;
      case 'ShiftLeft':
        if (this.haveMouseOver) {
          this.shiftPressed = true;
          const { coordX, coordY } = this.canvasController.canvasToCoordinates(this.cursorPosition.x, this.cursorPosition.y);
          this.canvasController.placeUserPixel(coordX, coordY, this.currentColor);
        }
        break;
      case 'KeyH':
        store?.dispatch({type: SET_HISTORY_MODE_ACTIVE, payload: !store?.getState().history.activate});
        store?.dispatch({type: SET_SHOULD_RENDER, payload: true });
        break;
      case 'ControlLeft':
        const { coordX, coordY } = this.canvasController.canvasToCoordinates(this.cursorPosition.x, this.cursorPosition.y);
        const newColor = this.canvasController.getColorOnCoordinates(coordX, coordY)

        if (newColor && newColor !== store?.getState().selectedColor) {
          this.canvasController.soundController.playSound(AudioType.OPTIONS);
          this.setSelectedColor(newColor);
        }
        break;
      case 'KeyF':
        store?.dispatch({ type: SET_SEARCH, payload: !store.getState().searchActive });
        e.stopPropagation();
        e.preventDefault();
        break;
    }
  }
  keypress = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyE':
        this.canvasController.changeZoom(-2, this.position.x, this.position.y);
        break;
      case 'KeyQ':
        this.canvasController.changeZoom(2, this.position.x, this.position.y);
        break;
      case 'KeyW':
        this.canvasController.changePosition(0, -4 * this.position.zoom);
        break;
      case 'KeyS':
        this.canvasController.changePosition(0, 4 * this.position.zoom);
        break;
      case 'KeyA':
        this.canvasController.changePosition(-4 * this.position.zoom, 0);
        break;
      case 'KeyD':
        this.canvasController.changePosition(4 * this.position.zoom, 0);
        break;
      default:
        switch (e.key) {
          case 'o':
            store?.dispatch({ type: SET_OVERLAY_ACTIVATE, payload: !store.getState().overlay.activate})
            break;
          case 'g':
            store?.dispatch({ type: SET_ALERT, payload: { show: true, text: !store.getState().gridActive ? 'showGrid' : 'hideGrid', color: "#FFFD" }})
            store?.dispatch({ type: SET_GRID_ACTIVE, payload: !store.getState().gridActive });
            break;
          case 'x':
            store?.dispatch({ type: SET_ALERT, payload: { show: true, text: !store.getState().activity ? 'showActivity' : 'hideActivity', color: "#FFFD" }})
            store?.dispatch({ type: SET_ACTIVITY, payload: !store.getState().activity });
            break;
          case 'm':
            store?.dispatch({ type: SET_ALERT, payload: { show: true, text: !store.getState().sounds ? 'unmuted' : 'muted', color: "#FFFD" }})
            store?.dispatch({ type: SET_SOUNDS, payload: !store.getState().sounds });
            break;
          case 'c':
            if (navigator.clipboard) {
              const pos = store!.getState().cursorPos;
              const txt = `#p(${Math.round(pos.x)},${Math.round(pos.y)})`;
              navigator.clipboard.writeText(txt);
              store?.dispatch({ type: SET_ALERT, payload: { show: true, text: 'clipboard', color: "#FFFD" }})
            }
            break;
        }
    }
  }
  keyup = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Shift':
        this.shiftPressed = false;
    }
  }


  // Touch
  onLongTouch = (e: TouchEvent) => {
    if (this.longTouchTimeout === null)
      return;

    const { coordX, coordY } = this.canvasController.canvasToCoordinates(e.touches[0].clientX, e.touches[0].clientY);
    const newColor = this.canvasController.getColorOnCoordinates(coordX, coordY)

    if (newColor)
      this.setSelectedColor(newColor);
  }
  touchStart = (e: TouchEvent) => {
    this.longTouchTimeout = setTimeout(() => this.onLongTouch(e), 500);
    e.stopPropagation();
    e.preventDefault();
  }
  touchEnd = (e: TouchEvent) => {
    if (!this.isMoving) {
      const { coordX, coordY } = this.canvasController.canvasToCoordinates(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      this.canvasController.placeUserPixel(coordX, coordY, this.currentColor);
    }
    this.pinchDistance = 0;
    if (this.longTouchTimeout)
      clearTimeout(this.longTouchTimeout);
    this.longTouchTimeout = null;
    this.pinchDistance = 0;
    this.startMove = { x: 0, y: 0 };
    this.isMoving = false;
    this.isMouseDown = false
  }
  touchCancel = (e: TouchEvent) => {
    this.touchEnd(e);
  }
  touchLeave = (e: Event) => {
    this.touchEnd(e as TouchEvent);
  }
  touchMove = (e: TouchEvent) => {
    const touches = e.touches;

    e.preventDefault();
    const touch = touches[0];
    if (!this.isMouseDown) {
      this.startMove = {
        x: touch.clientX,
        y: touch.clientY,
      };
      this.isMouseDown = true;
    }
    const pixelSize = PIXEL_SIZE / this.position.zoom;
    const movDiff = Math.hypot(this.startMove.x - touch.clientX, this.startMove.y - touch.clientY);

    if (movDiff > 0) {
      this.isMoving = true;
      if (this.longTouchTimeout) {
        clearTimeout(this.longTouchTimeout);
      }
      this.longTouchTimeout = null;

      this.canvasController.changePosition((this.startMove.x - touch.clientX) / pixelSize, (this.startMove.y - touch.clientY) / pixelSize);
      this.startMove = {
        x: touch.clientX,
        y: touch.clientY,
      }
      if (touches.length === 2) {
        const distX = touches[0].clientX - touches[1].clientX;
        const distY = touches[0].clientY - touches[1].clientY;
        const pinchDistance = Math.hypot(distX, distY);
        if (this.pinchDistance !== 0)
          this.canvasController.changeZoom((this.pinchDistance - pinchDistance) / 10, this.position.x, this.position.y);
        this.pinchDistance = pinchDistance;
      }
    }
  }
}