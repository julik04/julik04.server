exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("login");
    table.text("accessToken");
    table.text("password");
    table.string("full_name");
    table.string("phone_number", 17).unique().notNullable();
    table.timestamp("birth_date").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("users");
};
