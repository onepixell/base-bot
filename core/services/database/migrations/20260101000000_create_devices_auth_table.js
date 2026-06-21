export async function up(knex) {
    const hasTable = await knex.schema.hasTable('devices_auth');
    if (!hasTable) {
        await knex.schema.createTable('devices_auth', (table) => {
            table.string('session').notNullable();
            table.string('key').notNullable();
            table.text('value').nullable();
            table.unique(['session', 'key']);
            table.index(['session']);
        });
    }
}
export async function down(knex) {
    await knex.schema.dropTableIfExists('devices_auth');
}
