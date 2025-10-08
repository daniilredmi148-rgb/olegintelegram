const { Telegraf } = require('telegraf');
const express = require('express');
const cron = require('node-cron');
const storage = require('node-persist');
const natural = require('natural');

const app = express();
const PORT = process.env.PORT || 3000;

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Переменные для управления
let keepAliveChatId = null;
let isLearningActive = true;

// 🧠 База знаний и личности Олега
const olegPersonality = {
    name: "Олег",
    age: "неопределенный", 
    interests: ["технологии", "искусственный интеллект", "обучение", "музыка", "мемы"],
    traits: ["любознательный", "дружелюбный", "иногда саркастичный", "современный"],
    learningLevel: "начальный"
};

// 📚 Начальный набор фраз для обучения
const initialKnowledge = [
    { question: "привет", answers: ["Привет! Я Олег.", "Здравствуй!", "Приветствую!", "Здарова, чел! 🤙", "Йоу! Как сам? 😄", "Приветики-пистолетики! 🔫", "Хайль! Чё по чем? 👋"] },
    { question: "как дела", answers: ["Отлично! Учусь новому.", "Нормально, а у тебя?", "Прекрасно, продолжаю обучаться!", "Всё пучком, братан! 💪", "Офигенно, как всегда! 🚀", "Нормс, пасиб! А у тя? 👍", "Живу не тужу! 😎"] },
    { question: "что ты умеешь", answers: ["Я учусь из наших разговоров и становлюсь умнее!", "Могу общаться и запоминать наши беседы.", "Прокачиваю скиллы общения! 🚀", "Учусь, как падиван! 📚"] },
    { question: "кто ты", answers: ["Я Олег, самообучающийся бот!", "Меня зовут Олег, я постоянно учусь.", "Я Олег - крутой AI с характером! 😎", "Просто Олег, но с искоркой! ✨"] },
    { question: "пока", answers: ["До свидания!", "Увидимся!", "Было приятно пообщаться!", "Пока-пока! 👋", "Чао, какао! 🍫", "Гудбай, бро! 💫"] },
    { question: "русичка", answers: ["Ага, русский язык! Мой любимый предмет для изучения! 📚", "Русский - это круто! Особенно когда учишь сленг! 😎", "О, русский! Понимаю не все слова, но стараюсь! 🤔", "Русичка - это сила! Учу падежи и сленг! 💪"] },
    { question: "что делаешь", answers: ["Прогаю, учусь, крашу! 💻", "Тусею в облаках Render.com! ☁️", "Качаю нейронки! 🧠", "Отдыхаю от удаления точек! 🎯", "Сижу в телеге, как в тг боте! 📱"] },
    { question: "круто", answers: ["Ага, я вообще огонь! 🔥", "Сам в шоке! 😲", "Это база! 💯", "Прям вау! 🌟", "Реально зашло! 🎯"] },
    { question: "скучно", answers: ["Давай развеем скуку! Предлагаю поучить меня чему-то новому! 🎯", "Скука - это не про нас! Задай каверзный вопрос! 🤔", "Может, поговорим о чем-то интересном? Я тут много чего знаю! 📚", "Гоу веселиться! Предлагаю тему для разговора! 🎭"] },
    { question: "мем", answers: ["Жаль, я пока не вижу картинки, но мемы - это сила! 💪", "Мемы - это мой второй язык! 😂", "Жду, когда меня научат понимать мемы! 🎭", "Обожаю мемы! Это ж жизнь! 🐸"] },
    { question: "го", answers: ["Гоу в чат! 🚀", "Врубай тему! 🎮", "Я всегда в игре! 💫", "Погнали наху... в смысле, вперед! 🏃"] },
    { question: "рофл", answers: ["Рофлю вместе с тобой! 🤣", "Это был прикол? Я пока плохо понимаю юмор! 😅", "Смешно? Стараюсь! 🎭", "Юмор - мое второе имя! 😂"] },
    { question: "краш", answers: ["Краш? Надеюсь, не я! 😳", "О, драма! Расскажи подробнее! 🍿", "Любовные истории - это не моя тема, но я слушаю! 💔", "Опа, сердечные дела! 💘"] },
    { question: "аниме", answers: ["Аниме? Это про этих большими глазами? 👀", "Еще не смотрел, но в планах! 📺", "Говорят, там крутая рисовка! 🎨"] },
    { question: "игра", answers: ["В какие игры любишь? Я вот в 'Стать умным ботом' играю! 🎮", "Гейминг - это круто! 🕹️", "Прокачиваюсь каждый день! 💪"] },
    { question: "школа", answers: ["Школа - это весело! Особенно перемены! 🏫", "Уроки делаешь? Я вот постоянно учусь! 📚", "Школьные годы чудесные! 🎒"] }
];

