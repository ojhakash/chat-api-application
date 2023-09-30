import dotenv from "dotenv";
import Joi from "joi";
import { Dialect } from "sequelize";

dotenv.config();

interface ConfigData {
  NODE_ENV: string;
  PORT: string;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_DIALECT: Dialect;
  JWT_SECRET: string;
}

const envVarsSchema = Joi.object<ConfigData>()
  .keys({
    NODE_ENV: Joi.string()
      .valid("production", "development", "test")
      .required(),
    PORT: Joi.number().default(5000),
    DB_NAME: Joi.string().required().description("Postgres DB name"),
    DB_USER: Joi.string().required().description("Postgres DB user"),
    DB_PASSWORD: Joi.string().required().description("Postgres DB password"),
    DB_HOST: Joi.string().required().description("Postgres DB host"),
    DB_PORT: Joi.number().required().description("Postgres DB port"),
    DB_DIALECT: Joi.string().required().description("Postgres DB dialect"),
    JWT_SECRET: Joi.string().required().description("JWT secret key"),
  }).unknown()

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  postgres: {
    db: envVars.DB_NAME,
    user: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    dialect: envVars.DB_DIALECT,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
  },
};
