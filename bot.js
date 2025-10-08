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
    'Хай! Как настроение?'
  ],
  questions: [
    'Интересно, а что ты думаешь об этом?',
    'Хм, хороший вопрос... А сам как считаешь?',
    'Давай обсудим это подробнее',
    'Интересная тема, расскажи больше'
  ],
  emotions_positive: [
    'Это прекрасно! Рад за тебя!',
    'Здорово! Продолжай в том же духе!',
    'Отлично! Так держать!'
  ],
  emotions_negative: [
    'Понимаю тебя... Это непросто',
    'Сочувствую... Держись!',
    'Я тебя понимаю... Всё наладится'
  ],
  technology: [
    'Технологии - это интересно! Что тебя привлекает?',
    'Любопытная техническая тема!',
    'Технологии постоянно развиваются, не так ли?'
  ],
  entertainment: [
    'Развлечения - это важно для отдыха!',
    'Интересно, что тебе нравится?',
    'Культура и искусство обогащают жизнь'
  ],
  general: [
    'Интересно... Расскажи подробнее',
    'Понятно... Что еще хочешь обсудить?',
    'Любопытно... Продолжай',
    'Занимательная тема!',
    'Давай поговорим об этом'
  ]
};

// Система частоты использования фраз
const phraseUsage = new Map();
const conversationHistory = new Map();
const userTopics = new Map();
const MAX_HISTORY = 10;

// Ключевые слова для активации Олега
const triggerWords = ['олег', 'олежа', 'oleg', 'леха'];

// Тематические ключевые слова
const topicKeywords = {
  technology: ['компьютер', 'телефон', 'интернет', 'программа', 'приложение'],
  entertainment: ['фильм', 'сериал', 'музыка', 'игра', 'кино'],
  sports: ['спорт', 'футбол', 'хоккей', 'баскетбол', 'тренировка'],
  work_study: ['работа', 'учеба', 'проект', 'задание', 'дедлайн'],
  philosophy: ['жизнь', 'смысл', 'судьба', 'время', 'любовь'],
  everyday: ['дом', 'еда', 'покупки', 'уборка', 'готовка']
};

// Функция для определения темы сообщения
function detectTopic(message) {
  try {
    const lowerMessage = message.toLowerCase();
    const topicScores = {};
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      topicScores[topic] = keywords.reduce((score, keyword) => {
        return score + (lowerMessage.includes(keyword) ? 1 : 0);
      }, 0);
    }
    
    const maxScore = Math.max(...Object.values(topicScores));
    if (maxScore > 0) {
      const detectedTopics = Object.entries(topicScores)
        .filter(([_, score]) => score === maxScore)
        .map(([topic]) => topic);
      
      return detectedTopics[Math.floor(Math.random() * detectedTopics.length)];
    }
    
    return 'general';
  } catch (error) {
    console.error('Error in detectTopic:', error);
    return 'general';
  }
}

// ПРОСТАЯ И НАДЕЖНАЯ функция для получения фразы
function getRarePhrase(topic, userId) {
  try {
    // Всегда используем существующую тему
    const safeTopic = knowledgeBase[topic] ? topic : 'general';
    const phrases = knowledgeBase[safeTopic];
    
    console.log(`Getting phrase for topic: ${safeTopic}, available phrases: ${phrases.length}`);
    
    // Простая логика - выбираем случайную фразу
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex];
    
  } catch (error) {
    console.error('Error in getRarePhrase:', error);
    // Аварийный ответ
    return 'Интересно... Расскажи подробнее!';
  }
}

// Функция для добавления в историю
function addToHistory(userId, message, username) {
  try {
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
    
    if (history.length > MAX_HISTORY) {
      history.shift();
    }
  } catch (error) {
    console.error('Error in addToHistory:', error);
  }
}