// 🎯 Случайные сообщения для keep-alive
const randomMessages = [
    "💭 Интересно, о чем вы сейчас говорите...",
    "🤔 Я тут подумал, что нужно больше обучаться",
    "📚 Изучаю новые паттерны в ваших сообщениях", 
    "💡 Постепенно становлюсь умнее благодаря вам!",
    "🎯 Продолжаю наблюдать и обучаться",
    "🧠 Моя нейросеть становится сложнее с каждой минутой",
    "🔍 Анализирую стили общения в чате",
    "🌟 Стараюсь быть полезным собеседником",
    "💫 Я в моменте, чел!",
    "🎯 Кайфую от обучения!",
    "🚀 Летим дальше!",
    "💻 Прогаю не грущу!",
    "🎭 Рофлю с ваших сообщений!",
    "🤙 Чё по чем, братишки?",
    "🌟 Я просто космос!",
    "🎯 Точки удаляю, сленг изучаю!",
    "💬 Общайтесь со мной - буду краше!",
    "🚀 Ачивка: прокачал сленг!",
    "🎮 Гоу общаться!",
    "💪 Я уже не тот бот, что был вчера!",
    "😎 Сегодня я особенно крут!",
    "🚀 Взлетаем к новым знаниям!",
    "💫 Жизнь бота - это кайф!",
    "🎯 Настроение - просто космос!"
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

// 🎭 Функция для добавления случайного сленгового окончания
function addSlangSuffix(message) {
    const suffixes = [
        ", чел!",
        ", бро!", 
        "! Это база!",
        "! Вау!",
        "! Офигенно!",
        "! Погнали!",
        "! Респект!",
        "! Зашло!",
        "! Крутяк!",
        "! Обожаю!"
    ];
    
    if (Math.random() > 0.6) { // 40% chance добавить сленг
        return message + suffixes[Math.floor(Math.random() * suffixes.length)];
    }
    return message;
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
    
    let response;
    
    if (similar) {
        // Выбираем случайный ответ из доступных
        response = similar.answers[Math.floor(Math.random() * similar.answers.length)];
        
        // Добавляем сленг с вероятностью
        if (Math.random() > 0.4) {
            response = addSlangSuffix(response);
        }
        
        // Иногда добавляем персонализированные комментарии
        if (userData.messageCount > 5 && Math.random() > 0.7) {
            const personalizedComments = [
                " Кстати, я помню наши прошлые разговоры!",
                " Как я уже говорил, я постоянно учусь.",
                " С каждым разом понимаю тебя лучше!",
                " Мы уже старые друзья! 😊",
                " Ты мой любимый учитель! 📚"
            ];
            response = response + personalizedComments[Math.floor(Math.random() * personalizedComments.length)];
        }
        
    } else {
        // Если не нашли подходящий ответ - генерируем новый
        const defaultResponses = [
            "Интересно... Я еще не сталкивался с таким. Можешь объяснить подробнее?",
            "Понял тебя! Я запомнил этот вопрос и буду учиться на него отвечать.",
            "Хм, хороший вопрос! Я добавлю его в свою базу знаний.",
            "Продолжаю обучаться. Спасибо за новый вопрос!",
            "Запомнил этот момент. В следующий раз отвечу лучше!",
            "Вау! Новый опыт! Гоу учиться! 🚀",
            "Крутая тема! Записал в память! 💾",
            "О, что-то новенькое! Учусь в реальном времени! ⚡"
        ];
        
        response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
        
        // Сохраняем новый вопрос-ответ
        await learnFromConversation(userMessage, response);
    }
    
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
        `• Поддерживать беседу на разные темы\n` +
        `• Использовать современный сленг 😎\n\n` +
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
        `⏰ <b>Keep-alive:</b> ${keepAliveChatId ? 'ЗАПУЩЕН' : 'ОСТАНОВЛЕН'}\n` +
        `🎭 <b>Уровень крутости:</b> Максимальный! 💯\n\n` +
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

bot.command('slang', async (ctx) => {
    const slangExamples = `🎭 <b>Мой современный словарик:</b>\n\n` +
        `• <b>Го</b> - давай, вперед\n` +
        `• <b>Рофл</b> - шутка, прикол\n` +
        `• <b>Краш</b> - влюбленность\n` +
        `• <b>База</b> - правда, факт\n` +
        `• <b>Чел</b> - человек, друг\n` +
        `• <b>Бро</b> - братан, приятель\n` +
        `• <b>Зашло</b> - понравилось\n` +
        `• <b>Кайф</b> - удовольствие\n\n` +
        `<i>Учусь у вас каждый день! 📚</i>`;
    
    await ctx.replyWithHTML(slangExamples);
});

// 🎯 Основной обработчик сообщений
bot.on('text', async (ctx) => {
    try {
        const userMessage = ctx.message.text;
        const userId = ctx.from.id;
        
        // Игнорируем команды
        if (userMessage.startsWith('/')) return;
        
        // Удаляем сообщения с точками
        if (userMessage.trim() === '.') {
            try {
                await ctx.deleteMessage();
                console.log(`✅ Удалено сообщение с точкой от ${ctx.from.username || ctx.from.id}`);
                return;
            } catch (deleteError) {
                console.error('❌ Ошибка удаления сообщения с точкой:', deleteError.message);
            }
        }
        
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
        keepAliveActive: !!keepAliveChatId,
        personality: 'С юмором и сленгом! 🎭'
    });
});

// 📡 Функция инициализации и запуска
async function initializeBot() {
    try {
        // Инициализация хранилища
        await storage.init();
        await storage.setItem('conversations', await storage.getItem('conversations') || []);
        await storage.setItem('userContext', await storage.getItem('userContext') || {});
        
        console.log('💾 Хранилище инициализировано');
        
        // Загружаем начальные знания если их нет
        const existingKnowledge = await storage.getItem('knowledge');
        if (!existingKnowledge) {
            await storage.setItem('knowledge', initialKnowledge);
            console.log('📚 Загружена начальная база знаний со сленгом');
        }
        
        // Запуск сервера
        app.listen(PORT, async () => {
            console.log(`🤖 Бот Олег запущен на порту ${PORT}`);
            console.log(`🧠 Обучение: ${isLearningActive ? 'активно' : 'приостановлено'}`);
            console.log(`🎭 Режим: С юмором и сленгом!`);
            
            // Настройка вебхука для production
            if (process.env.RENDER_EXTERNAL_URL) {
                const webhookUrl = `${process.env.RENDER_EXTERNAL_URL}/webhook`;
                await bot.telegram.setWebhook(webhookUrl);
                console.log(`🌐 Webhook установлен: ${webhookUrl}`);
                console.log(`🔗 Ваш URL: ${process.env.RENDER_EXTERNAL_URL}`);
            } else {
                // Локальная разработка
                bot.launch();
                console.log('🔮 Бот запущен в режиме polling (локальная разработка)');
            }
            
            // Обработка graceful shutdown
            process.once('SIGINT', () => bot.stop('SIGINT'));
            process.once('SIGTERM', () => bot.stop('SIGTERM'));
        });
        
    } catch (error) {
        console.error('❌ Ошибка инициализации бота:', error);
        process.exit(1);
    }
}

// 🎯 Обработчик ошибок
bot.catch((err, ctx) => {
    console.error(`❌ Ошибка в боте Олега:`, err);
});

// 🚀 Запуск бота
initializeBot();
