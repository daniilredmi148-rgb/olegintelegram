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

// Расширенная база знаний Олега с темами
const knowledgeBase = {
  greetings: [
    'Привет! Как твои дела?',
    'Здравствуй! Рад тебя видеть!',
    'Приветствую! Что нового?',
    'Привет! Как прошел твой день?',
    'Хай! Как настроение?',
    'Доброго времени суток!',
    'Приветик! Как жизнь?',
    'Здарова! Что расскажешь?',
    'Привет! Давно не общались',
    'Привет! Чем занят?'
  ],
  questions: [
    'Интересно, а что ты думаешь об этом?',
    'Хм, хороший вопрос... А сам как считаешь?',
    'Давай обсудим это подробнее',
    'Интересная тема, расскажи больше',
    'А почему ты спросил об этом?',
    'Это действительно важный вопрос',
    'Давай разберемся вместе',
    'Интересно твое мнение на этот счет',
    'А как бы ты сам ответил на этот вопрос?',
    'Давай подумаем над этим'
  ],
  emotions_positive: [
    'Это прекрасно! Рад за тебя!',
    'Здорово! Продолжай в том же духе!',
    'Отлично! Так держать!',
    'Супер! Я разделяю твою радость!',
    'Замечательно! Это вдохновляет!',
    'Превосходно! Ты молодец!',
    'Великолепно! Рад это слышать!',
    'Чудесно! Поздравляю!',
    'Фантастика! Горжусь тобой!',
    'Браво! Ты на правильном пути!'
  ],
  emotions_negative: [
    'Понимаю тебя... Это непросто',
    'Сочувствую... Держись!',
    'Я тебя понимаю... Всё наладится',
    'Это действительно тяжело...',
    'Принимаю твои чувства...',
    'Сложная ситуация... Но ты справишься',
    'Понимаю твою боль...',
    'Это должно быть трудно для тебя...',
    'Сочувствую... Время лечит',
    'Признаю твои переживания...'
  ],
  technology: [
    'Технологии - это интересно! Что тебя привлекает?',
    'Любопытная техническая тема!',
    'Технологии постоянно развиваются, не так ли?',
    'Интересный аспект технологий!',
    'Технический прогресс не стоит на месте',
    'Увлекательная техническая дискуссия!',
    'Технологии меняют наш мир',
    'Интересно наблюдать за развитием технологий',
    'Технические инновации всегда впечатляют',
    'Технологии открывают новые возможности'
  ],
  entertainment: [
    'Развлечения - это важно для отдыха!',
    'Интересно, что тебе нравится?',
    'Культура и искусство обогащают жизнь',
    'Забавная тема!',
    'Развлечения помогают расслабиться',
    'Интересные предпочтения!',
    'Искусство всегда вдохновляет',
    'Культурные мероприятия - это здорово',
    'Развлечения делают жизнь ярче',
    'Творчество - прекрасное занятие'
  ],
  sports: [
    'Спорт - это здорово! Ты активный человек?',
    'Спортивные достижения впечатляют!',
    'Физическая активность полезна для здоровья',
    'Интересная спортивная тема!',
    'Спорт объединяет людей',
    'Соревновательный дух - это вдохновляюще',
    'Спортивные события всегда захватывают',
    'Активный образ жизни - это правильно',
    'Спорт развивает характер',
    'Спортивные увлечения разнообразны'
  ],
  work_study: [
    'Работа/учеба - важная часть жизни!',
    'Профессиональное развитие - это ценно',
    'Интересная рабочая/учебная тема!',
    'Образование открывает новые горизонты',
    'Карьерный рост требует усилий',
    'Учеба помогает развиваться',
    'Работа занимает значительную часть времени',
    'Профессиональные навыки очень важны',
    'Обучение - непрерывный процесс',
    'Рабочие/учебные challenges помогают расти'
  ],
  philosophy: [
    'Глубокие мысли... Что еще тебя волнует?',
    'Философские размышления всегда интересны',
    'Жизненные вопросы требуют осмысления',
    'Мудрая тема для обсуждения',
    'Философия помогает понять мир',
    'Глубокомысленное наблюдение',
    'Вечные вопросы человечества...',
    'Философский подход к жизни важен',
    'Размышления об смыслах всегда актуальны',
    'Философия расширяет сознание'
  ],
  everyday: [
    'Повседневные дела занимают много времени, да?',
    'Будничные заботы... Как с ними справляешься?',
    'Рутина бывает утомительной, но необходима',
    'Повседневная жизнь полна мелочей',
    'Бытовые вопросы требуют внимания',
    'Повседневные ритуалы важны для порядка',
    'Жизнь состоит из маленьких моментов',
    'Будничные дела формируют нашу жизнь',
    'Повседневность имеет свою прелесть',
    'Обыденные вещи могут быть интересными'
  ],
  general: [
    'Интересно... Расскажи подробнее',
    'Понятно... Что еще хочешь обсудить?',
    'Любопытно... Продолжай',
    'Занимательная тема!',
    'Давай поговорим об этом',
    'Интересная мысль!',
    'Продолжаю слушать...',
    'Что еще тебя интересует?',
    'Давай обсудим это',
    'Интересная точка зрения!'
  ]
};

