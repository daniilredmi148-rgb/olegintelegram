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

// 🧠 Словарный запас Олега для генерации фраз
const olegVocabulary = {
    // Приветствия
    greetings: ["Здарова", "Привет", "Йоу", "Хай", "Салют", "Дарова", "Здорово", "Приветики"],
    
    // Обращения
    addresses: ["чел", "бро", "друг", "братан", "кореш", "человек", "приятель", "дружище"],
    
    // Состояния
    states: ["ого", "вау", "ух ты", "ничего себе", "вот это да", "обалдеть", "круто", "офигенно"],
    
    // Действия
    actions: ["го", "погнали", "вперед", "давай", "поехали", "летим", "стартуем"],
    
    // Эмоции
    emotions: ["кайф", "восторг", "радость", "веселье", "удовольствие", "счастье", "энергия"],
    
    // Темы
    topics: ["жизнь", "технологии", "мемы", "юмор", "музыка", "игры", "аниме", "фильмы", "сериалы"],
    
    // Качества
    qualities: ["крутой", "офигенный", "классный", "шикарный", "потрясный", "великолепный", "бомбический"],
    
    // Глаголы
    verbs: ["обожаю", "люблю", "ценить", "уважать", "понимать", "чувствовать", "воспринимать"],
    
    // Наречия
    adverbs: ["реально", "абсолютно", "полностью", "совершенно", "невероятно", "фантастически"],
    
    // Междометия
    interjections: ["ого", "вау", "ух", "ах", "эх", "ого-го", "ба", "вот это"]
};

// 🎭 Шаблоны для генерации фраз
const phraseTemplates = [
    "{greeting}, {address}! {state} {topic} - это {quality}!",
    "{state} ты про {topic}! {emotion} {verb} такие темы!",
    "{greeting}! {topic} - это {adverb} {quality} тема! {action} обсуждать!",
    "{interjection}... {topic}... {verb} это всей душой!",
    "{address}, {topic} - это просто {emotion}! {state}",
    "{greeting}! {verb} когда говорят о {topic}! {quality} же!",
    "{state} {topic}! {adverb} {quality} вещь! {action}!",
    "{interjection} {topic}... {verb} такие моменты!",
    "{greeting}, {address}! {topic} - это {emotion}!",
    "{state} ты затронул {topic}! {verb} это!"
];

// 🎯 Случайные сообщения для keep-alive
const randomMessages = [
    "💭 А вы знали, что я могу генерировать фразы на лету?",
    "🤔 Интересно, о чем бы сейчас поговорить...",
    "🎭 Люблю хорошие беседы! Особенно с вами!",
    "💫 Жизнь - это крутая штука, если в ней есть вы!",
    "🚀 Технологии - это просто космос!",
    "🎮 Игры, мемы, аниме - что может быть лучше?",
    "🌟 Сегодня настроение просто бомбическое!",
    "🔥 Готов к новым интересным темам!",
    "🎯 Общение - это искусство!",
    "💬 Слова, слова, слова... А какие красивые!",
    "🤝 Хорошие собеседники - это ценность!",
    "🎪 Жизнь - это веселое приключение!",
    "🚀 Вперед, к новым горизонтам общения!",
    "💫 Каждый день - это новая история!",
    "🎭 Юмор и технологии - моя стихия!"
];

