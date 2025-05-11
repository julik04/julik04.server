import { json } from "express";
import { DbServiceBase } from "./dbServiceBase/dbServiceBase.js";
import knex from "knex";

export class ProductsDbService extends DbServiceBase {
    constructor() {
        super();
    }

    async getById(id: number) {
        return this.Knex("products")
            .where("products.id", id).first()
    }

    // Get product with category information
    async getWithCategory(id: number) {
        return this.Knex("products")
            .where("products.id", id)
            .join("categories", "products.category_id", "categories.id")
            .select(
                "products.*",
                "categories.name as category_name",
                "categories.parent_id as category_parent_id"
            )
    }

    // Get all products with their category information
    async getAllWithCategories(filter: any) {
        const query = this.Knex("products")
            .join("categories", "products.category_id", "categories.id")
            .select(
                "products.*",
                "categories.name as category_name",
                "categories.parent_id as category_parent_id"
            );

        // Apply filter if provided
        if (filter.category_id) {
            query.where("products.category_id", filter.category_id);
        }

        return query;
    }

    // Get products by category ID (including pagination optional)
    async getByCategoryId(categoryId: number, page = 1, pageSize = 10) {
        return this.Knex("products")
            .where("category_id", categoryId)
            .offset((page - 1) * pageSize)
            .limit(pageSize);
    }

    // Get products by search term (title)
    async searchByTitle(searchTerm: string) {
        return this.Knex("products")
            .where("title", "ilike", `%${searchTerm}%`);
    }

    // Update product price
    async updatePrice(id: number, newPrice: number) {
        return this.Knex("products").update(id, { price: newPrice });
    }
}

export default new ProductsDbService();
