const { Telegraf } = require('telegraf');
const express = require('express');
const cron = require('node-cron');
const storage = require('node-persist');
const natural = require('natural');

const app = express();
const PORT = process.env.PORT || 3000;

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Инициализация хранилища
await storage.init();
await storage.setItem('conversations', await storage.getItem('conversations') || []);
await storage.setItem('userContext', await storage.getItem('userContext') || {});

// Переменные для управления
let keepAliveChatId = null;
let isLearningActive = true;

// 🧠 База знаний и личности Олега
const olegPersonality = {
    name: "Олег",
    age: "14",
    interests: ["технологии", "искусственный интеллект", "обучение", "музыка"],
    traits: ["злой", "красивый", "иногда саркастичный"],
    learningLevel: "начальный"
};

// 📚 Начальный набор фраз для обучения
const initialKnowledge = [
    { question: "привет", answers: ["Привет! Я Олег.", "Здравствуй!", "Приветствую!"] },
    { question: "как дела", answers: ["Отлично! Учусь новому.", "Нормально, а у тебя?", "Прекрасно, продолжаю обучаться!"] },
    { question: "что ты умеешь", answers: ["Я учусь из наших разговоров и становлюсь умнее!", "Могу общаться и запоминать наши беседы."] },
    { question: "кто ты", answers: ["Я Олег, самообучающийся бот!", "Меня зовут Олег, я главный хейтер русички."] },
    { question: "пока", answers: ["До свидания!", "Увидимся!", "Было приятно пообщаться!"] }
];

// 🎯 Случайные сообщения для keep-alive
const randomMessages = [
    "💭 Интересно, о чем вы сейчас говорите...",
    "🤔 Я тут подумал, что школа хуйня",
    "📚 Изучаю новые паттерны в ваших сообщениях",
    "💡 Постепенно становлюсь умнее благодаря вам!",
    "🎯 Продолжаю наблюдать и обучаться",
    "🧠 Моя нейросеть становится сложнее с каждой минутой",
    "🔍 Анализирую стили общения в чате",
    "🌟 Русичка иди нахуй"
];

// 🧮 Функции для обработки естественного языка
function tokenizeText(text) {
    return text.toLowerCase()
        .replace(/[^\w\sа-яё]/gi, '')
        .split(/\s+/)
        .filter(word => word.length > 2);
}

function findSimilarQuestion(input, knowledgeBase) {
    const inputTokens = tokenizeText(input);
    
    let bestMatch = null;
    let bestScore = 0;
    
    knowledgeBase.forEach(item => {
        const questionTokens = tokenizeText(item.question);
        const commonWords = inputTokens.filter(word => 
            questionTokens.some(qWord => natural.JaroWinklerDistance(word, qWord) > 0.8)
        );
        
        const score = commonWords.length / Math.max(inputTokens.length, questionTokens.length);
        
        if (score > bestScore && score > 0.3) {
            bestScore = score;
            bestMatch = item;
        }
    });
    
    return bestMatch;
}

// 💾 Функции работы с памятью
async function saveConversation(userId, userMessage, botResponse) {
    const conversations = await storage.getItem('conversations') || [];
    const userContext = await storage.getItem('userContext') || {};
    
    // Сохраняем разговор
    conversations.push({
        userId,
        userMessage,
        botResponse,
        timestamp: new Date().toISOString()
    });
    
    // Ограничиваем размер памяти (последние 1000 сообщений)
    if (conversations.length > 1000) {
        conversations.splice(0, conversations.length - 1000);
    }
    
    // Обновляем контекст пользователя
    if (!userContext[userId]) {
        userContext[userId] = {
            messageCount: 0,
            lastTopics: [],
            personalityTraits: {}
        };
    }
    
    userContext[userId].messageCount++;
    userContext[userId].lastTopics.push(userMessage.slice(0, 50));
    
    if (userContext[userId].lastTopics.length > 10) {
        userContext[userId].lastTopics.shift();
    }
    
    await storage.setItem('conversations', conversations);
    await storage.setItem('userContext', userContext);
}

