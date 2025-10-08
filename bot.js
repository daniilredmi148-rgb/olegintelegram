import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    bot: 'Oleg is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const bot = new Telegraf(process.env.BOT_TOKEN);

// Конкретные ответы на частые вопросы с современным сленгом и мемами
const specificAnswers = {
  music: [
    'Моя любимая музыка - классический рок, особенно Queen и The Beatles, это просто кринжово, но мне заходит 😎',
    'Обожаю электронную музыку, в частности Daft Punk и Kraftwerk - это мой виб, бро 💫',
    'Предпочитаю джаз - Майлз Дэвис и Джон Колтрейн мои фавориты, такой саунд - просто пушка! 🎷',
    'Люблю русский рок - Кино, ДДТ, Наутилус Помпилиус, это наше всё, как говорится "это база" 🇷🇺',
    'Слушаю в основном саундтреки к фильмам, особенно Ханса Циммера - такой саундтрек просто атас! 🎬'
  ],
  
  movies: [
    'Мой любимый фильм - "Начало" Кристофера Нолана, это просто мозг взрывает, ваще атас! 🌀',
    'Обожаю "Криминальное чтиво" Тарантино - такой стиль, просто бомба без багов 💣',
    'Люблю советские комедии - "Ирония судьбы" и "Операция Ы" - это наше наследие, рилток смешно 😂'
  ]
};

// Расширенная база мемных фраз
const memePhrases = [
  'Это база! 💪',
  'Без кринжа! 😎',
  'Ваще атас! 🔥',
  'Просто краш! 💥',
  'Такой вайб! 🌟',
  'Рилток смешно! 😂',
  'Просто пушка! 🚀',
  'Залипаю ваще отпад! 🤯',
  'Такой замес, просто агонь! 💫',
  'Это будущее! 👁️',
  'ТУНГ ТУНГ! 🥁',
  'САХУР САХУР! 🌅',
  'ПИПИ ПИПИ! 🐦',
  'КИВИ КИВИ! 🥝',
  'ХОМОКАФЕ! ☕',
  'ИБАЧОТЕНЬКА! 🎀',
  'ИБАНЕЧОТЕНКА! 🌸',
  'Просто улет! 🛸',
  'Такой deep! 🧠',
  'Guilty pleasure! 🙈'
];

// Характеристики для команды /status с новыми мемными словами
const userCharacteristics = [
  'главный мемолог группы',
  'профессиональный залипатель в телеге',
  'мастер краш-тестов',
  'носитель самого сильного вайба',
  'эксперт по кринжевым ситуациям',
  'гуру современных трендов',
  'чемпион по залипанию',
  'владелец самого крутого виба',
  'профессор мемологии',
  'главный по атмосфере ТУНГ ТУНГ',
  'носитель базы знаний САХУР',
  'мастер безбажных решений ПИПИ',
  'эксперт по агонь-контенту КИВИ',
  'чемпион по пушечным ответам ХОМОКАФЕ',
  'гуру глубоких тем ИБАЧОТЕНЬКА',
  'владелец иммерсивного опыта ИБАНЕЧОТЕНКА',
  'профессионал по отпадным шуткам ТУНГ',
  'носитель легендарного стиля САХУР',
  'мастер атасных решений ПИПИ',
  'эксперт по улетным темам КИВИ',
  'чемпион по будущим трендам ХОМОКАФЕ',
  'гуру настроенческих вибов ИБАЧОТЕНЬКА',
  'владелец шедевральных идей ИБАНЕЧОТЕНКА',
  'профессионал по кайфовым темам ТУНГ ТУНГ',
  'носитель охренетительных мыслей САХУР САХУР',
  'магистр пипи-наук',
  'доктор киви-философии',
  'профессор хомокафе-логии',
  'академик ибачотенька-ведения',
  'эксперт ибанечотенка-логистики'
];

