export async function up(knex) {
    const hasTable = await knex.schema.hasTable('store_messages');
    if (!hasTable) {
        await knex.schema.createTable('store_messages', (table) => {
            table.string('id').primary();
            table.string('chat_jid').notNullable();
            table.string('sender_jid').nullable();
            table.string('mtype').nullable();
            table.text('text_content').nullable();
            table.json('raw_message').notNullable();
            table.string('status').defaultTo('received');
            table.timestamp('timestamp').notNullable();
            table.index(['chat_jid']);
            table.index(['sender_jid']);
            table.index(['timestamp']);
        });
    }
}
export async function down(knex) {
    await knex.schema.dropTableIfExists('store_messages');
}
