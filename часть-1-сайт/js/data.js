/* =====================================================================
   ДАННЫЕ САЙТА — весь шаблонный контент находится здесь.
   Название бренда, контакты, валюты, коллекции и товары меняются
   в этом одном файле и обновляются на всех страницах.
   ===================================================================== */

const SITE = {
  name: "AUREX",                       // временное название бренда
  tagline: "Премиальные филаменты для 3D-печати",
  email: "hello@example.com",
  phone: "+00 000 000 0000",
  address: "Шэньчжэнь, провинция Гуандун, Китай",
  freeShippingFrom: 49,                // в USD
  shippingFlat: 6.9,                   // в USD
  shippingExpress: 14.9,               // в USD
  socials: [["IG", "#"], ["YT", "#"], ["TT", "#"], ["FB", "#"], ["X", "#"]],
  // курсы условные — базовая валюта USD
  currencies: {
    USD: { symbol: "$", rate: 1 },
    EUR: { symbol: "€", rate: 0.92 },
    GBP: { symbol: "£", rate: 0.79 },
    CAD: { symbol: "C$", rate: 1.37 },
    AUD: { symbol: "A$", rate: 1.52 },
  },
};

const COLLECTIONS = [
  { id: "general",     img: "assets/cat-general.jpg", name: "Базовые",       accent: "#e2be73", short: "PLA и PETG на каждый день", blurb: "PLA и PETG, которые просто работают — для прототипов, подарков и бытовых мелочей." },
  { id: "aesthetic",   img: "assets/cat-aesthetic.jpg", name: "Декоративные",  accent: "#c58cff", short: "Шёлк, мат, мрамор, дерево", blurb: "Шёлк, мат, мрамор, дерево и свечение — модели выглядят готовыми без постобработки." },
  { id: "highspeed",   img: "assets/cat-highspeed.jpg", name: "Скоростные",    accent: "#ff8a4c", short: "Для печати до 600 мм/с", blurb: "Составы для принтеров со скоростью 300–600 мм/с: быстрый расплав, чистые слои, без компромиссов." },
  { id: "functional",  img: "assets/cat-functional.jpg", name: "Функциональные", accent: "#5fd0c5", short: "Гибкие и всепогодные", blurb: "Гибкие, всепогодные и термостойкие материалы для деталей, у которых есть работа." },
  { id: "engineering", img: "assets/cat-engineering.jpg", name: "Инженерные",    accent: "#8fb4ff", short: "Композиты, нейлон, PC", blurb: "Композиты с угле- и стекловолокном, нейлоны и поликарбонат для нагруженных и термостойких деталей." },
  { id: "accessories", img: "assets/cat-accessories.jpg", name: "Аксессуары",    accent: "#d9d9d9", short: "Сушилки, хранение, инструмент", blurb: "Сушилки, хранение и инструменты, чтобы каждая катушка была готова к печати." },
];

const C = {
  black: ["Чёрный", "#16161a"], white: ["Белый", "#f2f2ee"], grey: ["Серый", "#8b8f94"], red: ["Красный", "#d2342c"],
  orange: ["Оранжевый", "#f07a1c"], yellow: ["Жёлтый", "#f2c81e"], green: ["Зелёный", "#35a852"], mint: ["Мятный", "#8fe0c0"],
  blue: ["Синий", "#2463d6"], sky: ["Голубой", "#62b8f0"], purple: ["Фиолетовый", "#7a3fc4"], pink: ["Розовый", "#f08ab4"],
  gold: ["Золото", "#d4a94a"], silver: ["Серебро", "#c3c7cc"], copper: ["Медь", "#b86a3c"], olive: ["Оливковый", "#6b7036"],
  sand: ["Песочный", "#d8c39a"], wood: ["Орех", "#7a5232"], oak: ["Дуб", "#b58a5a"], glow: ["Светящийся зелёный", "#b8f76a"],
  glowb: ["Светящийся голубой", "#7ee6ff"], marble: ["Мрамор", "#dcdcd6"], natural: ["Натуральный", "#e9e2cf"], carbon: ["Карбон", "#232326"],
  navy: ["Тёмно-синий", "#1c2c58"], teal: ["Бирюзовый", "#168a8a"], clear: ["Прозрачный", "#cfe6ee"], burgundy: ["Бордовый", "#6e1c2c"],
};
const col = (...keys) => keys.map(k => ({ name: C[k][0], hex: C[k][1] }));
// нейтральные цвета — на карточке по умолчанию показываем яркий, если он есть
const NEUTRAL_COLORS = ["black", "white", "grey", "carbon", "clear"].map(k => C[k][0]);

