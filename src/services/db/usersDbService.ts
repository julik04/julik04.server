import { json } from "express";
import { DbServiceBase } from "./dbServiceBase/dbServiceBase.js";
import knex from "knex";

export class UsersDbService extends DbServiceBase {
    constructor() {
        super();
    }

    async getById(id: number) {
        return this.Knex("users")
            .where("users.id", id).first()
    }

    async findByLogin(login: string) {
        return this.Knex("users").where("users.login", login).first();
    }

    async createUser(userData: { login: string; password: string }) {
        const [user] = await this.Knex('users')
            .insert({
                login: userData.login,
                password: userData.password,
            })
            .returning('*');

        return user;
    }

    async updateAccessToken(id: number, accessToken: string) {
        const [user] = await this.Knex('users')
            .where({ id })
            .update({ accessToken: accessToken })
            .returning('*');

        return user;
    }

    async deleteUser(id: number): Promise<void> {
        await this.Knex('users')
            .where({ id })
            .delete();
    }

    async listUsers() {
        return this.Knex('users').select();
    }

}

export default new UsersDbService();
