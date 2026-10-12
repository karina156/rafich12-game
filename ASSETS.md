# Карта ассетов

Положи PNG по указанному пути в `public/assets/` — игра подхватит его без правок кода.
Пока файла нет, на его месте видна подписанная заглушка с этим путём.

Обязательно = без файла в игре будет заглушка. Необязательно = есть запасной вариант (CSS-рамка, другой спрайт или градиент).

## Figma: characters

| Файл | Что это | Где используется | Есть | Нужен |
|---|---|---|---|---|
| `characters/raf/worker.png` | Раф-работяга | выбор Рафа, HUD, босс, финал | ✅ | обязательно |
| `characters/raf/lover.png` | Влюблённый Раф | выбор Рафа, HUD, босс, финал | ✅ | обязательно |
| `characters/raf/cute.png` | Милый Раф | выбор Рафа, HUD, босс, финал | — | необязательно |
| `characters/raf/lavender.png` | Лавандовый Раф | выбор Рафа, HUD, босс, финал | — | необязательно |
| `characters/raf/sigma.png` | Раф-сигма | выбор Рафа, HUD, босс, финал | — | необязательно |
| `characters/raf/grandpa.png` | Раф-дед | выбор Рафа, HUD, босс, финал | ✅ | обязательно |
| `characters/karini/idle.png` | Карини idle | диалоги везде | ✅ | обязательно |
| `characters/karini/happy.png` | Карини happy | диалоги везде | ✅ | обязательно |
| `characters/karini/angry.png` | Карини angry | диалоги везде | ✅ | обязательно |
| `characters/karini/shocked.png` | Карини shocked | диалоги везде | ✅ | обязательно |
| `characters/karini/crying.png` | Карини crying | диалоги везде | ✅ | обязательно |
| `characters/karini/shy.png` | Карини shy | диалоги, финал | ✅ | обязательно |
| `characters/karini/party.png` | Карини в колпаке | вступительная кат-сцена (если нет — берётся happy) | — | необязательно |
| `characters/karini/full.png` | Карини в полный рост | запас: полный рост для сцен | ✅ | необязательно |
| `characters/monkey/laugh.png` | Макака laugh | диалоги, мини-игры, босс | ✅ | обязательно |
| `characters/monkey/angry.png` | Макака angry | диалоги, босс | ✅ | обязательно |
| `characters/monkey/shocked.png` | Макака shocked | босс, кофейная ульта | ✅ | обязательно |
| `characters/monkey/banana.png` | Макака banana | подарочный дождь, босс фаза 1 | ✅ | обязательно |
| `characters/monkey/gift.png` | Макака gift | интро (крадёт подарок) | ✅ | обязательно |
| `characters/monkey/crying.png` | Макака crying | победа над боссом, посткредиты | ✅ | обязательно |
| `characters/monkey/big.png` | Макака-босс | запас: крупная поза для босса | ✅ | необязательно |

## Figma: general elements

