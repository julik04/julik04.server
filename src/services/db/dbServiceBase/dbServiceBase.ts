import "dotenv/config.js";
import knex from "knex";
import knexfile from "../../../knexfile.js";

export class DbServiceBase {
  Knex;

  constructor() {
    const environment = "development"; // Default to 'development'
    if (!(environment in knexfile)) {
      throw new Error(`Invalid NODE_ENV: ${environment}`);
    }
    this.Knex = knex(knexfile[environment]);
  }
}

export default new DbServiceBase();
