export async function up(knex) {
    const hasTable = await knex.schema.hasTable('store_groups');
    if (!hasTable) {
        await knex.schema.createTable('store_groups', (table) => {
            table.string('jid').primary();
            table.string('subject').nullable();
            table.json('metadata').nullable();
            table.boolean('is_active').defaultTo(true);
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
        });
    }
}
export async function down(knex) {
    await knex.schema.dropTableIfExists('store_groups');
}
