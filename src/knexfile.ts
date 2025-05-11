import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: process.env.ENV_PATH })

const knexConfig = {
  development: {
    client: process.env.DB_CLIENT,
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '', 10),
    },
    migrations: {
      directory: path.resolve("../db/migrations"),
      tableName: "knex_migrations",
    },
    seeds: {
      directory: path.resolve("../db/seeds"), // Add this section
    },
    useNullAsDefault: true,
  },
};

export default knexConfig;