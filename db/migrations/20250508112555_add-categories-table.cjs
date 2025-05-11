exports.up = function (knex) {
  return knex.schema
    .createTable("categories", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table
        .integer("parent_id")
        .unsigned()
        .references("id")
        .inTable("categories");
      table.timestamps(true, true);
    })
    .createTable("products", (table) => {
      table.increments("id").primary();
      table.string("title").notNullable();
      table.string("image");
      table.decimal("price", 10, 2).notNullable(); // Используйте decimal для цен
      table
        .integer("category_id")
        .unsigned()
        .references("id")
        .inTable("categories"); // Ссылка на самую глубокую категорию
      table.timestamps(true, true);
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable("products").dropTable("categories");
};