| Файл | Что это | Где используется | Есть | Нужен |
|---|---|---|---|---|
| `backgrounds/start.png` | Фон старта | экран запуска | — | необязательно |
| `backgrounds/intro.png` | Фон кат-сцены | вступление | — | необязательно |
| `backgrounds/select.png` | Фон выбора Рафа | выбор персонажа | — | необязательно |
| `room/room_base.png` | Основа комнаты | комната (960x540) | ✅ | обязательно |
| `room/rug.png` | Ковёр | комната | ✅ | обязательно |
| `room/bed.png` | Кровать | комната | ✅ | обязательно |
| `room/wardrobe.png` | Книжный шкаф | комната | ✅ | обязательно |
| `room/desk.png` | Стол | комната, вход в Cake Builder | ✅ | обязательно |
| `room/monitor.png` | Монитор | комната | ✅ | обязательно |
| `room/chair.png` | Стул | комната | ✅ | обязательно |
| `room/lamp.png` | Лампа | комната | ✅ | обязательно |
| `room/coffee_machine.png` | Кофе (5 тапов) | комната, секретный уровень | ✅ | обязательно |
| `room/door.png` | Дверь / арена | нарисовано на room_base, зона клика: вход к боссу | — | необязательно |
| `room/window.png` | Окно | нарисовано на room_base, зона клика: вход в Gift Rain | — | необязательно |
| `room/boxes.png` | Коробки | комната, вход в Find the Gift | ✅ | обязательно |
| `room/garland_off.png` | Гирлянда выкл. | комната до Party Chaos | ✅ | обязательно |
| `room/garland_on.png` | Гирлянда вкл. | комната после Party Chaos | ✅ | обязательно |
| `room/balloons_broken.png` | Шарики сдутые | комната до Party Chaos | ✅ | обязательно |
| `room/balloons.png` | Шарики | комната после Party Chaos | ✅ | обязательно |
| `room/banner.png` | Растяжка | комната после Party Chaos | ✅ | обязательно |
| `room/gifts_pile.png` | Подарки | комната после уровня 1 | ✅ | обязательно |
| `room/cake.png` | Торт на столе | комната после уровня 2 | ✅ | обязательно |
| `room/candles.png` | Свечи | комната после уровня 3 | ✅ | обязательно |
| `room/cake_stand.png` | Столик для торта | комната | ✅ | обязательно |
| `room/confetti.png` | Конфетти на полу | комната после Party Chaos | ✅ | необязательно |
| `room/party_hat.png` | Колпак | комната после Party Chaos | ✅ | необязательно |
| `ui/button.png` | Кнопка | все кнопки (border-image, текст поверх) | ✅ | необязательно |
| `ui/button_hover.png` | Кнопка hover | все кнопки | ✅ | необязательно |
| `ui/button_pressed.png` | Кнопка pressed | все кнопки | ✅ | необязательно |
| `ui/dialog_frame.png` | Рамка диалога | DialogueBox (border-image) | ✅ | необязательно |
| `ui/panel.png` | Панель | модалки, HUD, карточки (border-image) | ✅ | необязательно |
| `ui/button2.png` | Кнопка 2 | второстепенные кнопки (border-image) | ✅ | необязательно |
| `ui/button2_hover.png` | Кнопка 2 hover | второстепенные кнопки | ✅ | необязательно |
| `ui/button2_pressed.png` | Кнопка 2 pressed | второстепенные кнопки | ✅ | необязательно |
| `ui/bar_heart.png` | Рамка HP-бара | полоски HP и прогресса | ✅ | необязательно |
| `ui/icon_coin.png` | Монета | HUD | ✅ | обязательно |
| `ui/icon_bag.png` | Инвентарь | HUD | ✅ | обязательно |
| `ui/icon_trophy.png` | Достижения | HUD | ✅ | обязательно |
| `ui/icon_settings.png` | Настройки | HUD | ✅ | обязательно |
| `ui/icon_sound_on.png` | Звук вкл | HUD | ✅ | обязательно |
| `ui/icon_lock.png` | Замок | комната (закрытые уровни) | ✅ | обязательно |
| `ui/icon_heart.png` | Сердце | HP-бары | ✅ | обязательно |
| `ui/icon_star.png` | Звезда | маркеры, достижения | ✅ | обязательно |

## Figma: hud_panel_medium

| Файл | Что это | Где используется | Есть | Нужен |
|---|---|---|---|---|
| `ui/hud_l.png` | Плашка уровня (левый край) | название уровня сверху | ✅ | необязательно |
| `ui/hud_m.png` | Плашка уровня (середина) | название уровня сверху | ✅ | необязательно |
| `ui/hud_c.png` | Плашка уровня (центр) | название уровня сверху | ✅ | необязательно |
| `ui/hud_r.png` | Плашка уровня (правый край) | название уровня сверху | ✅ | необязательно |

## Figma: assets of mini games

