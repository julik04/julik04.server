import { json } from "express";
import { DbServiceBase } from "./dbServiceBase/dbServiceBase.js";
import Knex from "knex";

export class CategoriesDbService extends DbServiceBase {
    constructor() {
        super();
    }

    async getCategoriesHierarchy() {
        // Fetch all categories
        const categories = await this.Knex('categories').select('*');

        if (!categories.length) return {};

        // Create a Map for children grouped by parent_id
        const childrenMap = new Map();
        categories.forEach(category => {
            const parentId = category.parent_id;
            if (!childrenMap.has(parentId)) {
                childrenMap.set(parentId, []);
            }
            childrenMap.get(parentId).push(category);
        });

        // Recursive function to build nested children
        const buildTree = (parentId) => {
            const children = childrenMap.get(parentId) || [];
            return children.map(child => ({
                ...child,
                children: buildTree(child.id)
            }));
        };

        // Build the result object with top-level categories as keys
        const topLevelCategories = childrenMap.get(null) || [];
        const result = {};

        topLevelCategories.forEach(category => {
            result[category.name] = buildTree(category.id);
        });

        return result;
    }
}

export default new CategoriesDbService();
