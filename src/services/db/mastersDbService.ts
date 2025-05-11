import { json } from "express";
import { DbServiceBase } from "./dbServiceBase/dbServiceBase.js";

export class MastersDbService extends DbServiceBase {
    constructor() {
        super();
    }
}

export default new MastersDbService();
