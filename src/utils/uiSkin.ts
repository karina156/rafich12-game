import { assetDef, assetUrl, probeImage, subscribeImage, imageStatus } from './assets';
import type { AssetKey } from '../types/game';

/**
 * Если в public/assets/ui/ лежат PNG рамок и кнопок из Figma,
 * они подключаются как border-image (через CSS-переменные и класс на <html>).
 * Пока файлов нет, используется пиксельная CSS-рамка в той же палитре.
 * Толщину среза (slice) можно подстроить в styles/variables.css (--skin-slice-*).
 */
const SKINS: [AssetKey, string][] = [
  ['ui.button', 'button'],
  ['ui.buttonHover', 'button-hover'],
  ['ui.buttonPressed', 'button-pressed'],
  ['ui.dialog', 'dialog'],
  ['ui.panel', 'panel'],
  ['ui.button2', 'button2'],
  ['ui.button2Hover', 'button2-hover'],
  ['ui.button2Pressed', 'button2-pressed'],
  ['ui.barHeart', 'bar-heart'],
  ['final.bg', 'meadow'],
  ['room.base', 'room'],
  ['final.frame', 'frame'],
  ['ui.hudL', 'hud-l'],
  ['ui.hudM', 'hud-m'],
  ['ui.hudC', 'hud-c'],
  ['ui.hudR', 'hud-r'],
];

export function initUiSkin() {
  const root = document.documentElement;
  for (const [key, name] of SKINS) {
    const url = assetUrl(assetDef(key).path);
    const apply = () => {
      if (imageStatus(url) === 'ok') {
        // абсолютный адрес: относительный url() в CSS-переменной считался бы от папки со стилями
        root.style.setProperty(`--skin-${name}`, `url("${new URL(url, document.baseURI).href}")`);
        root.classList.add(`skin-${name}`);
      }
    };
    probeImage(url);
    subscribeImage(url, apply);
    apply();
  }
}