async function learnFromConversation(userMessage, botResponse) {
    const knowledge = await storage.getItem('knowledge') || initialKnowledge;
    const tokens = tokenizeText(userMessage);
    
    if (tokens.length >= 2) {
        // Ищем похожие вопросы
        const similar = findSimilarQuestion(userMessage, knowledge);
        
        if (!similar) {
            // Добавляем новый вопрос-ответ
            knowledge.push({
                question: userMessage.toLowerCase(),
                answers: [botResponse],
                learnedFrom: new Date().toISOString(),
                usageCount: 1
            });
        } else {
            // Обновляем существующий
            if (!similar.answers.includes(botResponse)) {
                similar.answers.push(botResponse);
            }
            similar.usageCount = (similar.usageCount || 1) + 1;
        }
        
        await storage.setItem('knowledge', knowledge);
    }
}

async function generateResponse(userMessage, userId) {
    const knowledge = await storage.getItem('knowledge') || initialKnowledge;
    const userContext = await storage.getItem('userContext') || {};
    const userData = userContext[userId] || {};
    
    // Поиск похожего вопроса
    const similar = findSimilarQuestion(userMessage, knowledge);
    
    if (similar) {
        // Выбираем случайный ответ из доступных
        const randomAnswer = similar.answers[Math.floor(Math.random() * similar.answers.length)];
        
        // Иногда добавляем персонализированные комментарии
        if (userData.messageCount > 5 && Math.random() > 0.7) {
            const personalizedComments = [
                " Кстати, я помню наши прошлые разговоры!",
                " Как я уже говорил, я постоянно учусь.",
                " С каждым разом понимаю тебя лучше!"
            ];
            return randomAnswer + personalizedComments[Math.floor(Math.random() * personalizedComments.length)];
        }
        
        return randomAnswer;
    }
    
    // Если не нашли подходящий ответ - генерируем новый
    const defaultResponses = [
        "Интересно... Я еще не сталкивался с таким. Можешь объяснить подробнее?",
        "Понял тебя! Я запомнил этот вопрос и буду учиться на него отвечать.",
        "Хм, хороший вопрос! Я добавлю его в свою базу знаний.",
        "Продолжаю обучаться. Спасибо за новый вопрос!",
        "Запомнил этот момент. В следующий раз отвечу лучше!"
    ];
    
    const response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    
    // Сохраняем новый вопрос-ответ
    await learnFromConversation(userMessage, response);
    
    return response;
}

// 🔄 Keep-alive система
function startKeepAliveSystem(chatId) {
    if (keepAliveChatId) return;
    
    keepAliveChatId = chatId;
    console.log('🚀 Запуск системы поддержания активности для Олега...');
    
    // Каждые 7 минут отправляем сообщение
    cron.schedule('*/7 * * * *', async () => {
        if (!keepAliveChatId) return;
        
        try {
            const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
            console.log(`⏰ Олег отправляет keep-alive: ${randomMessage}`);
            
            // Отправляем сообщение
            const sentMessage = await bot.telegram.sendMessage(keepAliveChatId, randomMessage);
            
            // Удаляем через 1 минуту
            setTimeout(async () => {
                try {
                    await bot.telegram.deleteMessage(keepAliveChatId, sentMessage.message_id);
                    console.log('✅ Keep-alive сообщение удалено');
                } catch (deleteError) {
                    console.error('❌ Ошибка удаления keep-alive сообщения:', deleteError.message);
                }
            }, 60000); // 1 минута
            
        } catch (error) {
            console.error('❌ Ошибка отправки keep-alive сообщения:', error.message);
        }
    });
    
    console.log('✅ Система поддержания активности запущена');
}

// 👋 Команды бота
bot.command('start', async (ctx) => {
    const welcomeMessage = `🤖 <b>Привет, я Олег!</b>\n\n` +
        `Я - самообучающийся бот, который становится умнее с каждым нашим разговором!\n\n` +
        `🧠 <b>Что я умею:</b>\n` +
        `• Запоминать наши разговоры\n` +
        `• Учиться на ваших сообщениях\n` +
        `• Становиться лучше с течением времени\n` +
        `• Поддерживать беседу на разные темы\n\n` +
        `💡 <b>Просто общайся со мной как с обычным человеком!</b>\n` +
        `Чем больше мы говорим, тем умнее я становлюсь.\n\n` +
        `⚙️ <i>Система поддержания активности автоматически запущена</i>`;
    
    await ctx.replyWithHTML(welcomeMessage);
    
    // Автоматически запускаем keep-alive в группах
    if (ctx.chat.type !== 'private') {
        startKeepAliveSystem(ctx.chat.id);
    }
});

