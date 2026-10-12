/**
 * Звуковая система.
 * - Эффекты синтезируются через Web Audio API (файлов звуков в Figma нет).
 *   Если положить public/assets/sounds/<event>.mp3, будет играть файл вместо синтеза.
 * - Фоновая музыка: public/assets/sounds/music.mp3. Если файла нет — играет тихий синтезированный луп.
 * - Ничего не звучит до первого действия пользователя (политика autoplay браузеров).
 */
import manifest from '../data/assets.manifest.json';
import { assetUrl } from '../utils/assets';

export type SoundEvent =
  | 'click' | 'hover' | 'dialogue' | 'gift_collect' | 'wrong_item' | 'victory' | 'achievement'
  | 'monkey_laugh' | 'hit' | 'candle_blow' | 'chest_open' | 'final_reward' | 'glitch' | 'fix';

type Note = [freq: number, dur: number, type?: OscillatorType, vol?: number];

const N: Record<string, number> = {
  C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2, G4: 392, A4: 440, B4: 493.9,
  C5: 523.3, D5: 587.3, E5: 659.3, F5: 698.5, G5: 784, A5: 880, B5: 987.8, C6: 1046.5,
  Bb4: 466.2, R: 0,
};

const SFX: Record<SoundEvent, Note[]> = {
  click: [[N.C5, 0.04, 'square', 0.12]],
  hover: [[N.G5, 0.025, 'square', 0.05]],
  dialogue: [[N.A4, 0.02, 'square', 0.04]],
  gift_collect: [[N.E5, 0.06, 'square', 0.12], [N.A5, 0.09, 'square', 0.12]],
  wrong_item: [[N.D4, 0.09, 'sawtooth', 0.1], [N.C4, 0.14, 'sawtooth', 0.1]],
  victory: [[N.C5, 0.1, 'square'], [N.E5, 0.1, 'square'], [N.G5, 0.1, 'square'], [N.C6, 0.3, 'square']],
  achievement: [[N.G5, 0.08, 'triangle', 0.2], [N.C6, 0.08, 'triangle', 0.2], [N.E5, 0.08, 'triangle', 0.2], [N.C6, 0.2, 'triangle', 0.2]],
  monkey_laugh: [[N.A5, 0.05, 'sawtooth', 0.07], [N.E5, 0.05, 'sawtooth', 0.07], [N.A5, 0.05, 'sawtooth', 0.07], [N.E5, 0.05, 'sawtooth', 0.07], [N.A5, 0.08, 'sawtooth', 0.07]],
  hit: [[110, 0.08, 'square', 0.18], [80, 0.1, 'square', 0.12]],
  candle_blow: [[N.E5, 0.05, 'triangle', 0.08], [N.C5, 0.08, 'triangle', 0.06]],
  chest_open: [[N.C5, 0.08, 'triangle'], [N.G5, 0.08, 'triangle'], [N.C6, 0.08, 'triangle'], [N.E5, 0.08, 'triangle'], [N.G5, 0.3, 'triangle']],
  final_reward: [[N.C5, 0.12, 'triangle'], [N.E5, 0.12, 'triangle'], [N.G5, 0.12, 'triangle'], [N.C6, 0.12, 'triangle'], [N.G5, 0.12, 'triangle'], [N.C6, 0.5, 'triangle']],
  glitch: [[60, 0.05, 'sawtooth', 0.15], [1200, 0.03, 'square', 0.08], [90, 0.08, 'sawtooth', 0.15], [1500, 0.03, 'square', 0.06]],
  fix: [[N.C5, 0.05, 'square', 0.1], [N.G5, 0.08, 'square', 0.1]],
};

/** «С днём рождения тебя» — народная мелодия, для экрана желания */
const BIRTHDAY_SONG: Note[] = [
  [N.G4, 0.3], [N.G4, 0.15], [N.A4, 0.45], [N.G4, 0.45], [N.C5, 0.45], [N.B4, 0.9],
  [N.G4, 0.3], [N.G4, 0.15], [N.A4, 0.45], [N.G4, 0.45], [N.D5, 0.45], [N.C5, 0.9],
  [N.G4, 0.3], [N.G4, 0.15], [N.G5, 0.45], [N.E5, 0.45], [N.C5, 0.45], [N.B4, 0.45], [N.A4, 0.9],
  [N.F5, 0.3], [N.F5, 0.15], [N.E5, 0.45], [N.C5, 0.45], [N.D5, 0.45], [N.C5, 1.2],
];

