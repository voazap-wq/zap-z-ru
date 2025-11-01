
const { Sequelize, DataTypes } = require('sequelize');

// Получаем URL базы данных из переменных окружения
const databaseUrl = process.env.DATABASE_URL || 'sqlite://bot.db';

// Инициализируем Sequelize
const sequelize = new Sequelize(databaseUrl, {
    logging: false, // Отключаем логирование SQL-запросов в консоль
});

// Определяем модель UserTelegram
const UserTelegram = sequelize.define('UserTelegram', {
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: "User ID из основного приложения (сайта)",
    },
    telegramId: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        unique: true,
        comment: "Уникальный ID пользователя в Telegram",
    },
    username: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Username пользователя в Telegram (может отсутствовать)",
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user',
        allowNull: false,
    },
    subscribed: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: "Подписан ли пользователь на рассылки",
    },
}, {
    timestamps: true, // Добавляем поля createdAt и updatedAt
});

// Экспортируем sequelize и модель
module.exports = {
    sequelize,
    UserTelegram,
};