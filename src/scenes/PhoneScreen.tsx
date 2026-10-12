import { useEffect, useState } from 'react';
import { Sprite } from '../components/Sprite';

/** Телефон: сенсорный экран, у которого короткая сторона меньше 600px. Планшеты и компьютеры проходят. */
const isPhone = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: coarse)').matches &&
  Math.min(window.innerWidth, window.innerHeight) < 600;

export function useIsPhone() {
  const [phone, setPhone] = useState(isPhone);
  useEffect(() => {
    const on = () => setPhone(isPhone());
    window.addEventListener('resize', on);
    window.addEventListener('orientationchange', on);
    return () => { window.removeEventListener('resize', on); window.removeEventListener('orientationchange', on); };
  }, []);
  return phone;
}

/** Вместо игры на телефоне: стикер и рамка диалога от Карини */
export function PhoneScreen() {
  return (
    <div className="phone-screen">
      <Sprite asset="mobile.sticker" w={262} h={262} className="phone-sticker anim-pop" alt="Карини, Рафи и Макака с тортом" />
      <div className="phone-text">
        <Sprite asset="mobile.dialog" w={373} h={76} className="phone-dialog" alt="карини: С ДР, Рафи!!" />
        <p className="phone-note">Игра открывается на планшете или компьютере. Зайди по этой же ссылке с них ♡</p>
      </div>
    </div>
  );
}
