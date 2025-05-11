import { json } from "express";
import { DbServiceBase } from "./dbServiceBase/dbServiceBase.js";

export class CategoriesDbService extends DbServiceBase {
    constructor() {
        super();
    }
}

export default new CategoriesDbService();