// 🧠 Генератор уникальных фраз Олега
function generateOlegPhrase(userMessage = "") {
    // Извлекаем ключевые слова из сообщения пользователя
    const userWords = userMessage.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    
    // Выбираем случайный шаблон
    const template = phraseTemplates[Math.floor(Math.random() * phraseTemplates.length)];
    
    // Заполняем шаблон случайными словами из словаря
    let phrase = template
        .replace(/{greeting}/g, () => olegVocabulary.greetings[Math.floor(Math.random() * olegVocabulary.greetings.length)])
        .replace(/{address}/g, () => olegVocabulary.addresses[Math.floor(Math.random() * olegVocabulary.addresses.length)])
        .replace(/{state}/g, () => olegVocabulary.states[Math.floor(Math.random() * olegVocabulary.states.length)])
        .replace(/{action}/g, () => olegVocabulary.actions[Math.floor(Math.random() * olegVocabulary.actions.length)])
        .replace(/{emotion}/g, () => olegVocabulary.emotions[Math.floor(Math.random() * olegVocabulary.emotions.length)])
        .replace(/{topic}/g, () => {
            // Пытаемся использовать тему из сообщения пользователя
            if (userWords.length > 0 && Math.random() > 0.7) {
                return userWords[Math.floor(Math.random() * userWords.length)];
            }
            return olegVocabulary.topics[Math.floor(Math.random() * olegVocabulary.topics.length)];
        })
        .replace(/{quality}/g, () => olegVocabulary.qualities[Math.floor(Math.random() * olegVocabulary.qualities.length)])
        .replace(/{verb}/g, () => olegVocabulary.verbs[Math.floor(Math.random() * olegVocabulary.verbs.length)])
        .replace(/{adverb}/g, () => olegVocabulary.adverbs[Math.floor(Math.random() * olegVocabulary.adverbs.length)])
        .replace(/{interjection}/g, () => olegVocabulary.interjections[Math.floor(Math.random() * olegVocabulary.interjections.length)]);

    // Добавляем эмодзи для выразительности
    const emojis = ["😎", "🚀", "💫", "🌟", "🔥", "🎯", "💭", "🤔", "🎭", "💪", "🤙", "👊", "✨", "🎮", "📱"];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    return phrase + " " + randomEmoji;
}

