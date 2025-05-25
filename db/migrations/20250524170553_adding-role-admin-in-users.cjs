exports.up = function (knex) {
  return knex.schema.alterTable("users", (table) => {
    table.string("role");
  });
};

exports.down = function (knex) {
  knex.schema.alterTable("users", (table) => {
    table.dropColumn("role");
  });
};
