import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTableIfNotExists("users", (table) => {
    table.uuid("id").defaultTo(knex.fn.uuid()).primary();
    table.string("name").notNullable();
    table.string("email").notNullable().unique().index();
    table.datetime("created_at").defaultTo(knex.fn.now()).notNullable();
    table.datetime("update_at").defaultTo(knex.fn.now()).notNullable();
    table.string("session_id").notNullable().unique().index();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("users");
}