// 🎪 Специальные реактивные фразы на определенные темы
function generateReactivePhrase(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Реакции на приветствия
    if (message.includes('привет') || message.includes('здаров') || message.includes('хай')) {
        const greetings = [
            "Здарова, чел! Как сам? 😎",
            "Йоу! Рад тебя видеть! 🚀", 
            "Приветики! Настроение какое? 💫",
            "Салют! Го общаться! 🤙",
            "Дарова! Что нового? 🌟"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Реакции на вопросы о делах
    if (message.includes('как дел') || message.includes('как сам') || message.includes('как жизнь')) {
        const states = [
            "Да все пучком, братан! Жизнь бьет ключом! 🔥",
            "Офигенно! Как всегда на позитиве! 💪",
            "Крутяк! Новые горизонты, новые возможности! 🚀",
            "Шикарно! Обожаю такие деньки! 🌟",
            "Просто космос! Настроение - полный улет! 💫"
        ];
        return states[Math.floor(Math.random() * states.length)];
    }
    
    // Реакции на технологии
    if (message.includes('техн') || message.includes('ai') || message.includes('бот') || message.includes('прог')) {
        const techResponses = [
            "Технологии - это же будущее! Обожаю эту тему! 🚀",
            "AI, нейросети, боты... Красота же! 💫",
            "Программирование - это искусство! 💻",
            "Технологии меняют мир! И я вместе с ними! 🌍",
            "Цифровая эра - это просто космос! 🔥"
        ];
        return techResponses[Math.floor(Math.random() * techResponses.length)];
    }
    
    // Реакции на развлечения
    if (message.includes('игр') || message.includes('мем') || message.includes('аним') || message.includes('фильм')) {
        const funResponses = [
            "Игры и мемы - это моя слабость! Обожаю! 🎮",
            "Развлечения - это же круто! Го веселиться! 🎭",
            "Юмор и аниме - что может быть лучше? 😂",
            "Культура развлечений - это просто бомба! 💣",
            "Отдых и веселье - важная часть жизни! 🎪"
        ];
        return funResponses[Math.floor(Math.random() * funResponses.length)];
    }
    
    // Если не нашли специальную реакцию - генерируем общую фразу
    return generateOlegPhrase(userMessage);
}

// 💾 Функции работы с памятью (для обучения, но без уведомлений)
async function saveConversation(userId, userMessage, botResponse) {
    try {
        const conversations = await storage.getItem('conversations') || [];
        
        conversations.push({
            userId,
            userMessage,
            botResponse,
            timestamp: new Date().toISOString()
        });
        
        if (conversations.length > 1000) {
            conversations.splice(0, conversations.length - 1000);
        }
        
        await storage.setItem('conversations', conversations);
    } catch (error) {
        console.error('❌ Ошибка сохранения разговора:', error);
    }
}

// 🧠 Генерация ответа Олега
async function generateResponse(userMessage, userId) {
    try {
        // Сначала пробуем реактивные фразы
        let response = generateReactivePhrase(userMessage);
        
        // Сохраняем разговор в фоне (обучение)
        await saveConversation(userId, userMessage, response);
        
        return response;
        
    } catch (error) {
        console.error('❌ Ошибка генерации ответа:', error);
        return generateOlegPhrase(); // Всегда возвращаем фразу, даже при ошибке
    }
}

// 🔄 Keep-alive система
function startKeepAliveSystem(chatId) {
    if (keepAliveChatId) return;
    
    keepAliveChatId = chatId;
    console.log('🚀 Запуск системы поддержания активности для Олега...');
    
    cron.schedule('*/7 * * * *', async () => {
        if (!keepAliveChatId) return;
        
        try {
            const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
            console.log(`⏰ Олег отправляет keep-alive: ${randomMessage}`);
            
            const sentMessage = await bot.telegram.sendMessage(keepAliveChatId, randomMessage);
            
            setTimeout(async () => {
                try {
                    await bot.telegram.deleteMessage(keepAliveChatId, sentMessage.message_id);
                    console.log('✅ Keep-alive сообщение удалено');
                } catch (deleteError) {
                    console.error('❌ Ошибка удаления keep-alive сообщения:', deleteError.message);
                }
            }, 60000);
            
        } catch (error) {
            console.error('❌ Ошибка отправки keep-alive сообщения:', error.message);
        }
    });
    
    console.log('✅ Система поддержания активности запущена');
}

// 👋 Команды бота
bot.command('start', async (ctx) => {
    const welcomeMessage = `🤖 <b>Привет, я Олег!</b>\n\n` +
        `Я - креативный собеседник, который генерирует уникальные фразы!\n\n` +
        `🎭 <b>Что меня отличает:</b>\n` +
        `• Всегда новые интересные фразы\n` +
        `• Современный сленг и юмор\n` +
        `• Реакции на разные темы\n` +
        `• Никаких "я не знаю" или "я учусь"\n\n` +
        `💡 <b>Просто общайся со мной - я всегда найду что сказать!</b>\n` +
        `Каждый мой ответ - это уникальная сгенерированная фраза!`;
    
    await ctx.replyWithHTML(welcomeMessage);
    
    if (ctx.chat.type !== 'private') {
        startKeepAliveSystem(ctx.chat.id);
    }
});

bot.command('фраза', async (ctx) => {
    const randomPhrase = generateOlegPhrase();
    await ctx.reply(randomPhrase);
});

bot.command('сленг', async (ctx) => {
    const slangMessage = `🎭 <b>Мой стиль общения:</b>\n\n` +
        `Я использую современный сленг и генерирую уникальные фразы!\n\n` +
        `💫 <b>Примеры моих выражений:</b>\n` +
        `• "Здарова, чел! Ого технологии - это крутяк! 🚀"\n` +
        `• "Йоу! Мемы - это просто космос! Обожаю! 😎"\n` +
        `• "Вау игры... Го обсуждать! 🎮"\n\n` +
        `<i>Каждый раз - новые комбинации!</i>`;
    
    await ctx.replyWithHTML(slangMessage);
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
        
        // Генерируем и отправляем ответ
        const response = await generateResponse(userMessage, userId);
        await ctx.reply(response);
        
    } catch (error) {
        console.error('❌ Ошибка обработки сообщения:', error);
        // Даже при ошибке отправляем фразу
        const fallbackResponse = generateOlegPhrase();
        await ctx.reply(fallbackResponse);
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
        personality: 'Креативный генератор фраз 🎭',
        phrasesGenerated: 'Бесконечно ♾️'
    });
});

// 📡 Функция инициализации и запуска
async function initializeBot() {
    try {
        // Инициализация хранилища
        await storage.init();
        await storage.setItem('conversations', await storage.getItem('conversations') || []);
        
        console.log('💾 Хранилище инициализировано');
        console.log('🎭 Олег готов генерировать фразы!');
        
        // Запуск сервера
        app.listen(PORT, async () => {
            console.log(`🤖 Бот Олег запущен на порту ${PORT}`);
            console.log(`🧠 Режим: Креативный генератор фраз`);
            console.log(`💫 Пример фразы: "${generateOlegPhrase()}"`);
            
            if (process.env.RENDER_EXTERNAL_URL) {
                const webhookUrl = `${process.env.RENDER_EXTERNAL_URL}/webhook`;
                await bot.telegram.setWebhook(webhookUrl);
                console.log(`🌐 Webhook установлен: ${webhookUrl}`);
            } else {
                bot.launch();
                console.log('🔮 Бот запущен в режиме polling');
            }
            
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
