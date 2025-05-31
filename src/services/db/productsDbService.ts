import { json } from "express";
import { DbServiceBase } from "./dbServiceBase/dbServiceBase.js";
import knex from "knex";

interface Product {
    id?: number;
    title: string;
    image?: string;
    price: number;
    category_id?: number;
    created_at?: Date;
    updated_at?: Date;
}

export class ProductsDbService extends DbServiceBase {
    constructor() {
        super();
    }

    async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
        try {
            const [newProduct] = await this.Knex('products')
                .insert({
                    title: productData.title,
                    image: productData.image || null,
                    price: this.Knex.raw('CAST(? AS DECIMAL(10,2))', [productData.price]),
                    category_id: productData.category_id || null
                })
                .returning('*');

            return newProduct;
        } catch (error) {
            if (error.code === '23503') { // Foreign key constraint (category_id)
                throw new Error('Invalid category ID');
            }
            throw new Error(`Failed to create product: ${error.message}`);
        }
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
