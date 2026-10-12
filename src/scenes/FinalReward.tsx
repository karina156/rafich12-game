import { sound } from '../audio/sound';
import { useEffect, useState } from 'react';
import { useGame } from '../store/gameStore';
import { getCharacter } from '../data/characters';
import { FINAL_TALK } from '../data/dialogues';
import { DialogueBox } from '../components/DialogueBox';
import { RewardChest } from '../components/RewardChest';
import { StickerGallery } from '../components/StickerGallery';
import { PixelButton } from '../components/PixelButton';
import { Modal } from '../components/Modal';
import { ConfettiEffect } from '../components/ConfettiEffect';
import { SceneBackground } from '../components/SceneBackground';
import { Karini } from '../characters/Karini';
import { Raf } from '../characters/Raf';
import { TELEGRAM_STICKERPACK_URL } from '../config';
import { useTimers } from '../hooks/useTimers';

const STATUS = [
  'BIRTHDAY RESTORED: 100%',
  '',
  'PLAYER: RAFICH12_',
  'LEVEL: 19',
  '',
  'MONKEY: DEFEATED',
  'PARTY: SAVED',
  'GIFT: UNLOCKED',
];

type Step = 'status' | 'talk' | 'chest' | 'reward';

export function FinalReward() {
  const unlocked = useGame((s) => s.stickerPackUnlocked);
  const char = useGame((s) => getCharacter(s.selectedCharacter));
  const finishGame = useGame((s) => s.finishGame);
  const goTo = useGame((s) => s.goTo);
  const timers = useTimers();
  const [step, setStep] = useState<Step>(unlocked ? 'reward' : 'status');
  const [lines, setLines] = useState(0);
  const [tgMissing, setTgMissing] = useState(false);

  useEffect(() => {
    if (step !== 'status') return;
    STATUS.forEach((_, i) => timers.after(300 + i * 350, () => setLines(i + 1)));
    timers.after(300 + STATUS.length * 350 + 1200, () => setStep((st) => (st === 'status' ? 'talk' : st)));
  }, [step, timers]);

  const openTelegram = () => setTgMissing(true);

  return (
    <div className="final">
      <SceneBackground asset="final.bg" />
      {step === 'status' && (
        <pre className="boot final-status" onClick={() => setStep('talk')}>
          {STATUS.slice(0, lines).join('\n')}
        </pre>
      )}

      {step === 'talk' && (
        <>
          <div className="final-duo">
            <Raf size={170} />
            <Karini emotion="shy" size={170} />
          </div>
          <DialogueBox
            id="final:talk"
            lines={[...FINAL_TALK, { speaker: 'karini', text: char.finalLine, emotion: 'happy' }]}
            onDone={() => setStep('chest')}
          />
        </>
      )}

      {step === 'chest' && (
        <div className="final-chest">
          <RewardChest onOpened={() => { finishGame(); setStep('reward'); }} />
        </div>
      )}

      {step === 'reward' && (
        <div className="final-reward">
          <ConfettiEffect count={50} />
          <div className="legendary anim-pop">
            <div className="legendary-kicker">LEGENDARY REWARD UNLOCKED!</div>
            <h1 className="legendary-title">РАФИНИ.EXE ♡</h1>
            <div className="legendary-meta">Редкость: <b>LEGENDARY</b> · Создано специально для rafich12_</div>
          </div>
          <StickerGallery />
          <div className="letter">
            <p>Рафик, с 19-летием! Теперь у нас есть собственный стикерпак, чтобы официально засорять друг другу чат.</p>
            <p>Я очень хотела сделать для тебя что-то необычное, смешное и только наше.</p>
            <p>Спасибо, что ты есть. Надеюсь, этот маленький дурдом заставил тебя улыбнуться.</p>
            <p>С днём рождения, мой любимый Раф ♡<br />— твоя Карини</p>
          </div>
          <div className="row center">
            {TELEGRAM_STICKERPACK_URL ? (
              // настоящая ссылка, а не window.open: так она открывается в любом браузере и во встроенном просмотре
              <a className="pbtn pbtn-pink pbtn-lg pbtn-link" href={TELEGRAM_STICKERPACK_URL} target="_blank" rel="noopener noreferrer" onClick={() => sound.play('click')}>
                <span className="pbtn-inner">ЗАБРАТЬ СТИКЕРПАК В ТГ ♡</span>
              </a>
            ) : (
              <PixelButton size="lg" variant="pink" onClick={openTelegram}>ЗАБРАТЬ СТИКЕРПАК В ТГ ♡</PixelButton>
            )}
          </div>
          <div className="row center">
            <PixelButton variant="ghost" size="sm" onClick={() => goTo('credits')}>ДАЛЬШЕ ▶</PixelButton>
            <PixelButton variant="ghost" size="sm" onClick={() => setStep('chest')}>ОТКРЫТЬ СУНДУК ЕЩЁ РАЗ</PixelButton>
          </div>
        </div>
      )}

      {tgMissing && (
        <Modal title="ССЫЛКА НЕ ЗАДАНА" onClose={() => setTgMissing(false)}>
          <p>Ссылка на Telegram-стикерпак ещё не добавлена.</p>
          <p className="muted">
            Создай файл <code>.env</code> в корне проекта со строкой
            <br /><code>VITE_TELEGRAM_STICKERPACK_URL=https://t.me/addstickers/...</code>
            <br />и перезапусти <code>npm run dev</code> / пересобери <code>npm run build</code>.
          </p>
        </Modal>
      )}
    </div>
  );
}
