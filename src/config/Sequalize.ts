import { Sequelize } from "sequelize";

import config from "@/config/config";


const sequelize = new Sequelize(config.postgres.db, config.postgres.user, config.postgres.password, {
  host: config.postgres.host,
  port: config.postgres.port,
  dialect: config.postgres.dialect,
  logging:false
});

export default sequelize;