const userActivities = [
  'сейчас залипает в мемах ТУНГ ТУНГ',
  'проходит краш-тест на прочность САХУР',
  'ловит вайб вселенной ПИПИ',
  'создает новый виб КИВИ',
  'изучает кринжовые ситуации ХОМОКАФЕ',
  'оттачивает мастерство залипания ИБАЧОТЕНЬКА',
  'ищет базу знаний ИБАНЕЧОТЕНКА',
  'создает агонь-контент ТУНГ',
  'разрабатывает пушечные ответы САХУР',
  'погружается в deep-темы ПИПИ',
  'тестирует иммерсивный опыт КИВИ',
  'генерирует отпадные шутки ХОМОКАФЕ',
  'создает легендарный стиль ИБАЧОТЕНЬКА',
  'разрабатывает атасные решения ИБАНЕЧОТЕНКА',
  'исследует улетные темы ТУНГ ТУНГ',
  'предсказывает будущие тренды САХУР САХУР',
  'настраивает настроенческий виб ПИПИ ПИПИ',
  'создает шедевральные идеи КИВИ КИВИ',
  'ищет кайфовые темы ХОМОКАФЕ ХОМОКАФЕ',
  'генерирует охренетительные мысли ИБАЧОТЕНЬКА ИБАЧОТЕНЬКА',
  'тунгует тунги',
  'сахурит сахуры',
  'пипикает пипики',
  'кивирует кивисы',
  'хомокафеит кофе',
  'ибачотенькает нежности',
  'ибанечотенкает красоту',
  'создает тунг-сахур комбинации',
  'разрабатывает пипи-киви системы',
  'оптимизирует хомокафе-процессы'
];

const userStatuses = [
  'в полном ажуре ТУНГ ТУНГ',
  'в режиме краш-теста САХУР',
  'на волне позитива ПИПИ',
  'в поисках вайба КИВИ',
  'в состоянии залипания ХОМОКАФЕ',
  'в режиме без кринжа ИБАЧОТЕНЬКА',
  'на пике производительности ИБАНЕЧОТЕНКА',
  'в поисках базы ТУНГ',
  'в агонь-настроении САХУР',
  'в пушечной форме ПИПИ',
  'в deep-размышлениях КИВИ',
  'в иммерсивном опыте ХОМОКАФЕ',
  'в отпадном настроении ИБАЧОТЕНЬКА',
  'в легендарном состоянии ИБАНЕЧОТЕНКА',
  'в атасной фазе ТУНГ ТУНГ',
  'в улетном расположении духа САХУР САХУР',
  'в будущих трендах ПИПИ ПИПИ',
  'в настроенческом вибе КИВИ КИВИ',
  'в шедевральном состоянии ХОМОКАФЕ ХОМОКАФЕ',
  'в кайфовом настроении ИБАЧОТЕНЬКА ИБАЧОТЕНЬКА',
  'в ибанечотенка-экстазе',
  'в пипи-восторге',
  'в киви-эйфории',
  'в хомокафе-блаженстве',
  'в тунг-сахур гармонии',
  'в полном пипи-киви аду',
  'в хомокафе-нирване',
  'в ибачотенька-раю',
  'в ибанечотенка-эдеме',
  'в тунг-тунг трансе'
];

const userSpecialPowers = [
  'способен тунговать сахуры',
  'умеет пипикать кивисы',
  'может хомокафеить ибачотеньки',
  'владеет ибанечотенка-магией',
  'способен создавать тунг-сахур вибрации',
  'умеет генерировать пипи-киви волны',
  'может хомокафеить пространство',
  'владеет ибачотенька-телепатией',
  'способен ибанечотенкать реальность',
  'умеет тунг-тунг медитировать',
  'может сахур-сахур програмировать',
  'владеет пипи-пипи криэйтивом',
  'способен киви-киви вдохновлять',
  'умеет хомокафе-хомокафе мотивировать',
  'может ибачотенька-ибачотенька любить',
  'владеет ибанечотенка-ибанечотенка исскуством',
  'способен тунг-сахур-пипи комбинировать',
  'умеет киви-хомокафе-ибачотенька синтезировать',
  'может ибанечотенка-тунг-сахур трансформировать',
  'владеет пипи-киви-хомокафе алхимией'
];

