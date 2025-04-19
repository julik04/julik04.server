
exports.up = function(knex) {
    return knex.schema.createTable('jobs', (table) => {
        table.increments('id').primary();
        table.string('link');
        table.string('title');
        table.string('postedTimeInfo');
        table.text('jobDescription');
        table.text('sectionTagsToHire');
        table.text('clientInformation');
        table.json('skillsAndExpertise'); // Stores string array as JSON
        table.json('activityOnThisJob'); // Stores array of objects as JSON
        table.timestamps(true, true); // Created_at and updated_at
      });
};

exports.down = function(knex) {
    return knex.schema.dropTable('jobs');
};
