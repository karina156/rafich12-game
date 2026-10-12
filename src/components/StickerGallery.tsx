import { useEffect, useState, type ReactNode } from 'react';
import { stickerUrls } from '../utils/assets';
import manifest from '../data/assets.manifest.json';

/** Ищет sticker_01.png … sticker_NN.png и показывает все найденные */
function useStickers() {
  const [list, setList] = useState<string[] | null>(null);
  useEffect(() => {
    let alive = true;
    const urls = stickerUrls();
    Promise.all(
      urls.map((u) => new Promise<string | null>((res) => {
        const img = new Image();
        img.onload = () => res(u);
        img.onerror = () => res(null);
        img.src = u;
      })),
    ).then((r) => alive && setList(r.filter((x): x is string => !!x)));
    return () => { alive = false; };
  }, []);
  return list;
}

/** Рамка экрана стикеров (rewards/frame.png): стикеры в окне рамки, подпись на табличке снизу */
function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="sticker-frame">
      <div className="sticker-frame-inner">{children}</div>
      <div className="sticker-frame-caption">РАФИНИ.EXE ♡</div>
    </div>
  );
}

export function StickerGallery() {
  const list = useStickers();
  const [open, setOpen] = useState<number | null>(null);

  if (list === null) return <Frame><div className="stickers-empty">Загружаю стикеры...</div></Frame>;
  if (list.length === 0) {
    return (
      <Frame><div className="stickers-empty">
        Стикеры ещё не добавлены. Положи PNG в <code>public/assets/{manifest.stickers.folder}/</code> с именами
        <code> sticker_01.png</code>, <code>sticker_02.png</code> … — галерея найдёт их сама.
      </div></Frame>
    );
  }
  const go = (d: number) => setOpen((i) => (i === null ? 0 : (i + d + list.length) % list.length));
  return (
    <>
      <Frame><div className={`stickers ${list.length === 1 ? 'stickers-one' : list.length <= 4 ? 'stickers-few' : ''}`}>
        {list.map((u, i) => (
          <button key={u} className="sticker" onClick={() => setOpen(i)} style={{ animationDelay: `${i * 60}ms` }}>
            <img src={u} alt={`Стикер ${i + 1}`} draggable={false} />
          </button>
        ))}
      </div></Frame>
      {open !== null && (
        <div className="sticker-view" onClick={() => setOpen(null)}>
          <button className="sv-arrow" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Предыдущий">◀</button>
          <img src={list[open]} alt={`Стикер ${open + 1}`} onClick={(e) => e.stopPropagation()} />
          <button className="sv-arrow" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Следующий">▶</button>
          <div className="sv-count">{open + 1}/{list.length} · нажми мимо, чтобы закрыть</div>
        </div>
      )}
    </>
  );
}
