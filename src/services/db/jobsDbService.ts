import { json } from "express";
import { DbServiceBase } from "./dbServiceBase/dbServiceBase.js";

export class JobsDbService extends DbServiceBase {
  constructor() {
    super();
  }
}

export default new JobsDbService();