/* props — оценки от 1 до 5, используются на странице товара и в «Лаборатории материалов» */
const PRODUCTS = [
  { id: "pla", name: "PLA", cat: "general", material: "PLA", price: 17.99, old: 21.99, rating: 4.8, reviews: 2134, badge: "Хит",
    colors: col("black", "white", "grey", "red", "orange", "yellow", "green", "blue", "purple", "pink"), weights: [1, 3],
    specs: { nozzle: "200–220 °C", bed: "50–60 °C", speed: "40–120 мм/с", dry: "50 °C · 4 ч", density: "1,24 г/см³" },
    props: { strength: 3, stiffness: 4, heat: 2, flex: 1, ease: 5 },
    desc: "Надёжный филамент на каждый день. Ровная намотка, допуск ±0,02 мм и стабильный цвет от первого метра до последнего." },
  { id: "pla-plus", name: "PLA+", cat: "general", material: "PLA", price: 19.99, rating: 4.9, reviews: 3410, badge: "Выбор покупателей",
    colors: col("black", "white", "grey", "red", "blue", "green", "olive", "navy", "orange"), weights: [1, 3],
    specs: { nozzle: "205–225 °C", bed: "50–60 °C", speed: "40–150 мм/с", dry: "50 °C · 4 ч", density: "1,23 г/см³" },
    props: { strength: 4, stiffness: 4, heat: 2, flex: 2, ease: 5 },
    desc: "Прочнее обычного PLA: лучше спекаются слои и выше ударная вязкость. Апгрейд для функциональных деталей на каждый день." },
  { id: "petg", name: "PETG", cat: "general", material: "PETG", price: 18.99, rating: 4.7, reviews: 1622,
    colors: col("black", "white", "grey", "clear", "red", "blue", "green", "orange"), weights: [1, 3],
    specs: { nozzle: "230–250 °C", bed: "70–85 °C", speed: "40–100 мм/с", dry: "65 °C · 6 ч", density: "1,27 г/см³" },
    props: { strength: 4, stiffness: 3, heat: 3, flex: 2, ease: 4 },
    desc: "Прочный, слегка эластичный и влагостойкий. Идеален для кронштейнов, корпусов и уличных креплений." },
  { id: "pla-matte", name: "PLA Matte", cat: "aesthetic", material: "PLA", price: 20.99, rating: 4.8, reviews: 987, badge: "Новинка",
    colors: col("carbon", "sand", "olive", "burgundy", "navy", "teal", "white", "grey"), weights: [1],
    specs: { nozzle: "200–220 °C", bed: "50–60 °C", speed: "40–120 мм/с", dry: "50 °C · 4 ч", density: "1,31 г/см³" },
    props: { strength: 3, stiffness: 4, heat: 2, flex: 1, ease: 5 },
    desc: "Бархатистая матовая поверхность без бликов скрывает слои. Для декора, фигурок и выставочных моделей." },
  { id: "pla-silk", name: "Silk PLA", cat: "aesthetic", material: "PLA", price: 22.99, old: 25.99, rating: 4.7, reviews: 1458, badge: "Скидка",
    colors: col("gold", "silver", "copper", "red", "blue", "purple", "green", "pink"), weights: [1],
    specs: { nozzle: "205–225 °C", bed: "50–60 °C", speed: "40–80 мм/с", dry: "50 °C · 4 ч", density: "1,25 г/см³" },
    props: { strength: 3, stiffness: 3, heat: 2, flex: 2, ease: 4 },
    desc: "Зеркальный металлический блеск сразу со стола. Вазы, кубки и подарки выглядят отполированными без шлифовки." },
  { id: "pla-marble", name: "PLA Marble", cat: "aesthetic", material: "PLA", price: 23.99, rating: 4.6, reviews: 412,
    colors: col("marble", "grey", "sand"), weights: [1],
    specs: { nozzle: "200–220 °C", bed: "50–60 °C", speed: "40–100 мм/с", dry: "50 °C · 4 ч", density: "1,27 г/см³" },
    props: { strength: 3, stiffness: 4, heat: 2, flex: 1, ease: 4 },
    desc: "Мелкие тёмные вкрапления создают эффект натурального камня. Для бюстов, кашпо и архитектурных макетов." },
  { id: "pla-wood", name: "PLA Wood", cat: "aesthetic", material: "PLA", price: 24.99, rating: 4.5, reviews: 356,
    colors: col("oak", "wood", "sand"), weights: [1],
    specs: { nozzle: "190–220 °C", bed: "50–60 °C", speed: "40–80 мм/с", dry: "50 °C · 4 ч", density: "1,20 г/см³" },
    props: { strength: 2, stiffness: 3, heat: 2, flex: 1, ease: 3 },
    desc: "Состав с настоящим древесным волокном: шлифуется и тонируется морилкой. Тёплая природная фактура для декора." },
  { id: "pla-glow", name: "PLA Glow", cat: "aesthetic", material: "PLA", price: 23.99, rating: 4.6, reviews: 529,
    colors: col("glow", "glowb"), weights: [1],
    specs: { nozzle: "205–225 °C", bed: "50–60 °C", speed: "40–100 мм/с", dry: "50 °C · 4 ч", density: "1,26 г/см³" },
    props: { strength: 3, stiffness: 4, heat: 2, flex: 1, ease: 4 },
    desc: "Светится в темноте: заряжается от любого света и сияет часами. Для долгой печати используйте закалённое сопло." },
  { id: "hs-pla", name: "High-Speed PLA", cat: "highspeed", material: "PLA", price: 21.99, rating: 4.8, reviews: 1203, badge: "Скорость",
    colors: col("black", "white", "grey", "red", "blue", "orange", "green"), weights: [1, 3],
    specs: { nozzle: "210–240 °C", bed: "50–60 °C", speed: "до 600 мм/с", dry: "50 °C · 4 ч", density: "1,24 г/см³" },
    props: { strength: 3, stiffness: 4, heat: 2, flex: 1, ease: 5 },
    desc: "Высокотекучий состав для скоростных CoreXY-принтеров. Быстро плавится, быстро остывает, держит нависания." },
  { id: "hs-petg", name: "High-Speed PETG", cat: "highspeed", material: "PETG", price: 22.99, rating: 4.6, reviews: 478, badge: "Новинка",
    colors: col("black", "white", "grey", "blue", "clear"), weights: [1],
    specs: { nozzle: "230–260 °C", bed: "70–85 °C", speed: "до 400 мм/с", dry: "65 °C · 6 ч", density: "1,27 г/см³" },
    props: { strength: 4, stiffness: 3, heat: 3, flex: 2, ease: 4 },
    desc: "Вся прочность PETG на вдвое большей скорости: меньше паутины и глянцевая поверхность." },
  { id: "tpu-95a", name: "TPU 95A", cat: "functional", material: "TPU", price: 26.99, rating: 4.7, reviews: 811,
    colors: col("black", "white", "red", "blue", "clear"), weights: [1],
    specs: { nozzle: "210–230 °C", bed: "40–60 °C", speed: "20–60 мм/с", dry: "55 °C · 6 ч", density: "1,21 г/см³" },
    props: { strength: 3, stiffness: 1, heat: 2, flex: 5, ease: 3 },
    desc: "Эластичный, как резина, и стойкий к истиранию. Чехлы, прокладки, шины и виброгасители." },
  { id: "asa", name: "ASA", cat: "functional", material: "ASA", price: 25.99, rating: 4.6, reviews: 392,
    colors: col("black", "white", "grey", "red"), weights: [1],
    specs: { nozzle: "240–260 °C", bed: "90–110 °C", speed: "40–100 мм/с", dry: "80 °C · 6 ч", density: "1,07 г/см³" },
    props: { strength: 4, stiffness: 4, heat: 4, flex: 2, ease: 2 },
    desc: "Устойчив к ультрафиолету и погоде — уличная альтернатива ABS. Рекомендуется закрытая камера." },
  { id: "abs", name: "ABS", cat: "functional", material: "ABS", price: 19.99, rating: 4.5, reviews: 644,
    colors: col("black", "white", "grey", "red", "blue"), weights: [1],
    specs: { nozzle: "240–260 °C", bed: "90–110 °C", speed: "40–100 мм/с", dry: "80 °C · 6 ч", density: "1,04 г/см³" },
    props: { strength: 4, stiffness: 3, heat: 4, flex: 2, ease: 2 },
    desc: "Классический инженерный пластик: термостойкий, хорошо обрабатывается и сглаживается ацетоном." },
  { id: "pla-cf", name: "PLA-CF", cat: "engineering", material: "PLA", price: 32.99, rating: 4.8, reviews: 507, badge: "Pro",
    colors: col("carbon"), weights: [1],
    specs: { nozzle: "210–240 °C", bed: "50–60 °C", speed: "40–200 мм/с", dry: "55 °C · 6 ч", density: "1,22 г/см³" },
    props: { strength: 4, stiffness: 5, heat: 3, flex: 1, ease: 4 },
    desc: "PLA, армированный углеволокном: премиальная матовая поверхность и выдающаяся жёсткость. Нужно закалённое сопло." },
  { id: "petg-cf", name: "PETG-CF", cat: "engineering", material: "PETG", price: 34.99, rating: 4.7, reviews: 288,
    colors: col("carbon", "navy"), weights: [1],
    specs: { nozzle: "240–270 °C", bed: "70–85 °C", speed: "40–200 мм/с", dry: "65 °C · 8 ч", density: "1,29 г/см³" },
    props: { strength: 5, stiffness: 5, heat: 3, flex: 1, ease: 3 },
    desc: "Жёсткий, стабильный по размерам и химически стойкий. Рабочая лошадка для оснастки, креплений и рам дронов." },
  { id: "pa12-cf", name: "PA12-CF", cat: "engineering", material: "Нейлон", price: 54.99, rating: 4.8, reviews: 164, badge: "Pro",
    colors: col("carbon"), weights: [1],
    specs: { nozzle: "260–300 °C", bed: "80–100 °C", speed: "40–120 мм/с", dry: "80 °C · 12 ч", density: "1,06 г/см³" },
    props: { strength: 5, stiffness: 5, heat: 5, flex: 2, ease: 2 },
    desc: "Нейлон с низким влагопоглощением и углеволокном. Прочность на уровне замены металла для конечных деталей." },
  { id: "pc", name: "Поликарбонат PC", cat: "engineering", material: "PC", price: 39.99, rating: 4.5, reviews: 121, stock: false,
    colors: col("clear", "black"), weights: [1],
    specs: { nozzle: "260–290 °C", bed: "100–110 °C", speed: "40–100 мм/с", dry: "80 °C · 8 ч", density: "1,20 г/см³" },
    props: { strength: 5, stiffness: 4, heat: 5, flex: 2, ease: 1 },
    desc: "Экстремальная ударная прочность и термостойкость до 110 °C. Только для закрытых принтеров с цельнометаллическим хотэндом." },
  { id: "dryer", name: "Сушилка для филамента S2", cat: "accessories", material: "Аксессуар", price: 59.99, old: 69.99, rating: 4.8, reviews: 932, badge: "Скидка", type: "box",
    colors: col("carbon", "white"), weights: [],
    specs: { "Вместимость": "1 катушка до 1 кг", "Температура": "35–70 °C", "Таймер": "до 99 ч", "Дисплей": "сенсорный, с датчиком влажности", "Питание": "110–240 В" },
    desc: "Круговая циркуляция тепла и датчик влажности в реальном времени. Можно печатать прямо из сушилки." },
  { id: "vacuum-kit", name: "Набор для вакуумного хранения", cat: "accessories", material: "Аксессуар", price: 24.99, rating: 4.6, reviews: 318, type: "box",
    colors: col("clear"), weights: [],
    specs: { "В комплекте": "10 пакетов, электронасос, 20 пакетиков силикагеля", "Размер пакета": "34 × 30 см", "Подходит для": "катушек 1 кг" },
    desc: "Сохраняет открытые катушки сухими между печатями. Многоразовые пакеты с индикаторами влажности." },
  { id: "tool-kit", name: "Набор инструментов для постобработки", cat: "accessories", material: "Аксессуар", price: 29.99, rating: 4.7, reviews: 205, badge: "Новинка", type: "box",
    colors: col("carbon"), weights: [],
    specs: { "В комплекте": "шабер, бокорезы, скребок, надфили, пинцеты, иглы для сопла", "Предметов": "32" },
    desc: "Всё, чтобы снять поддержки, зачистить кромки и обслужить сопло, — в одном чехле-скрутке." },
];

