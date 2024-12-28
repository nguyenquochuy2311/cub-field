import { config } from 'dotenv';
import { cleanEnv, port, str } from 'envalid';

const NODE_ENV = process.env.NODE_ENV || 'development';

console.log(NODE_ENV);

config({ path: `.env.${NODE_ENV}` });

export const CONFIG = cleanEnv(process.env, {
	NODE_ENV: str({ default: NODE_ENV }),
	NODE_NAME: str(),

	NAMESPACE: str(),

	DEBUG_PORT: port(),

	LOG_DIR: str({ default: '' }),
	LOG_LEVEL: str({ default: 'info' }),

	DB_HOST: str(),
	DB_PORT: port(),
	DB_USER: str(),
	DB_PASSWORD: str(),
	DB_NAME: str(),

	MQ_PROTOCOL: str({ default: 'amqp' }),
	MQ_HOST: str(),
	MQ_PORT: port(),
	MQ_USER: str(),
	MQ_PASSWORD: str(),
	MQ_VIRTUAL_PATH: str({ default: '/' }),

	MQ_2_PROTOCOL: str({ default: 'amqp' }),
	MQ_2_HOST: str(),
	MQ_2_PORT: port(),
	MQ_2_USER: str(),
	MQ_2_PASSWORD: str(),
	MQ_2_VIRTUAL_PATH: str({ default: '/' }),

	REDIS_HOST: str(),
	REDIS_PORT: port(),

	DEFAULT_TIMEZONE_MOMENT: str({ default: 'Asia/Saigon' }),
	DEFAULT_TIMEZONE_SQL: str({ default: '+07:00' }),
});
