import dotenv from "dotenv";

dotenv.config({ path: './.env' });

interface DatabaseConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
}

interface RedisConfig {
    host: string;
    port: number;
    db: number;
    password: string;
    duration: number;
    service: number;
}

interface RabbitmqConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    exchange: string;
    routing_key: string;
    vhost: string;
}

interface SocketConfig {
    url: string;
    key: string;
}

interface WhatsappConfig {
    url: string;
    key: string;
}

interface Config {
    env: string | undefined;
    timezone: string;
    port: number;
    database: DatabaseConfig;
    redis: RedisConfig;
    rabbitmq: RabbitmqConfig;
    socket: SocketConfig;
    whatsapp: WhatsappConfig;
    file_dir: string;
    secret: string;
}

const config: Config = {
    env: process.env.NODE_ENV || 'development',
    timezone: 'Asia/Jakarta',
    port: parseInt(process.env.PORT || '3000'),
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        name: process.env.DB_NAME || 'test',
    },
    redis: {
        host: process.env.CACHE_HOST || 'localhost',
        port: parseInt(process.env.CACHE_PORT || '6379'),
        db: parseInt(process.env.CACHE_DB || '0'),
        password: process.env.CACHE_PASSWORD || '',
        duration: parseInt(process.env.CACHE_DATA_DURATION || '3600'), // in seconds
        service: parseInt(process.env.CACHE_SERVICE || '0'),
    },
    rabbitmq: {
        host: process.env.MQ_HOST || 'localhost',
        port: parseInt(process.env.MQ_PORT || '6379'),
        username: process.env.MQ_USERNAME || 'root',
        password: process.env.MQ_PASSWORD || '',
        exchange: process.env.exchange || '',
        routing_key: process.env.MQ_ROUTING_KEY || '',
        vhost: process.env.MQ_VHOST || '',
    },
    socket: {
        url: process.env.SOCKET_URL || 'localhost',
        key: process.env.SOCKET_KEY || '8002',
    },
    whatsapp: {
        url: process.env.WA_API_URL || 'localhost',
        key: process.env.WA_API_KEY || '',
    },
    file_dir: process.env.FILE_DIR || '/',
    secret: process.env.SECRET_KEY || 'secret',
};

export default config;