/** Тихий фоновый луп, если music.mp3 не положили */
const LOOP: Note[] = [
  [N.C5, 0.25], [N.E5, 0.25], [N.G5, 0.25], [N.E5, 0.25], [N.A4, 0.25], [N.C5, 0.25], [N.E5, 0.25], [N.C5, 0.25],
  [N.F4, 0.25], [N.A4, 0.25], [N.C5, 0.25], [N.A4, 0.25], [N.G4, 0.25], [N.B4, 0.25], [N.D5, 0.25], [N.B4, 0.25],
];

class SoundSystem {
  private ctx: AudioContext | null = null;
  private sfxEnabled = true;
  private musicEnabled = true;
  private unlocked = false;
  private fileSfx = new Map<string, HTMLAudioElement>();
  private music: HTMLAudioElement | null = null;
  private musicFileOk: boolean | null = null;
  private loopTimer: number | null = null;
  private musicSuspended = false;

  constructor() {
    if (typeof window === 'undefined') return;
    for (const ev of manifest.sounds.events) {
      const a = new Audio();
      a.preload = 'auto';
      a.addEventListener('canplaythrough', () => this.fileSfx.set(ev, a), { once: true });
      a.src = assetUrl(`sounds/${ev}.mp3`);
    }
    const m = new Audio();
    m.loop = true;
    m.volume = 0.35;
    m.addEventListener('canplaythrough', () => {
      this.musicFileOk = true;
      // файл догрузился, пока играл синтезированный луп — переключаемся на файл
      if (this.loopTimer !== null) {
        this.stopMusic();
        this.startMusic();
      }
    }, { once: true });
    m.addEventListener('error', () => { this.musicFileOk = false; }, { once: true });
    m.src = assetUrl(manifest.sounds.music);
    this.music = m;

    const unlock = () => {
      this.unlocked = true;
      this.getCtx();
      this.startMusic();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
  }

  private getCtx(): AudioContext | null {
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  private playNotes(notes: Note[], baseVol = 0.15, startAt = 0): number {
    const ctx = this.getCtx();
    if (!ctx) return 0;
    let t = ctx.currentTime + startAt;
    for (const [freq, dur, type = 'square', vol = baseVol] of notes) {
      if (freq > 0) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.95);
        osc.connect(g).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + dur);
      }
      t += dur;
    }
    return t - ctx.currentTime;
  }

  setSfxEnabled(v: boolean) { this.sfxEnabled = v; }

  setMusicEnabled(v: boolean) {
    this.musicEnabled = v;
    if (v) this.startMusic();
    else this.stopMusic();
  }

  play(ev: SoundEvent) {
    if (!this.sfxEnabled || !this.unlocked) return;
    const file = this.fileSfx.get(ev);
    if (file) {
      const c = file.cloneNode() as HTMLAudioElement;
      c.volume = 0.6;
      void c.play().catch(() => undefined);
      return;
    }
    this.playNotes(SFX[ev]);
  }

  startMusic() {
    if (!this.musicEnabled || !this.unlocked || this.musicSuspended) return;
    if (this.musicFileOk && this.music) {
      void this.music.play().catch(() => undefined);
      return;
    }
    if (this.loopTimer !== null) return;
    const tick = () => {
      const len = this.playNotes(LOOP, 0.025);
      this.loopTimer = window.setTimeout(tick, Math.max(1000, len * 1000));
    };
    tick();
  }

  stopMusic() {
    this.music?.pause();
    if (this.loopTimer !== null) {
      window.clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
  }

  /** Короткая остановка музыки (glitch в кат-сцене) */
  pauseMusicFor(ms: number) {
    this.musicSuspended = true;
    this.stopMusic();
    window.setTimeout(() => {
      this.musicSuspended = false;
      this.startMusic();
    }, ms);
  }

  /** Сыграть «С днём рождения» поверх тихой музыки */
  playBirthdaySong() {
    if (!this.unlocked || !this.sfxEnabled) return;
    this.musicSuspended = true;
    this.stopMusic();
    const len = this.playNotes(BIRTHDAY_SONG.map(([f, d]) => [f, d, 'triangle', 0.16] as Note));
    window.setTimeout(() => {
      this.musicSuspended = false;
      this.startMusic();
    }, len * 1000 + 300);
  }
}

export const sound = new SoundSystem();