// Система частоты использования фраз
const phraseUsage = new Map();
const conversationHistory = new Map();
const userTopics = new Map();
const MAX_HISTORY = 15;

// Ключевые слова для активации Олега
const triggerWords = ['олег', 'олежа', 'олег', 'oleg', 'oleg', 'леха', 'олег'];

// Тематические ключевые слова
const topicKeywords = {
  technology: ['компьютер', 'телефон', 'интернет', 'программа', 'приложение', 'гаджет', 'смартфон', 'ноутбук', 'айти', 'технологи', 'код', 'программирование', 'софт', 'хард', 'девайс'],
  entertainment: ['фильм', 'сериал', 'музыка', 'игра', 'кино', 'концерт', 'театр', 'искусство', 'творчество', 'развлечен', 'хобби', 'отдых', 'юмор', 'смех'],
  sports: ['спорт', 'футбол', 'хоккей', 'баскетбол', 'тренировка', 'матч', 'соревнование', 'победа', 'проигрыш', 'зал', 'фитнес', 'бег', 'плавание'],
  work_study: ['работа', 'учеба', 'проект', 'задание', 'дедлайн', 'начальник', 'коллега', 'студент', 'преподаватель', 'урок', 'лекция', 'семinar', 'карьера'],
  philosophy: ['жизнь', 'смысл', 'судьба', 'время', 'смерть', 'любовь', 'дружба', 'истина', 'ложь', 'добро', 'зло', 'мораль', 'этика', 'философия'],
  everyday: ['дом', 'еда', 'покупки', 'уборка', 'готовка', 'сон', 'пробуждение', 'транспорт', 'дорога', 'магазин', 'продукты', 'быт', 'рутина']
};

// Функция для определения темы сообщения
function detectTopic(message) {
  const lowerMessage = message.toLowerCase();
  const topicScores = {};
  
  // Считаем баллы для каждой темы
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    topicScores[topic] = keywords.reduce((score, keyword) => {
      return score + (lowerMessage.includes(keyword) ? 1 : 0);
    }, 0);
  }
  
  // Находим тему с максимальным количеством баллов
  const maxScore = Math.max(...Object.values(topicScores));
  if (maxScore > 0) {
    const detectedTopics = Object.entries(topicScores)
      .filter(([_, score]) => score === maxScore)
      .map(([topic]) => topic);
    
    return detectedTopics[Math.floor(Math.random() * detectedTopics.length)];
  }
  
  return 'general';
}

// Функция для получения редко используемой фразы (ИСПРАВЛЕНА)
function getRarePhrase(topic, userId) {
  // Получаем фразы для темы, гарантируя что это массив
  const phrases = knowledgeBase[topic] || knowledgeBase.general;
  
  // Убеждаемся что phrases - это массив
  if (!Array.isArray(phrases) || phrases.length === 0) {
    console.log(`No phrases found for topic: ${topic}, using general`);
    return knowledgeBase.general[Math.floor(Math.random() * knowledgeBase.general.length)];
  }
  
  const userUsage = phraseUsage.get(userId) || new Map();
  
  // Фильтруем фразы по частоте использования
  const availablePhrases = phrases.filter((phrase) => {
    const usageCount = userUsage.get(phrase) || 0;
    return usageCount < 2; // Максимум 2 использования на фразу
  });
  
  // Если все фразы использованы много раз, сбрасываем счетчики для этой темы
  let selectedPhrase;
  if (availablePhrases.length === 0) {
    // Сбрасываем счетчики только для этой темы
    for (const phrase of phrases) {
      userUsage.set(phrase, 0);
    }
    selectedPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  } else {
    // Выбираем случайную фразу из доступных
    selectedPhrase = availablePhrases[Math.floor(Math.random() * availablePhrases.length)];
  }
  
  // Обновляем счетчик использования
  const newUsageCount = (userUsage.get(selectedPhrase) || 0) + 1;
  userUsage.set(selectedPhrase, newUsageCount);
  phraseUsage.set(userId, userUsage);
  
  return selectedPhrase;
}