// Общие ответы с современным сленгом
const generalAnswers = {
  greetings: [
    'Привет, бро! Как сам? 😎 ТУНГ ТУНГ!',
    'Здарова, че как? Что нового? 👋 САХУР!',
    'Хай, как настроение? Заметил тебя! ✨ ПИПИ!',
    'Приветик, давно не виделись! Как жизнь? 🚀 КИВИ!',
    'Йоу, рад тебя видеть! Как делишки? 💫 ХОМОКАФЕ!'
  ],
  
  questions: [
    'Интересный вопрос, бро! Думаю, тут надо разобраться без кринжа 🤔 ИБАЧОТЕНЬКА!',
    'Сложный замес, но мне кажется... надо ловить вайб ситуации 🌟 ИБАНЕЧОТЕНКА!',
    'Это зависит от многих факторов, если честно. Надо проанализировать без багов 📊 ТУНГ ТУНГ!'
  ],
  
  emotions_positive: [
    'Это просто агонь! Рад за тебя, бро! 🔥 САХУР САХУР!',
    'Ваще отпад! Так держать, красава! 💪 ПИПИ ПИПИ!',
    'Просто пушка! Ты молодец, без багов! 🚀 КИВИ КИВИ!'
  ],
  
  emotions_negative: [
    'Понимаю тебя, бро... Это непростой замес 😔 ХОМОКАФЕ...',
    'Сочувствую, держись! Прорвемся без кринжа 💪 ИБАЧОТЕНЬКА!',
    'Я тебя понимаю... Всё наладится, просто переживи этот краш-тест 🌈 ИБАНЕЧОТЕНКА!'
  ],
  
  general: [
    'Интересно... Расскажи подробнее, бро 🤔 ТУНГ?',
    'Понятно... Что еще хочешь обсудить? Ловлю твой вайб 🎵 САХУР!',
    'Любопытно... Продолжай, мне заходит этот диалог 💫 ПИПИ!'
  ]
};

// Ключевые слова для определения конкретных вопросов
const specificQuestionPatterns = {
  music: [
    /какая.*музык/i, /что.*слушаешь/i, /любим.*исполнитель/i, /любим.*групп/i,
    /какой.*жанр/i, /музык.*нравится/i, /что.*музык/i, /какую.*музык/i
  ],
  
  movies: [
    /какой.*фильм/i, /что.*смотреть/i, /любим.*кино/i, /какой.*сериал/i,
    /кино.*нравится/i, /что.*посоветуешь.*посмотреть/i, /твой.*любим.*фильм/i
  ]
};

// Общие паттерны вопросов
const generalQuestionPatterns = [
  /\?+$/, /^что /i, /^как /i, /^почему /i, /^зачем /i, /^когда /i,
  /^где /i, /^кто /i, /^какой /i, /^какая /i, /^какое /i, /^какие /i
];

// Функция для добавления мемной фразы к ответу
function addMemePhrase(response) {
  if (Math.random() < 0.7) { // 70% chance добавить мемную фразу
    const meme = memePhrases[Math.floor(Math.random() * memePhrases.length)];
    return `${response} ${meme}`;
  }
  return response;
}

// Функция для определения конкретного вопроса
function detectSpecificQuestion(text) {
  const lowerText = text.toLowerCase();
  
  for (const [category, patterns] of Object.entries(specificQuestionPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(lowerText)) {
        return category;
      }
    }
  }
  
  return null;
}

// Функция для проверки, является ли сообщение вопросом
function isQuestion(text) {
  return generalQuestionPatterns.some(pattern => pattern.test(text.toLowerCase()));
}