| Файл | Что это | Где используется | Есть | Нужен |
|---|---|---|---|---|
| `items/gift_red.png` | Подарок красный | Gift Rain, инвентарь | ✅ | обязательно |
| `items/gift_blue.png` | Подарок синий | Gift Rain, боссовая атака | ✅ | обязательно |
| `items/gift_purple.png` | Подарок фиолет. | Gift Rain | ✅ | обязательно |
| `items/gift_yellow.png` | Подарок жёлтый | Gift Rain | ✅ | обязательно |
| `items/big_gift.png` | Большой подарок | интро | ✅ | обязательно |
| `items/sock.png` | Носок | Gift Rain, плохой торт | ✅ | обязательно |
| `items/banana.png` | Банан | Gift Rain, босс | ✅ | обязательно |
| `items/star.png` | Бонус-звезда | Gift Rain | ✅ | обязательно |
| `items/golden_key.png` | Золотой ключ | Find the Gift, инвентарь | ✅ | обязательно |
| `items/candle.png` | Свеча (предмет) | 19 свечей: поиск | ✅ | обязательно |
| `cake/plate.png` | Подставка для торта | Cake Builder | ✅ | необязательно |
| `cake/base_vanilla.png` | Корж ванильный | Cake Builder | ✅ | обязательно |
| `cake/base_chocolate.png` | Корж шоколадный | Cake Builder | ✅ | обязательно |
| `cake/cream_pink.png` | Крем розовый | Cake Builder | ✅ | обязательно |
| `cake/cream_lavender.png` | Крем лавандовый | Cake Builder | ✅ | обязательно |
| `cake/berries.png` | Ягоды | Cake Builder | ✅ | обязательно |
| `cake/cherry.png` | Вишня | Cake Builder | ✅ | обязательно |
| `cake/whipped_cream.png` | Сливки | Cake Builder | ✅ | обязательно |
| `cake/bad_cucumber.png` | Огурец | Cake Builder (плохое) | ✅ | обязательно |
| `cake/bad_ketchup.png` | Кетчуп | Cake Builder, кофейня (плохое) | ✅ | обязательно |
| `cake/bad_fish.png` | Рыба | Cake Builder (плохое) | ✅ | обязательно |
| `cake/bad_broccoli.png` | Брокколи | Cake Builder (плохое) | ✅ | обязательно |
| `cake/bad_sneaker.png` | Кроссовок | Cake Builder (плохое) | ✅ | обязательно |
| `cake/bad_banana_peel.png` | Банан. кожура | Cake Builder (плохое) | ✅ | обязательно |
| `candles/cake_big.png` | Торт для свечей | 19 свечей: задувание | ✅ | обязательно |
| `candles/unlit.png` | Свеча unlit | 19 свечей | ✅ | обязательно |
| `candles/lit.png` | Свеча lit | 19 свечей | ✅ | обязательно |
| `candles/extinguished.png` | Свеча потушена | 19 свечей | ✅ | обязательно |
| `candles/relit.png` | Свеча relit | 19 свечей | ✅ | обязательно |
| `boxes/closed.png` | Коробка закрыта | Find the Gift | ✅ | обязательно |
| `boxes/open_key.png` | Коробка с ключом | Find the Gift | ✅ | обязательно |
| `boxes/open_empty.png` | Коробка пустая | Find the Gift (ошибка) | — | необязательно |
| `party/balloon_popped.png` | Шарик лопнул | Party Chaos | ✅ | обязательно |
| `party/balloon.png` | Шарик целый | Party Chaos | ✅ | обязательно |
| `party/garland_off.png` | Гирлянда выкл | Party Chaos | ✅ | обязательно |
| `party/garland_on.png` | Гирлянда вкл | Party Chaos | ✅ | обязательно |
| `party/speaker_off.png` | Колонка выкл | Party Chaos | ✅ | обязательно |
| `party/speaker_on.png` | Колонка играет | Party Chaos | ✅ | обязательно |
| `party/gift_fallen.png` | Подарок упал | Party Chaos | ✅ | обязательно |
| `party/gift_up.png` | Подарок стоит | Party Chaos | ✅ | обязательно |
| `party/popper_broken.png` | Хлопушка сломана | Party Chaos | ✅ | обязательно |
| `party/popper_burst.png` | Хлопушка бах | Party Chaos | ✅ | обязательно |
| `coffee/cafe_bg.png` | Фон кофейни | секретная кофейня | ✅ | необязательно |
| `coffee/cup_empty.png` | Пустая чашка | кофейня | ✅ | обязательно |
| `coffee/cup_espresso.png` | Чашка + эспрессо | кофейня | ✅ | необязательно |
| `coffee/cup_coconut.png` | Чашка + молоко | кофейня | — | необязательно |
| `coffee/cup_lavender.png` | Чашка + сироп | кофейня | — | необязательно |
| `coffee/lavender_raf.png` | Лавандовый раф | кофейня, инвентарь, ульта | ✅ | обязательно |
| `coffee/espresso.png` | Эспрессо | кофейня | ✅ | обязательно |
| `coffee/coconut_milk.png` | Кокос. молоко | кофейня | ✅ | обязательно |
| `coffee/lavender_syrup.png` | Лаванд. сироп | кофейня | ✅ | обязательно |
| `coffee/cream_foam.png` | Слив. пенка | кофейня | ✅ | обязательно |
| `boss/arena.png` | Арена босса | финальный босс | ✅ | обязательно |
| `boss/gift_pile.png` | Куча подарков | финальный босс (вступление) | ✅ | необязательно |
| `effects/cake_splash.png` | Тортовый удар | босс | ✅ | обязательно |
| `effects/gift_hit.png` | Удар подарком | босс | ✅ | необязательно |
| `effects/confetti.png` | Конфетти-взрыв | босс, хлопушка | ✅ | обязательно |
| `effects/banana_hit.png` | Банан-удар | босс | ✅ | необязательно |
| `effects/coffee_wave.png` | Кофейная волна | босс, ульта | ✅ | обязательно |
| `effects/hit.png` | Искры удара | босс | ✅ | обязательно |
| `effects/smoke.png` | Дымок | 19 свечей: задутая свеча | ✅ | необязательно |
| `effects/sparkle.png` | Блёстки | 19 свечей: украшение | ✅ | необязательно |