// Функция для добавления в историю и анализа темы
function addToHistory(userId, message, username) {
  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, []);
  }
  
  const history = conversationHistory.get(userId);
  const topic = detectTopic(message);
  
  history.push({
    text: message,
    timestamp: Date.now(),
    topic: topic,
    username: username,
    used: false
  });
  
  // Обновляем профиль тем пользователя
  updateUserTopics(userId, topic);
  
  // Ограничиваем размер истории
  if (history.length > MAX_HISTORY) {
    history.shift();
  }
}

// Функция для обновления тем пользователя
function updateUserTopics(userId, topic) {
  if (!userTopics.has(userId)) {
    userTopics.set(userId, new Map());
  }
  
  const topics = userTopics.get(userId);
  topics.set(topic, (topics.get(topic) || 0) + 1);
}

// Функция для получения предпочтительной темы пользователя
function getUserPreferredTopic(userId) {
  if (!userTopics.has(userId)) return 'general';
  
  const topics = userTopics.get(userId);
  let maxCount = 0;
  let preferredTopic = 'general';
  
  for (const [topic, count] of topics.entries()) {
    if (count > maxCount) {
      maxCount = count;
      preferredTopic = topic;
    }
  }
  
  return preferredTopic;
}

// Функция для получения контекста из истории
function getContext(userId, currentTopic) {
  if (!conversationHistory.has(userId)) return null;
  
  const history = conversationHistory.get(userId);
  const relevantMessages = history.filter(msg => 
    !msg.used && msg.topic === currentTopic
  );
  
  if (relevantMessages.length === 0) return null;
  
  const contextMessage = relevantMessages[
    Math.floor(Math.random() * relevantMessages.length)
  ];
  contextMessage.used = true;
  
  return contextMessage.text;
}

// Улучшенная функция категоризации
function categorizeMessage(text) {
  const lowerText = text.toLowerCase();
  
  if (/(привет|здравств|хай|hello|hi|добрый|утро|вечер|день)/.test(lowerText)) {
    return 'greetings';
  }
  if (/(\?|что|как|почему|зачем|когда|где)/.test(lowerText)) {
    return 'questions';
  }
  if (/(груст|печал|тоск|плохо|тяжело|сложно|устал|утомил)/.test(lowerText)) {
    return 'emotions_negative';
  }
  if (/(рад|счаст|весел|хорошо|отлично|прекрас|замечат|супер)/.test(lowerText)) {
    return 'emotions_positive';
  }
  
  const topic = detectTopic(text);
  return topic !== 'general' ? topic : 'general';
}

// Функция для проверки, нужно ли отвечать (ИСПРАВЛЕНА)
function shouldRespond(ctx) {
  try {
    const messageText = ctx.message.text.toLowerCase();
    const isReply = ctx.message.reply_to_message;
    
    // Проверяем упоминание Олега
    const hasTrigger = triggerWords.some(word => 
      messageText.includes(word)
    );
    
    // Проверяем, является ли ответом на сообщение Олега
    let isReplyToOleg = false;
    if (isReply && ctx.botInfo) {
      isReplyToOleg = ctx.message.reply_to_message.from.username === ctx.botInfo.username;
    }
    
    // Иногда отвечаем на вопросы даже без упоминания (20% chance)
    const isQuestion = /(\?|что|как|почему|зачем)/.test(messageText);
    const randomResponse = isQuestion && Math.random() < 0.2;
    
    return hasTrigger || isReplyToOleg || randomResponse;
  } catch (error) {
    console.error('Error in shouldRespond:', error);
    return false;
  }
}