const SALE_BADGE = "Скидка";
const PROP_LABELS = { strength: "Прочность", stiffness: "Жёсткость", heat: "Термостойкость", flex: "Гибкость", ease: "Простота печати" };
const SPEC_LABELS = { nozzle: "Температура сопла", bed: "Температура стола", speed: "Скорость печати", dry: "Сушка", density: "Плотность" };

const REVIEWS = [
  { name: "Даниэль К.", place: "Германия", text: "Шесть катушек — ни одного запутывания, и цвет совпадает от партии к партии. Это редкость." },
  { name: "Софи Л.", place: "Франция", text: "Матовый PLA так хорошо скрывает слои, что клиенты думают, будто детали отлиты под давлением." },
  { name: "Маркус Т.", place: "США", text: "Гнал скоростной PLA на 500 мм/с на своём CoreXY. Чёткие углы, никакой недоэкструзии." },
  { name: "Айко Н.", place: "Япония", text: "Пришло в вакууме с силикагелем, печатает идеально прямо из пакета. Заказываю ещё." },
  { name: "Лукас П.", place: "Бразилия", text: "PETG-CF для рам дронов — жёсткий, лёгкий, а поверхность выглядит дорого." },
  { name: "Эмма Р.", place: "Великобритания", text: "Поддержка ответила за пару часов и прислала профиль печати именно под мой принтер." },
];

const POSTS = [
  { tag: "Гид", art: "guide", title: "PLA, PETG или ABS: как выбрать материал", text: "Простое сравнение прочности, термостойкости и удобства печати." },
  { tag: "Инструкция", art: "dry", title: "Почему сухой филамент печатает лучше — и как его сушить", text: "Паутина, щелчки, слабые слои: почти всё это из-за влаги." },
  { tag: "Профили", art: "profile", title: "Стартовые настройки печати для всех наших материалов", text: "Температуры, скорости и обдув — можно сразу переносить в слайсер." },
];

const COUNTRIES = ["Австралия", "Австрия", "Бельгия", "Бразилия", "Великобритания", "Германия", "Дания", "Испания", "Италия", "Канада", "Нидерланды", "ОАЭ", "Польша", "США", "Франция", "Чехия", "Швейцария", "Швеция", "Япония"];
