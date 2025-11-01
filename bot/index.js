
require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const bodyParser = require('body-parser');
const { sequelize, UserTelegram } = require('./db');
const { mockUsers, mockOrders, mockNews } = require('./mock-data');

// --- ENV & CONFIG VALIDATION ---
const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID, ADMIN_IDS, BASE_URL, PORT } = process.env;
if (!TELEGRAM_BOT_TOKEN || !ADMIN_IDS || !BASE_URL) {
    console.error('Ошибка: Отсутствуют необходимые переменные окружения. Проверьте .env файл.');
    process.exit(1);
}
const ADMIN_ID_LIST = ADMIN_IDS.split(',').map(id => parseInt(id.trim(), 10));
const API_PORT = PORT || 3001;

// --- TELEGRAF BOT SETUP ---
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// --- HELPERS ---
const findUserByContact = (contact) => {
    const contactLower = contact.toLowerCase();
    return mockUsers.find(
        user => user.email.toLowerCase() === contactLower || (user.phone && user.phone.replace(/\D/g, '') === contact.replace(/\D/g, ''))
    );
};

// --- BOT MIDDLEWARE ---
// Middleware для проверки, является ли пользователь администратором
const adminOnly = (ctx, next) => {
    if (ADMIN_ID_LIST.includes(ctx.from.id)) {
        return next();
    }
    return ctx.reply('Эта команда доступна только для администраторов.');
};

// --- BOT COMMANDS ---

bot.start(async (ctx) => {
    const telegramId = ctx.from.id;
    const existingUser = await UserTelegram.findByPk(telegramId);
    if (existingUser) {
        await existingUser.update({ subscribed: true });
        return ctx.reply('С возвращением! Вы снова подписаны на уведомления.');
    }
    return ctx.reply('Добро пожаловать в бот магазина Zap-z.ru! 👋\n\nЧтобы получать уведомления о заказах, пожалуйста, отправьте email или телефон, который вы использовали при регистрации на сайте.');
});

bot.help((ctx) => {
    const helpText = `
Список доступных команд:
/start - Начать работу с ботом и подписаться на уведомления.
/status - Показать статус последнего заказа.
/news - Показать 3 последние новости.
/unsubscribe - Отписаться от всех уведомлений.
/help - Показать это сообщение.
    `;
    ctx.reply(helpText);
});