// Улучшенная функция генерации ответа (ИСПРАВЛЕНА)
function generateResponse(userId, userMessage, username) {
  try {
    const category = categorizeMessage(userMessage);
    const userTopic = getUserPreferredTopic(userId);
    const context = getContext(userId, category);
    
    console.log(`Generating response for category: ${category}, userTopic: ${userTopic}`);
    
    // Определяем, какую тему использовать
    let responseTopic = category;
    if (category === 'general' && userTopic !== 'general') {
      responseTopic = userTopic;
    }
    
    // Получаем редко используемую фразу
    let response = getRarePhrase(responseTopic, userId);
    
    // Добавляем персонализацию на основе контекста
    if (context && context.length > 5) {
      const contextVariations = [
        `Кстати, о том что ты говорил "${context.substring(0, 40)}..."`,
        `Помнишь, мы обсуждали "${context.substring(0, 35)}"?`,
        `В продолжение твоей мысли о "${context.substring(0, 30)}"...`,
        `Насчет твоего сообщения "${context.substring(0, 35)}"...`
      ];
      
      if (Math.random() < 0.4) { // 40% chance использовать контекст
        response = contextVariations[Math.floor(Math.random() * contextVariations.length)];
      }
    }
    
    // Добавляем использование слов пользователя
    const userWords = userMessage.split(' ').filter(word => 
      word.length > 3 && 
      !triggerWords.includes(word.toLowerCase()) &&
      !/(http|www|\.com|\.ru)/.test(word)
    );
    
    if (userWords.length > 0 && Math.random() < 0.3) {
      const randomWord = userWords[Math.floor(Math.random() * userWords.length)];
      const wordVariations = [
        `Мне интересно твое мнение о "${randomWord}"`,
        `Расскажи больше про "${randomWord}"`,
        `А что для тебя значит "${randomWord}"?`,
        `Интересное слово "${randomWord}"...`
      ];
      response = wordVariations[Math.floor(Math.random() * wordVariations.length)];
    }
    
    // Иногда добавляем имя пользователя
    if (username && Math.random() < 0.2) {
      response = response.replace(/\.$/, '') + `, ${username}`;
    }
    
    return response;
  } catch (error) {
    console.error('Error in generateResponse:', error);
    // Возвращаем запасной ответ в случае ошибки
    return 'Интересно... Расскажи подробнее!';
  }
}

// Обработчик сообщений (ИСПРАВЛЕН)
bot.on(message('text'), async (ctx) => {
  try {
    const userId = ctx.from.id;
    const userMessage = ctx.message.text;
    const username = ctx.from.first_name;
    
    console.log(`Message from ${username}: ${userMessage}`);
    console.log(`Detected topic: ${detectTopic(userMessage)}`);
    
    // Добавляем сообщение в историю с анализом темы
    addToHistory(userId, userMessage, username);
    
    // Проверяем, нужно ли отвечать
    if (shouldRespond(ctx)) {
      // Генерируем ответ
      const response = generateResponse(userId, userMessage, username);
      
      console.log(`Responding to ${username}: ${response}`);
      
      // Отправляем ответ с естественной задержкой
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
  ctx.reply('Привет! Я Олег. Упоминайте мое имя или отвечайте на мои сообщения, чтобы пообщаться! Я запоминаю наши разговоры и стараюсь не повторяться.');
});

bot.command('topics', (ctx) => {
  const userId = ctx.from.id;
  const topics = userTopics.get(userId);
  
  if (topics && topics.size > 0) {
    const topicList = Array.from(topics.entries())
      .map(([topic, count]) => `${topic}: ${count} сообщений`)
      .join('\n');
    ctx.reply(`Твои любимые темы:\n${topicList}`);
  } else {
    ctx.reply('Мы еще недостаточно общались, чтобы определить твои любимые темы!');
  }
});

bot.command('reset', (ctx) => {
  const userId = ctx.from.id;
  conversationHistory.delete(userId);
  userTopics.delete(userId);
  phraseUsage.delete(userId);
  ctx.reply('История нашего общения очищена! Начнем с чистого листа.');
});

// Периодическая очистка старых данных
setInterval(() => {
  try {
    const now = Date.now();
    const threeHours = 3 * 60 * 60 * 1000;
    let clearedHistories = 0;
    
    // Очищаем старую историю
    for (const [userId, history] of conversationHistory.entries()) {
      const filteredHistory = history.filter(msg => 
        now - msg.timestamp < threeHours
      );
      
      if (filteredHistory.length === 0) {
        conversationHistory.delete(userId);
        clearedHistories++;
      } else {
        conversationHistory.set(userId, filteredHistory);
      }
    }
    
    console.log(`Cleaned up: ${clearedHistories} histories`);
  } catch (error) {
    console.error('Error in cleanup:', error);
  }
}, 60 * 60 * 1000); // Каждый час

// Запуск бота
console.log('Starting enhanced Oleg bot...');
bot.launch().then(() => {
  console.log('Улучшенный бот Олег успешно запущен!');
  console.log('Доступные темы:', Object.keys(knowledgeBase));
}).catch((error) => {
  console.error('Ошибка запуска бота:', error);
  process.exit(1);
});

// Элегантное завершение работы
process.once('SIGINT', () => {
  console.log('Shutting down...');
  bot.stop('SIGINT');
  process.exit(0);
});

process.once('SIGTERM', () => {
  console.log('Shutting down...');
  bot.stop('SIGTERM');
  process.exit(0);
});
