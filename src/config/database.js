const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const isDev = process.env.NODE_ENV === 'development';

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD || process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT || 'mysql',
        benchmark: true,
        // Detección proactiva de consultas lentas (> 500ms en dev, > 1000ms en prod)
        logging: (msg, durationMs) => {
            if (durationMs && durationMs > (isDev ? 500 : 1000)) {
                logger.warn(`🐢 [SLOW QUERY] (${durationMs}ms): ${msg}`);
            } else if (isDev) {
                logger.debug(msg);
            }
        },
        define: {
            timestamps: true,
            underscored: true,
        },
        timezone: process.env.DB_TIMEZONE || '-05:00',
        pool: {
            max: parseInt(process.env.DB_POOL_MAX || '20', 10),
            min: parseInt(process.env.DB_POOL_MIN || '2', 10),
            acquire: 30000,
            idle: 10000
        },
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        logger.info('✅ Connection to MySQL has been established successfully.');
    } catch (error) {
        logger.error('❌ Unable to connect to the database:', error);
        throw error;
    }
};

module.exports = { sequelize, connectDB };
