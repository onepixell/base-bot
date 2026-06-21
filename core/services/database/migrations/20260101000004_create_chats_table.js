export async function up(knex) {
    const hasTable = await knex.schema.hasTable('store_chats');
    if (!hasTable) {
        await knex.schema.createTable('store_chats', (table) => {
            table.string('id').primary();
            table.bigInteger('conversation_timestamp').nullable();
            table.integer('unread_count').defaultTo(0);
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
        });
    }
}
export async function down(knex) {
    await knex.schema.dropTableIfExists('store_chats');
}
