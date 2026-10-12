// Проверяет, какие PNG из карты ассетов уже лежат в public/assets, и (с --write-doc) пишет ASSETS.md.
// Запуск: npm run assets:check   или   npm run assets:doc
import { readFileSync, existsSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(root, 'src/data/assets.manifest.json'), 'utf8'));
const pub = join(root, 'public/assets');
const rows = Object.entries(manifest.assets).map(([key, a]) => ({ key, ...a, ok: existsSync(join(pub, a.path)) }));
const stickerDir = join(pub, manifest.stickers.folder);
const stickers = existsSync(stickerDir) ? readdirSync(stickerDir).filter((f) => /^sticker_\d\d\.png$/.test(f)) : [];
const music = existsSync(join(pub, manifest.sounds.music));

const missing = rows.filter((r) => !r.ok);
const required = missing.filter((r) => !r.optional);
console.log(`Ассеты: ${rows.length - missing.length}/${rows.length} на месте. Обязательных не хватает: ${required.length}.`);
console.log(`Стикеры: ${stickers.length}. Музыка: ${music ? 'есть' : 'нет (играет синтезированный луп)'}.`);
if (required.length) {
  console.log('\nНе хватает (обязательные):');
  for (const r of required) console.log(`  public/assets/${r.path}  — ${r.label} (${r.usedIn})`);
}

if (process.argv.includes('--write-doc')) {
  const groups = {};
  for (const r of rows) (groups[r.figma] ??= []).push(r);
  let md = '# Карта ассетов\n\nПоложи PNG по указанному пути в `public/assets/` — игра подхватит его без правок кода.\n';
  md += 'Пока файла нет, на его месте видна подписанная заглушка с этим путём.\n\n';
  md += 'Обязательно = без файла в игре будет заглушка. Необязательно = есть запасной вариант (CSS-рамка, другой спрайт или градиент).\n\n';
  for (const [g, list] of Object.entries(groups)) {
    md += `## Figma: ${g}\n\n| Файл | Что это | Где используется | Есть | Нужен |\n|---|---|---|---|---|\n`;
    for (const r of list) md += `| \`${r.path}\` | ${r.label} | ${r.usedIn} | ${r.ok ? '✅' : '—'} | ${r.optional ? 'необязательно' : 'обязательно'} |\n`;
    md += '\n';
  }
  md += `## Стикерпак\n\n\`public/assets/${manifest.stickers.folder}/sticker_01.png\`, \`sticker_02.png\` … до \`sticker_${manifest.stickers.max}.png\`. Сейчас найдено: ${stickers.length}.\n\n`;
  md += `## Звук (необязательно)\n\n- \`public/assets/${manifest.sounds.music}\` — фоновая музыка (сейчас: ${music ? 'есть' : 'нет'}).\n`;
  md += `- \`public/assets/sounds/<событие>.mp3\` заменяет синтезированный эффект. События: ${manifest.sounds.events.map((e) => `\`${e}\``).join(', ')}.\n`;
  writeFileSync(join(root, 'ASSETS.md'), md);
  console.log('\nASSETS.md обновлён.');
}