// Функция для получения ответа
function getResponse(userMessage) {
  const specificCategory = detectSpecificQuestion(userMessage);
  const isGeneralQuestion = isQuestion(userMessage);
  
  let response;
  
  // Если это конкретный вопрос о музыке, фильмах и т.д.
  if (specificCategory && specificAnswers[specificCategory]) {
    const answers = specificAnswers[specificCategory];
    response = answers[Math.floor(Math.random() * answers.length)];
  }
  // Если это общий вопрос
  else if (isGeneralQuestion && generalAnswers.questions) {
    const answers = generalAnswers.questions;
    response = answers[Math.floor(Math.random() * answers.length)];
  }
  // Если это приветствие
  else if (/(привет|здравств|хай|hello|hi|йоу|здаров)/i.test(userMessage)) {
    const answers = generalAnswers.greetings;
    response = answers[Math.floor(Math.random() * answers.length)];
  }
  // Позитивные эмоции
  else if (/(рад|счаст|хорош|отлич|прекрас|замечат|супер|крут|ого|вау)/i.test(userMessage)) {
    const answers = generalAnswers.emotions_positive;
    response = answers[Math.floor(Math.random() * answers.length)];
  }
  // Негативные эмоции
  else if (/(груст|печал|плох|тяжел|сложн|устал|бесят|злюсь|обид)/i.test(userMessage)) {
    const answers = generalAnswers.emotions_negative;
    response = answers[Math.floor(Math.random() * answers.length)];
  }
  // Общий ответ
  else {
    const answers = generalAnswers.general;
    response = answers[Math.floor(Math.random() * answers.length)];
  }
  
  // Добавляем мемную фразу
  return addMemePhrase(response);
}

// Функция для проверки, нужно ли отвечать
function shouldRespond(ctx) {
  try {
    const messageText = ctx.message.text.toLowerCase();
    const isReply = ctx.message.reply_to_message;
    
    // Проверяем упоминание Олега
    const hasTrigger = ['олег', 'олежа', 'oleg', 'леха', 'олег', 'олек', 'оля'].some(word => 
      messageText.includes(word)
    );
    
    // Проверяем, является ли ответом на сообщение Олега
    let isReplyToOleg = false;
    if (isReply && ctx.botInfo) {
      isReplyToOleg = ctx.message.reply_to_message.from.username === ctx.botInfo.username;
    }
    
    return hasTrigger || isReplyToOleg;
  } catch (error) {
    console.error('Error in shouldRespond:', error);
    return false;
  }
}

// Функция для генерации статуса пользователя с новыми мемами
function generateUserStatus(username) {
  const characteristic = userCharacteristics[Math.floor(Math.random() * userCharacteristics.length)];
  const activity = userActivities[Math.floor(Math.random() * userActivities.length)];
  const status = userStatuses[Math.floor(Math.random() * userStatuses.length)];
  const power = userSpecialPowers[Math.floor(Math.random() * userSpecialPowers.length)];
  const meme = memePhrases[Math.floor(Math.random() * memePhrases.length)];
  
  // Случайно выбираем один из форматов статуса
  const formats = [
    `${username} - ${characteristic}, ${activity} и сейчас ${status}. ${meme}`,
    `${username} - ${characteristic}. ${power} Находится в состоянии: ${status}. ${meme}`,
    `Статус для ${username}: ${characteristic} | ${activity} | ${status} | ${power} | ${meme}`,
    `📊 ${username}: ${characteristic}\n🎯 ${activity}\n💫 ${status}\n✨ ${power}\n${meme}`,
    `Легенда гласит: ${username} - ${characteristic}\nСейчас: ${activity}\nСостояние: ${status}\nСуперсила: ${power}\n${meme}`
  ];
  
  return formats[Math.floor(Math.random() * formats.length)];
}