bot.command('status', async (ctx) => {
    const knowledge = await storage.getItem('knowledge') || initialKnowledge;
    const conversations = await storage.getItem('conversations') || [];
    
    const statusMessage = `📊 <b>Статус Олега</b>\n\n` +
        `🧠 <b>База знаний:</b> ${knowledge.length} вопросов\n` +
        `💾 <b>Разговоров записано:</b> ${conversations.length}\n` +
        `🔧 <b>Обучение:</b> ${isLearningActive ? 'АКТИВНО' : 'ПАУЗА'}\n` +
        `⏰ <b>Keep-alive:</b> ${keepAliveChatId ? 'ЗАПУЩЕН' : 'ОСТАНОВЛЕН'}\n\n` +
        `💡 <i>Я постоянно расту и развиваюсь!</i>`;
    
    await ctx.replyWithHTML(statusMessage);
});

bot.command('learn', async (ctx) => {
    isLearningActive = !isLearningActive;
    await ctx.reply(isLearningActive ? 
        '🧠 <b>Обучение активировано!</b> Я снова учусь на ваших сообщениях.' :
        '⏸ <b>Обучение приостановлено.</b> Я временно не запоминаю разговоры.',
        { parse_mode: 'HTML' }
    );
});

// 🎯 Основной обработчик сообщений
bot.on('text', async (ctx) => {
    try {
        const userMessage = ctx.message.text;
        const userId = ctx.from.id;
        
        // Игнорируем команды
        if (userMessage.startsWith('/')) return;
        
        // Генерируем ответ
        const response = await generateResponse(userMessage, userId);
        
        // Отправляем ответ
        await ctx.reply(response);
        
        // Сохраняем в память если обучение активно
        if (isLearningActive) {
            await saveConversation(userId, userMessage, response);
            console.log(`💾 Олег сохранил разговор с пользователем ${userId}`);
        }
        
    } catch (error) {
        console.error('❌ Ошибка обработки сообщения:', error);
        await ctx.reply('Произошла ошибка. Попробуйте еще раз!');
    }
});

// 🚀 Настройка webhook для Render.com
app.use(express.json());

app.post(`/webhook`, async (req, res) => {
    try {
        await bot.handleUpdate(req.body);
        res.sendStatus(200);
    } catch (error) {
        console.error('❌ Ошибка обработки вебхука:', error);
        res.sendStatus(200);
    }
});

app.get('/', (req, res) => {
    res.json({ 
        status: 'Бот Олег работает!', 
        learningActive: isLearningActive,
        keepAliveActive: !!keepAliveChatId 
    });
});

// 📡 Запуск сервера
app.listen(PORT, async () => {
    console.log(`🤖 Бот Олег запущен на порту ${PORT}`);
    console.log(`🧠 Обучение: ${isLearningActive ? 'активно' : 'приостановлено'}`);
    
    // Загружаем начальные знания если их нет
    const existingKnowledge = await storage.getItem('knowledge');
    if (!existingKnowledge) {
        await storage.setItem('knowledge', initialKnowledge);
        console.log('📚 Загружена начальная база знаний');
    }
    
    // Настройка вебхука для production
    if (process.env.RENDER_EXTERNAL_URL) {
        const webhookUrl = `${process.env.RENDER_EXTERNAL_URL}/webhook`;
        await bot.telegram.setWebhook(webhookUrl);
        console.log(`🌐 Webhook установлен: ${webhookUrl}`);
    } else {
        // Локальная разработка
        bot.launch();
        console.log('🔮 Бот запущен в режиме polling');
    }
    
    // Обработка graceful shutdown
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
});

// 🎯 Обработчик ошибок
bot.catch((err, ctx) => {
    console.error(`❌ Ошибка в боте Олега:`, err);
});