bot.command('status', async (ctx) => {
    const telegramUser = await UserTelegram.findByPk(ctx.from.id);
    if (!telegramUser) {
        return ctx.reply('Ваш Telegram-аккаунт не привязан к профилю на сайте. Используйте /start, чтобы привязать его.');
    }
    const lastOrder = mockOrders
        .filter(o => o.userId === telegramUser.userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    if (!lastOrder) {
        return ctx.reply('У вас пока нет заказов.');
    }

    const message = `Ваш последний заказ №${lastOrder.orderNumber} в статусе "${lastOrder.status}".\nСумма: ${lastOrder.total.toFixed(2)} ₽.`;
    ctx.reply(message, Markup.inlineKeyboard([
        Markup.button.url('Посмотреть все заказы', `${BASE_URL}/account/orders`)
    ]));
});

bot.command('news', (ctx) => {
    const lastThreeNews = mockNews.slice(-3).reverse();
    if (lastThreeNews.length === 0) {
        return ctx.reply('Новостей пока нет.');
    }
    let newsMessage = 'Последние новости:\n\n';
    lastThreeNews.forEach(news => {
        newsMessage += `📰 *${news.title}*\n_${news.excerpt}_\n\n`;
    });
    ctx.replyWithMarkdown(newsMessage);
});

bot.command('unsubscribe', async (ctx) => {
    const telegramUser = await UserTelegram.findByPk(ctx.from.id);
    if (telegramUser) {
        await telegramUser.update({ subscribed: false });
        ctx.reply('Вы успешно отписались от уведомлений. Вы больше не будете получать сообщения о заказах и новости.');
    } else {
        ctx.reply('Ваш аккаунт не был подписан.');
    }
});

bot.command('broadcast', adminOnly, async (ctx) => {
    const message = ctx.message.text.slice('/broadcast'.length).trim();
    if (!message) {
        return ctx.reply('Пожалуйста, укажите сообщение для рассылки. Например: /broadcast Всем привет!');
    }
    const users = await UserTelegram.findAll({ where: { subscribed: true } });
    let successCount = 0;
    for (const user of users) {
        try {
            await ctx.telegram.sendMessage(user.telegramId, message);
            successCount++;
        } catch (error) {
            console.error(`Не удалось отправить сообщение пользователю ${user.telegramId}:`, error.description);
            // Если пользователь заблокировал бота, отписываем его
            if (error.code === 403) {
                await user.update({ subscribed: false });
            }
        }
    }
    ctx.reply(`Рассылка завершена. Сообщение отправлено ${successCount} из ${users.length} пользователей.`);
});


// --- BOT MESSAGE HANDLERS ---
// Обработка текстовых сообщений для привязки аккаунта
bot.on('text', async (ctx) => {
    const contactInfo = ctx.message.text;
    const siteUser = findUserByContact(contactInfo);

    if (siteUser) {
        const isAdmin = ADMIN_ID_LIST.includes(ctx.from.id);
        const [user, created] = await UserTelegram.findOrCreate({
            where: { telegramId: ctx.from.id },
            defaults: {
                userId: siteUser.id,
                telegramId: ctx.from.id,
                username: ctx.from.username,
                role: isAdmin ? 'admin' : 'user',
                subscribed: true,
            },
        });
        if (created) {
            ctx.reply(`✅ Отлично, ${siteUser.fullName}! Ваш аккаунт успешно привязан. Теперь вы будете получать уведомления о заказах.`);
        } else {
            // Если пользователь уже существует, просто обновляем его данные и подписку
            await user.update({ userId: siteUser.id, subscribed: true });
            ctx.reply(`✅ Ваш аккаунт был успешно перепривязан к профилю ${siteUser.fullName}.`);
        }
    } else {
        ctx.reply('😕 Пользователь с таким email или телефоном не найден на сайте Zap-z.ru. Пожалуйста, проверьте данные и попробуйте еще раз.');
    }
});

// --- BOT CHANNEL LISTENER ---
if (TELEGRAM_CHANNEL_ID) {
    bot.on('channel_post', async (ctx) => {
        const channelId = String(ctx.channelPost.chat.id);
        const channelUsername = ctx.channelPost.chat.username ? `@${ctx.channelPost.chat.username}` : '';
        
        if (channelId === TELEGRAM_CHANNEL_ID || channelUsername === TELEGRAM_CHANNEL_ID) {
            const users = await UserTelegram.findAll({ where: { subscribed: true } });
            for (const user of users) {
                try {
                    await ctx.telegram.forwardMessage(user.telegramId, ctx.channelPost.chat.id, ctx.channelPost.message_id);
                } catch (error) {
                    console.error(`Не удалось переслать пост пользователю ${user.telegramId}:`, error.description);
                }
            }
        }
    });
}

// --- EXPRESS API SETUP ---
const app = express();
app.use(bodyParser.json());

app.post('/api/notify', async (req, res) => {
    const { type, userId, data } = req.body;
    if (!type || !userId || !data) {
        return res.status(400).send({ error: 'Missing required fields: type, userId, data' });
    }

    const telegramUser = await UserTelegram.findOne({ where: { userId, subscribed: true } });
    if (!telegramUser) {
        return res.status(404).send({ error: `User with userId ${userId} not found or not subscribed.` });
    }

    let message = '';
    let keyboard = [];

    if (type === 'order_status_update') {
        message = `🔔 Статус вашего заказа изменился!\n\n*Заказ №${data.orderNumber}* — ${data.status}.\nСумма: ${data.total.toFixed(2)} ₽.`;
        keyboard = Markup.inlineKeyboard([
            Markup.button.url('Посмотреть заказ', `${BASE_URL}/profile/orders`)
        ]).reply_markup;
    } else {
        message = data.message || 'У вас новое уведомление.';
    }

    try {
        await bot.telegram.sendMessage(telegramUser.telegramId, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard,
        });
        res.status(200).send({ success: true, message: 'Notification sent.' });
    } catch (error) {
        console.error('API Error: Failed to send message', error);
        res.status(500).send({ success: false, error: 'Failed to send message via Telegram.' });
    }
});

// --- INITIALIZATION ---
const initialize = async () => {
    try {
        await sequelize.sync();
        console.log('База данных успешно синхронизирована.');

        // Тестовые данные для администратора
        const adminSiteUser = mockUsers.find(u => u.role === 'superadmin' || u.role === 'manager');
        if (adminSiteUser && ADMIN_ID_LIST.length > 0) {
            await UserTelegram.upsert({
                userId: adminSiteUser.id,
                telegramId: ADMIN_ID_LIST[0],
                username: 'alexandr',
                role: 'admin',
                subscribed: true,
            });
            console.log(`Тестовый администратор (@alexandr, id: ${ADMIN_ID_LIST[0]}) синхронизирован.`);
        }

        app.listen(API_PORT, () => {
            console.log(`✅ API-сервер для уведомлений запущен на http://localhost:${API_PORT}`);
        });

        await bot.launch();
        console.log('✅ Telegram-бот успешно запущен.');

        process.once('SIGINT', () => bot.stop('SIGINT'));
        process.once('SIGTERM', () => bot.stop('SIGTERM'));

    } catch (error) {
        console.error('❌ Не удалось запустить бота или сервер:', error);
    }
};

initialize();