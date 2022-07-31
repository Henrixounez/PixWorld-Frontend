import { throttle } from "lodash";
import { store } from "../store";
import { SET_ALERT, SET_CURSOR_POS, SET_MODAL, SET_SEARCH } from "../store/actions/infos";
import { SET_OVERLAY_ACTIVATE, SET_OVERLAY_POSITION_MOUSE } from "../store/actions/overlay";
import { SET_POSITION, SET_SELECTED_COLOR, SET_SHOULD_RENDER } from "../store/actions/painting";
import { SET_ACTIVITY, SET_AUTO_BRUSH, SET_GRID_ACTIVE, SET_SOUNDS } from "../store/actions/parameters";
import { SET_HISTORY_MODE_ACTIVE } from "../store/actions/history";
import { PIXEL_SIZE } from "../../constants/painting";
import { CanvasController, RENDER_REFRESH_MS } from "./CanvasController";
import { AudioType } from "./SoundController";
import ModalTypes from "../../constants/modalTypes";
import { Colors } from "../../constants/colors";

export default class InteractionController {
  canvasController: CanvasController;

  shiftPressed = false;
  rightShiftPressed = false;
  isMouseDown = false;
  isZooming = false;
  isMoving = false;
  isAutoBrushing = false;
  startMove = { x: 0, y: 0 };
  pinchDistance = 0;
  longTouchTimeout: NodeJS.Timeout | null = null;
  haveMouseOver = true;
  cursorPosition = { x: 0, y: 0 };

