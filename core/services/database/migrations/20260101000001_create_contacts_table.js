export async function up(knex) {
    const hasTable = await knex.schema.hasTable('store_contacts');
    if (!hasTable) {
        await knex.schema.createTable('store_contacts', (table) => {
            table.string('jid').primary();
            table.string('lid').nullable();
            table.string('name').nullable();
            table.string('pushname').nullable();
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
            table.index(['lid']);
        });
    }
}
export async function down(knex) {
    await knex.schema.dropTableIfExists('store_contacts');
}
