import { json } from "express";
import { DbServiceBase } from "./dbServiceBase/dbServiceBase.js";
import knex from "knex";
import bcrypt from 'bcrypt';

export class UsersDbService extends DbServiceBase {
    pepper: string;

    constructor() {
        super();

        const pepper = process.env.SECURITY_PEPPER;

        if (!pepper) {
            throw new Error('SECURITY_PEPPER environment variable is not set');
        }
        this.pepper = pepper;
        setInterval(() => {
            this.cleanOldTokens();
        }, 24 * 60 * 60 * 1000); // Ежедневно
    }

    async cleanOldTokens() {
        // Удаляем токены старше 30 дней
        const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        await this.Knex('users')
            .where('last_login', '<', cutoffDate)
            .update({ accessToken: null });
    }
    async getById(id: number) {
        return this.Knex("users")
            .where("users.id", id).first()
    }

    async findByLogin(login: string) {
        return this.Knex("users").where("users.login", login).first();
    }

    async createUser(userData: {
        login: string;
        password: string,
        full_name: string,
        phone_number: string,
        birth_date: Date
    }) {
        const [user] = await this.Knex('users').insert({
            ...userData,
            role: 'user'
        }).returning('*');
        return user;
    }

    async updateAccessToken(id: number, accessToken: string) {
        await this.Knex('users')
            .where({ id })
            .update({ accessToken: accessToken });

        return;
    }

    async deleteUser(id: number): Promise<void> {
        await this.Knex('users')
            .where({ id })
            .delete();
    }

    async listUsers() {
        return this.Knex('users').select();
    }


    async hashPassword(password): Promise<string | null> {
        const combinedString = `${password}${this.pepper}`;
        const saltRounds = 10;

        try {
            const hash = await bcrypt.hash(combinedString, saltRounds);
            return hash;
        } catch (error) {
            throw new Error('Error hashing password');
        }
    }

    async comparePassword(password, hash) {
        const combinedString = `${password}${this.pepper}`;

        try {
            const match = await bcrypt.compare(combinedString, hash);
            return match;
        } catch (error) {
            throw new Error('Error comparing passwords');
        }
    }
}

export default new UsersDbService();