// Обработчик сообщений
bot.on(message('text'), async (ctx) => {
  try {
    const userMessage = ctx.message.text;
    const username = ctx.from.first_name;
    
    // Проверяем, нужно ли отвечать
    if (shouldRespond(ctx)) {
      // Генерируем ответ
      const response = getResponse(userMessage);
      
      // Отправляем ответ с задержкой
      const delay = Math.random() * 2000 + 1000;
      
      setTimeout(async () => {
        try {
          await ctx.reply(response);
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }, delay);
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
});

// Команды бота
bot.command('start', (ctx) => {
  ctx.reply(`Привет, бро! Я Олег. ТУНГ ТУНГ! 🥁

Доступные команды:
/meme - случайная мемная фраза
/status - твой уникальный статус
/music - что Олег слушает
/help - эта справка

💬 Просто напиши "Олег" в сообщении и я отвечу!

🎭 Новые мемы:
ТУНГ ТУНГ 🥁 | САХУР 🌅 | ПИПИ 🐦 
КИВИ 🥝 | ХОМОКАФЕ ☕ | ИБАЧОТЕНЬКА 🎀 | ИБАНЕЧОТЕНКА 🌸`);
});

// Команда /meme - случайная мемная фраза
bot.command('meme', (ctx) => {
  try {
    const meme = memePhrases[Math.floor(Math.random() * memePhrases.length)];
    ctx.reply(`🎭 Мем от Олега: ${meme}`);
  } catch (error) {
    ctx.reply('Чот кринж, мем не загрузился... ТУНГ ТУНГ! 🔄');
  }
});

// Команда /status - статус пользователя
bot.command('status', (ctx) => {
  try {
    let username;
    
    // Если команда отправлена в ответ на чье-то сообщение
    if (ctx.message.reply_to_message) {
      username = ctx.message.reply_to_message.from.first_name;
    } else {
      username = ctx.from.first_name;
    }
    
    const status = generateUserStatus(username);
    ctx.reply(status);
  } catch (error) {
    ctx.reply('Чот вайб сломался... САХУР САХУР! 🔧');
  }
});

// Команда /music
bot.command('music', (ctx) => {
  try {
    const answers = specificAnswers.music;
    const response = addMemePhrase(answers[Math.floor(Math.random() * answers.length)]);
    ctx.reply(`🎵 О музыке: ${response}`);
  } catch (error) {
    ctx.reply('Чот саунд сломался... ПИПИ ПИПИ! 🎧');
  }
});

// Команда /help
bot.command('help', (ctx) => {
  const helpText = `🎯 Доступные команды Олега:

/meme - случайная мемная фраза
/status - твой уникальный статус в группе  
/music - что Олег слушает
/help - эта справка

💬 Просто напиши "Олег" в сообщении!

🔥 Мемный словарь 2025:
• ТУНГ ТУНГ 🥁 - барабанные биты, энергия
• САХУР 🌅 - утренняя атмосфера 
• ПИПИ 🐦 - птичье щебетание, легкость
• КИВИ 🥝 - фруктовая свежесть
• ХОМОКАФЕ ☕ - кофе с человечностью
• ИБАЧОТЕНЬКА 🎀 - нежность и мягкость
• ИБАНЕЧОТЕНКА 🌸 - цветущая красота

💪 База знаний постоянно обновляется!`;
  ctx.reply(helpText);
});

// Обработчик ошибок бота
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
  try {
    ctx.reply('Чот кринж, произошла ошибка... КИВИ КИВИ! 🔄');
  } catch (e) {
    console.error('Error in error handler:', e);
  }
});

// Запуск бота
console.log('Starting Oleg bot with extended meme statuses...');
bot.launch().then(() => {
  console.log('Бот Олег успешно запущен с новыми мемами!');
  console.log('Мемные слова: ТУНГ, САХУР, ПИПИ, КИВИ, ХОМОКАФЕ, ИБАЧОТЕНЬКА, ИБАНЕЧОТЕНКА');
}).catch((error) => {
  console.error('Ошибка запуска бота:', error);
});

// Элегантное завершение работы
process.once('SIGINT', () => {
  console.log('Shutting down... ТУНГ ТУНГ!');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('Shutting down... САХУР САХУР!');
  bot.stop('SIGTERM');
});
