import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("meals", (table) => {
    table.uuid("user_id").references("users.id").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("meals", (table) => {
    table.dropColumn("user_id");
  });
}
