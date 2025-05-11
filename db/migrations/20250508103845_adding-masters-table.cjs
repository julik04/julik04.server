exports.up = function (knex) {
  return knex.schema.createTable("masters", (table) => {
    table.increments("id").primary();
    table.string("name");
    table.integer("experience").defaultTo(0);
    table.string("image");
    table.text("resume");
    table.json("gallery"); // Stores array of image paths as JSON
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("masters");
};
