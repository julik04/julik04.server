import { json } from "express";
import { DbServiceBase } from "./dbServiceBase/dbServiceBase.js";
import Knex from "knex";
import bcrypt from 'bcrypt';

export class OrdersDbService extends DbServiceBase {
    pepper: string;

    constructor() {
        super();
    }

    async createOrder(orderData) {
        try {
            const [newOrder] = await this.Knex('orders')
                .insert(orderData)
                .returning('*');
            return newOrder;
        } catch (error) {
            throw new Error(`Error creating order: ${error.message}`);
        }
    }

    async getById(id: number) {
        return this.Knex("orders")
            .where("orders.id", id).first()
    }

    async getOrdersByUserId(userId) {
        try {
            return await this.Knex('orders').where({ user_id: userId });
        } catch (error) {
            throw new Error(`Error fetching orders for user ${userId}: ${error.message}`);
        }
    }

    async getAllOrders() {
        try {
            return await this.Knex('orders').select('*');
        } catch (error) {
            throw new Error(`Error fetching all orders: ${error.message}`);
        }
    }

    async updateOrder(id, updates) {
        // Filter out 'order_date' and 'comment' if their values are null or undefined
        const keysToFilter = ['order_date', 'comment'];
        const filteredUpdates = Object.keys(updates).reduce((acc, key) => {
            if (!keysToFilter.includes(key) || updates[key] != null) {
                acc[key] = updates[key];
            }
            return acc;
        }, {});

        try {
            const [updatedOrder] = await this.Knex('orders')
                .where({ id })
                .update(filteredUpdates)
                .returning('*');
            return updatedOrder || null;
        } catch (error) {
            throw new Error(`Error updating order ${id}: ${error.message}`);
        }
    }

    async deleteOrder(id) {
        try {
            const [deletedOrder] = await this.Knex('orders')
                .where({ id })
                .del()
                .returning('*');
            return deletedOrder || null;
        } catch (error) {
            throw new Error(`Error deleting order ${id}: ${error.message}`);
        }
    }
}

export default new OrdersDbService();
