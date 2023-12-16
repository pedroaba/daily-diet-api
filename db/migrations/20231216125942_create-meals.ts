import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTableIfNotExists("meals", (table) => {
    table.uuid("id").defaultTo(knex.fn.uuid()).primary();
    table.string("name").notNullable();
    table.text("description").notNullable();
    table.date("date_time").notNullable();
    table.datetime("created_at").defaultTo(knex.fn.now()).notNullable();
    table.datetime("update_at").defaultTo(knex.fn.now()).notNullable();
    table.boolean("is_in_the_diet").defaultTo(false).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("meals");
}