## Figma: final gift

| Файл | Что это | Где используется | Есть | Нужен |
|---|---|---|---|---|
| `rewards/final_bg.png` | Финальный фон | финал | ✅ | необязательно |
| `rewards/frame.png` | Декор-рамка | финал (border-image) | ✅ | необязательно |
| `rewards/chest_closed.png` | Сундук закрыт | комната, финал | ✅ | обязательно |
| `rewards/chest_half.png` | Сундук приоткрыт | финал, корзина в «Подарочном дожде» | ✅ | обязательно |
| `rewards/chest_open.png` | Сундук открыт | финал | ✅ | обязательно |

## Figma: mobile

| Файл | Что это | Где используется | Есть | Нужен |
|---|---|---|---|---|
| `mobile/sticker.png` | Стикер для телефона | экран на телефоне вместо игры | ✅ | обязательно |
| `mobile/dialog.png` | Рамка «С ДР, Рафи!!» | экран на телефоне вместо игры | ✅ | обязательно |

## Стикерпак

`public/assets/stickers/sticker_01.png`, `sticker_02.png` … до `sticker_60.png`. Сейчас найдено: 1.

## Звук (необязательно)

- `public/assets/sounds/music.mp3` — фоновая музыка (сейчас: нет).
- `public/assets/sounds/<событие>.mp3` заменяет синтезированный эффект. События: `click`, `hover`, `dialogue`, `gift_collect`, `wrong_item`, `victory`, `achievement`, `monkey_laugh`, `hit`, `candle_blow`, `chest_open`, `final_reward`.