  constructor(canvasController: CanvasController) {
    this.canvasController = canvasController;

    this.canvas.addEventListener('mousedown', this.mouseDown);
    this.canvas.addEventListener('mousemove', this.throttledMouseMove);
    this.canvas.addEventListener('mouseup', this.mouseUp);
    this.canvas.addEventListener('mouseenter', this.mouseEnter);
    this.canvas.addEventListener('mouseleave', this.mouseLeave);
    this.canvas.addEventListener('auxclick', this.auxclick);
    this.canvas.addEventListener('wheel', this.throttledZoom);
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
    this.canvas.removeEventListener('mousemove', this.throttledMouseMove);
    this.canvas.removeEventListener('mouseup', this.mouseUp);
    this.canvas.removeEventListener('mouseenter', this.mouseEnter);
    this.canvas.removeEventListener('mouseleave', this.mouseLeave);
    this.canvas.removeEventListener('auxclick', this.auxclick);
    this.canvas.removeEventListener('wheel', this.throttledZoom);
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
    return store?.getState().selectedColor || store?.getState().canvases.find((c) => c.id === store?.getState().currentCanvas)?.palette[0] || "#FFFFFF";
  }
  get canvas() {
    return this.canvasController.canvas;
  }
  get autoBrush() {
    return store?.getState().autoBrush;
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
  mouseDown = (e: MouseEvent) => {
    this.isMouseDown = true;

    if (this.autoBrush) {
      this.isAutoBrushing = true;
      const { coordX, coordY } = this.canvasController.canvasToCoordinates(e.clientX, e.clientY);
      this.canvasController.placeUserPixel(coordX, coordY, this.currentColor);
    }
  }
  mouseMove = (e: MouseEvent) => {
    if (this.isMouseDown === true && !this.autoBrush) {
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
      if (this.shiftPressed === true || (this.isMouseDown && this.isAutoBrushing && this.autoBrush)) {
        this.canvasController.placeUserPixel(coordX, coordY, this.currentColor);
      } else if (this.rightShiftPressed == true) {
        this.canvasController.placeUserPixel(coordX, coordY, this.canvasController.getColorOnCoordinates(coordX, coordY, true));
      }
    }
  }
  throttledMouseMove = throttle(this.mouseMove, RENDER_REFRESH_MS);
  mouseUp = (e: MouseEvent) => {
    if (this.isMoving === true) {
      this.startMove = { x: 0, y: 0 };
      this.isMoving = false;
    } else {
      if (e.button === 0) {
        if (store?.getState().overlay.positionMouse) {
          store.dispatch({ type: SET_OVERLAY_POSITION_MOUSE, payload: false });
        } else if (this.isMouseDown) {
          const { coordX, coordY } = this.canvasController.canvasToCoordinates(e.clientX, e.clientY);
          this.canvasController.placeUserPixel(coordX, coordY, this.currentColor);
        }
      }
    }
    this.isMouseDown = false;
  }
  mouseEnter = () => {
    this.haveMouseOver = true;
  }
  mouseLeave = () => {
    this.haveMouseOver = false;
    this.shiftPressed = false;
    this.rightShiftPressed = false;
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
    if (store?.getState().zoomTowardCursor)
      this.canvasController.changeZoom(e.deltaY < 0 ? 0.9 : 1.1, e.clientX, e.clientY);
    else
      this.canvasController.changeZoom(e.deltaY < 0 ? 0.9 : 1.1, this.canvasController.size.width / 2, this.canvasController.size.height / 2);
  }
  throttledZoom = throttle(this.zoom, RENDER_REFRESH_MS);

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
      case 'ShiftRight':
        if (this.haveMouseOver) {
          this.rightShiftPressed = true;
          const {coordX, coordY } = this.canvasController.canvasToCoordinates(this.cursorPosition.x, this.cursorPosition.y);
          this.canvasController.placeUserPixel(coordX, coordY, this.canvasController.getColorOnCoordinates(coordX, coordY, true));
        }
        break;
      case 'KeyH':
        store?.dispatch({type: SET_HISTORY_MODE_ACTIVE, payload: !store?.getState().history.activate});
        store?.dispatch({type: SET_SHOULD_RENDER, payload: true });

        if (store?.getState().history.activate) {
          if (store?.getState().position.zoom > 25) {
            store?.dispatch({ type: SET_POSITION, payload: { ...this.position, zoom: 25 } });
          }
        }
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
        this.canvasController.changeZoom(0.9, this.canvasController.size.width / 2, this.canvasController.size.height / 2);
        break;
      case 'KeyQ':
        this.canvasController.changeZoom(1.1, this.canvasController.size.width / 2, this.canvasController.size.height / 2);
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
      case 'KeyO':
        store?.dispatch({ type: SET_OVERLAY_ACTIVATE, payload: !store.getState().overlay.activate})
        break;
      case 'KeyG':
        store?.dispatch({ type: SET_ALERT, payload: { show: true, text: !store.getState().gridActive ? 'showGrid' : 'hideGrid', color: Colors.UI_BACKGROUND }})
        store?.dispatch({ type: SET_GRID_ACTIVE, payload: !store.getState().gridActive });
        break;
      case 'KeyX':
        store?.dispatch({ type: SET_ALERT, payload: { show: true, text: !store.getState().activity ? 'showActivity' : 'hideActivity', color: Colors.UI_BACKGROUND }})
        store?.dispatch({ type: SET_ACTIVITY, payload: !store.getState().activity });
        break;
      case 'KeyB':
        store?.dispatch({ type: SET_MODAL, payload: ModalTypes.BOOKMARKS });
        break;
      case 'KeyU':
        store?.dispatch({ type: SET_AUTO_BRUSH, payload: !store.getState().autoBrush });
        break;
      case 'KeyL':
        this.canvasController.setZoom(PIXEL_SIZE);
        break;
      default:
        switch (e.key) {
          case 'm':
            store?.dispatch({ type: SET_ALERT, payload: { show: true, text: !store.getState().sounds ? 'unmuted' : 'muted', color: Colors.UI_BACKGROUND }})
            store?.dispatch({ type: SET_SOUNDS, payload: !store.getState().sounds });
            break;
          case 'C':
            if (navigator.clipboard) {
              const pos = store!.getState().position;
              const txt = window.location.origin + `?pos="${store?.getState().canvases.find((e) => e.id === store?.getState().currentCanvas)?.letter}(${Math.round(pos.x)},${Math.round(pos.y)},${Math.round(pos.zoom)})"`;
              navigator.clipboard.writeText(txt);
              store?.dispatch({ type: SET_ALERT, payload: { show: true, text: 'clipboard', color: Colors.UI_BACKGROUND }})
            }
            break;
          case 'c':
            if (navigator.clipboard) {
              const pos = store!.getState().cursorPos;
              const pos2 = store!.getState().position;
              const txt = `#${store?.getState().canvases.find((e) => e.id === store?.getState().currentCanvas)?.letter}(${Math.round(pos.x)},${Math.round(pos.y)},${Math.round(pos2.zoom)})`;
              navigator.clipboard.writeText(txt);
              store?.dispatch({ type: SET_ALERT, payload: { show: true, text: 'clipboard', color: Colors.UI_BACKGROUND }})
            }
            break;
        }
    }
  }
  keyup = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'ShiftLeft':
        this.shiftPressed = false;
        break;
      case 'ShiftRight':
        this.rightShiftPressed = false;
        break;
    }
  }


  // Touch
  onLongTouch = (e: TouchEvent) => {
    if (this.longTouchTimeout === null || this.autoBrush)
      return;

    const { coordX, coordY } = this.canvasController.canvasToCoordinates(e.touches[0].clientX, e.touches[0].clientY);
    const newColor = this.canvasController.getColorOnCoordinates(coordX, coordY)

    if (newColor)
      this.setSelectedColor(newColor);
  }
  touchStart = (e: TouchEvent) => {
    this.longTouchTimeout = setTimeout(() => this.onLongTouch(e), 500);
    if (e.touches.length === 1) {
      this.isAutoBrushing = true;
    } else {
      this.isAutoBrushing = false;
    }
    e.stopPropagation();
    e.preventDefault();
  }
  touchEnd = (e: TouchEvent) => {
    if (e.touches.length === 0) {
      if (!this.isMoving && this.pinchDistance === 0) {
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
      this.isMouseDown = false;
      this.isZooming = false;
      this.isAutoBrushing = false;
    }
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
    if (touches.length === 1 && this.autoBrush) {
      if (this.isAutoBrushing) {
        const { coordX, coordY } = this.canvasController.canvasToCoordinates(touch.clientX, touch.clientY);
        this.canvasController.placeUserPixel(coordX, coordY, this.currentColor);
      }
    } else {
      if (!this.isMouseDown || (this.isZooming && touches.length === 1)) {
        this.startMove = {
          x: touch.clientX,
          y: touch.clientY,
        };
        this.isMouseDown = true;
        if (touches.length === 1)
          this.isZooming = false;
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
          this.isZooming = true;
          const distX = touches[0].clientX - touches[1].clientX;
          const distY = touches[0].clientY - touches[1].clientY;
          const pinchDistance = Math.hypot(distX, distY);
          if (this.pinchDistance !== 0) {
            const pinchDiff = (this.pinchDistance - pinchDistance) / 10;
            if (store?.getState().zoomTowardCursor)
              this.canvasController.changeZoom(pinchDiff < 0 ? 0.95 : 1.05, touches[1].clientX + distX / 2, touches[1].clientY + distY / 2);
            else
              this.canvasController.changeZoom(pinchDiff < 0 ? 0.95 : 1.05, this.canvasController.size.width / 2, this.canvasController.size.height / 2);
          }
          this.pinchDistance = pinchDistance;
        }
      }
    }
  }
}