// Функция для получения контекста из истории
function getContext(userId) {
  try {
    if (!conversationHistory.has(userId)) return null;
    
    const history = conversationHistory.get(userId);
    const unusedMessages = history.filter(msg => !msg.used);
    
    if (unusedMessages.length === 0) return null;
    
    const contextMessage = unusedMessages[
      Math.floor(Math.random() * unusedMessages.length)
    ];
    contextMessage.used = true;
    
    return contextMessage.text;
  } catch (error) {
    console.error('Error in getContext:', error);
    return null;
  }
}

// Упрощенная функция категоризации
function categorizeMessage(text) {
  try {
    const lowerText = text.toLowerCase();
    
    if (/(привет|здравств|хай|hello|hi)/.test(lowerText)) {
      return 'greetings';
    }
    if (/(\?|что|как|почему|зачем)/.test(lowerText)) {
      return 'questions';
    }
    if (/(груст|печал|плохо|тяжело)/.test(lowerText)) {
      return 'emotions_negative';
    }
    if (/(рад|счаст|хорошо|отлично)/.test(lowerText)) {
      return 'emotions_positive';
    }
    
    const topic = detectTopic(text);
    return topic !== 'general' ? topic : 'general';
  } catch (error) {
    console.error('Error in categorizeMessage:', error);
    return 'general';
  }
}

// Функция для проверки, нужно ли отвечать
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
    
    return hasTrigger || isReplyToOleg;
  } catch (error) {
    console.error('Error in shouldRespond:', error);
    return false;
  }
}

// Упрощенная функция генерации ответа
function generateResponse(userId, userMessage, username) {
  try {
    const category = categorizeMessage(userMessage);
    const context = getContext(userId);
    
    console.log(`Generating response for category: ${category}`);
    
    // Получаем базовую фразу
    let response = getRarePhrase(category, userId);
    
    // Добавляем контекст если есть
    if (context && context.length > 5 && Math.random() < 0.3) {
      response = `Кстати, о том что ты говорил... ${response}`;
    }
    
    // Иногда добавляем имя пользователя
    if (username && Math.random() < 0.2) {
      response = response.replace(/\.$/, '') + `, ${username}`;
    }
    
    return response;
  } catch (error) {
    console.error('Error in generateResponse:', error);
    return 'Привет! Как дела?';
  }
}

// Обработчик сообщений
bot.on(message('text'), async (ctx) => {
  try {
    const userId = ctx.from.id;
    const userMessage = ctx.message.text;
    const username = ctx.from.first_name;
    
    console.log(`Message from ${username}: ${userMessage}`);
    
    // Добавляем сообщение в историю
    addToHistory(userId, userMessage, username);
    
    // Проверяем, нужно ли отвечать
    if (shouldRespond(ctx)) {
      console.log(`Should respond to ${username}`);
      
      // Генерируем ответ
      const response = generateResponse(userId, userMessage, username);
      
      console.log(`Responding with: ${response}`);
      
      // Отправляем ответ с задержкой
      const delay = Math.random() * 2000 + 1000;
      
      setTimeout(async () => {
        try {
          await ctx.reply(response);
          console.log(`Message sent successfully to ${username}`);
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }, delay);
    } else {
      console.log(`No need to respond to ${username}`);
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
});

// Команды бота
bot.command('start', (ctx) => {
  ctx.reply('Привет! Я Олег. Упоминайте мое имя или отвечайте на мои сообщения, чтобы пообщаться!');
});

bot.command('status', (ctx) => {
  const userId = ctx.from.id;
  const history = conversationHistory.get(userId) || [];
  ctx.reply(`Бот активен! Сообщений в истории: ${history.length}`);
});

// Обработчик ошибок бота
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
});

// Запуск бота
console.log('Starting Oleg bot...');
bot.launch().then(() => {
  console.log('Бот Олег успешно запущен!');
}).catch((error) => {
  console.error('Ошибка запуска бота:', error);
});

// Элегантное завершение работы
process.once('SIGINT', () => {
  console.log('Shutting down...');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('Shutting down...');
  bot.stop('SIGTERM');
});
