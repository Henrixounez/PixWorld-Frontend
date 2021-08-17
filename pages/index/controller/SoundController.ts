import { store } from "../store";
import { CanvasController } from "./CanvasController";

export enum AudioType {
  NEUTRAL = 'NEUTRAL',
  GOOD = 'GOOD',
  BAD = 'BAD',
  OPTIONS = 'OPTIONS',
}

const audioResources = [
  {
    type: AudioType.NEUTRAL,
    source: '/sounds/neutral.wav',
  },
  {
    type: AudioType.GOOD,
    source: '/sounds/good.wav',
  },
  {
    type: AudioType.BAD,
    source: '/sounds/bad.wav',
  },
  {
    type: AudioType.OPTIONS,
    source: '/sounds/options.wav'
  }
];

export default class SoundController {
  canvasController: CanvasController;
  sounds: Array<{ type: AudioType, audio: HTMLAudioElement }> = []

  constructor(canvasController: CanvasController) {
    this.canvasController = canvasController;
    this.sounds = audioResources.map((e) => {
      const audio = new Audio(e.source);
      audio.volume = 0.2;
      return {
        type: e.type,
        audio,
      }
    });
  }

  destructor() {
    this.sounds.map((e) => {
      e.audio.remove();
    });
  }

  playSound(type: AudioType) {
    if (store?.getState().sounds) {
      const sound = this.sounds.find((e) => e.type === type);

      if (sound) {
        sound.audio.currentTime = 0;
        sound.audio.play();
      }
    }
  }
}