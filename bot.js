import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Basic health check endpoint
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

// База знаний Олега с категориями
const knowledgeBase = {
  greetings: [
    'Привет! Как дела?',
    'Здравствуй! Рад тебя видеть',
    'Приветствую! Что нового?',
    'Привет! Как твои дела?'
  ],
  questions: [
    'Интересно, а что ты думаешь об этом?',
    'Хм, хороший вопрос... А сам как считаешь?',
    'Давай обсудим это подробнее',
    'Интересная тема, расскажи больше'
  ],
  emotions: [
    'Понимаю тебя...',
    'Это действительно важно',
    'Интересная мысль!',
    'Я тебя слышу'
  ],
  general: [
    'Расскажи подробнее',
    'Интересно... Продолжай',
    'Что еще тебя волнует?',
    'Давай поговорим о чем-то другом'
  ]
};

// История разговоров для контекста
const conversationHistory = new Map();
const MAX_HISTORY = 10;

// Ключевые слова для активации Олега
const triggerWords = ['олег', 'олежа', 'олег', 'oleg', 'oleg', 'леха'];

// Функция для добавления в историю
function addToHistory(userId, message) {
  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, []);
  }
  
  const history = conversationHistory.get(userId);
  history.push({
    text: message,
    timestamp: Date.now(),
    used: false
  });
  
  // Ограничиваем размер истории
  if (history.length > MAX_HISTORY) {
    history.shift();
  }
}

// Функция для получения контекста
function getContext(userId, currentMessage) {
  if (!conversationHistory.has(userId)) return null;
  
  const history = conversationHistory.get(userId);
  const unusedMessages = history.filter(msg => !msg.used);
  
  if (unusedMessages.length === 0) return null;
  
  // Выбираем случайное непрочитанное сообщение
  const randomIndex = Math.floor(Math.random() * unusedMessages.length);
  const contextMessage = unusedMessages[randomIndex];
  
  // Помечаем как использованное
  contextMessage.used = true;
  
  return contextMessage.text;
}

// Функция для определения категории сообщения
function categorizeMessage(text) {
  const lowerText = text.toLowerCase();
  
  if (/(привет|здравств|хай|hello|hi|добрый|утро|вечер|день)/.test(lowerText)) {
    return 'greetings';
  }
  if (/(\?|что|как|почему|зачем|когда|где)/.test(lowerText)) {
    return 'questions';
  }
  if (/(груст|рад|злюсь|сердит|радост|счаст|обид|зло|весел)/.test(lowerText)) {
    return 'emotions';
  }
  
  return 'general';
}

// Функция для проверки, нужно ли отвечать
function shouldRespond(ctx) {
  const messageText = ctx.message.text.toLowerCase();
  const isReply = ctx.message.reply_to_message;
  
  // Проверяем упоминание Олега
  const hasTrigger = triggerWords.some(word => 
    messageText.includes(word)
  );
  
  // Проверяем, является ли ответом на сообщение Олега
  const isReplyToOleg = isReply && 
    ctx.message.reply_to_message.from.username === ctx.botInfo.username;
  
  return hasTrigger || isReplyToOleg;
}

// Функция для генерации ответа
function generateResponse(userId, userMessage) {
  const category = categorizeMessage(userMessage);
  const context = getContext(userId, userMessage);
  
  // Берем ответ из соответствующей категории
  const possibleResponses = [...knowledgeBase[category]];
  
  // Если есть контекст, добавляем персонализированные ответы
  if (context) {
    possibleResponses.push(
      `Кстати, о том что ты говорил: "${context.substring(0, 50)}..."`,
      `В продолжение нашей темы...`,
      `Помнишь, ты говорил про это?`
    );
  }
  
  // Добавляем ответы, использующие слова пользователя
  const userWords = userMessage.split(' ').filter(word => 
    word.length > 3 && !triggerWords.includes(word.toLowerCase())
  );
  
  if (userWords.length > 0) {
    const randomWord = userWords[Math.floor(Math.random() * userWords.length)];
    possibleResponses.push(
      `Расскажи больше о "${randomWord}"`,
      `Мне интересно твое мнение о ${randomWord}`,
      `А что для тебя значит "${randomWord}"?`
    );
  }
  
  // Выбираем случайный ответ
  return possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
}

// Обработчик сообщений
bot.on(message('text'), async (ctx) => {
  const userId = ctx.from.id;
  const userMessage = ctx.message.text;
  
  console.log(`Message from ${ctx.from.first_name}: ${userMessage}`);
  
  // Добавляем сообщение в историю
  addToHistory(userId, userMessage);
  
  // Проверяем, нужно ли отвечать
  if (shouldRespond(ctx)) {
    // Генерируем ответ
    const response = generateResponse(userId, userMessage);
    
    console.log(`Responding to ${ctx.from.first_name}: ${response}`);
    
    // Отправляем ответ с случайной задержкой (как будто думает)
    const delay = Math.random() * 2000 + 1000;
    
    setTimeout(async () => {
      try {
        await ctx.reply(response);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }, delay);
  }
});

// Обработчик команд
bot.command('start', (ctx) => {
  ctx.reply('Привет! Я Олег. Упоминайте мое имя или отвечайте на мои сообщения, чтобы пообщаться!');
});

bot.command('status', (ctx) => {
  const userId = ctx.from.id;
  const history = conversationHistory.get(userId) || [];
  ctx.reply(`Статус: активен\nСообщений в истории: ${history.length}`);
});

// Функция для периодической очистки истории
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  let cleared = 0;
  
  for (const [userId, history] of conversationHistory.entries()) {
    const filteredHistory = history.filter(msg => 
      now - msg.timestamp < oneHour
    );
    
    if (filteredHistory.length === 0) {
      conversationHistory.delete(userId);
      cleared++;
    } else {
      conversationHistory.set(userId, filteredHistory);
    }
  }
  
  console.log(`Cleared ${cleared} expired histories`);
}, 30 * 60 * 1000); // Каждые 30 минут

// Запуск бота
console.log('Starting Oleg bot...');
bot.launch().then(() => {
  console.log('Бот Олег успешно запущен!');
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
