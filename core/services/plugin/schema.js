import { z } from 'zod';
const BaileysEventMapKeys = {
    'connection.update': true,
    'creds.update': true,
    'messaging-history.set': true,
    'messaging-history.status': true,
    'chats.upsert': true,
    'chats.update': true,
    'lid-mapping.update': true,
    'chats.delete': true,
    'presence.update': true,
    'contacts.upsert': true,
    'contacts.update': true,
    'messages.delete': true,
    'messages.update': true,
    'messages.media-update': true,
    'messages.upsert': true,
    'messages.reaction': true,
    'message-receipt.update': true,
    'groups.upsert': true,
    'groups.update': true,
    'group-participants.update': true,
    'group.join-request': true,
    'group.member-tag.update': true,
    'blocklist.set': true,
    'blocklist.update': true,
    call: true,
    'labels.edit': true,
    'labels.association': true,
    'newsletter.reaction': true,
    'newsletter.view': true,
    'newsletter-participants.update': true,
    'newsletter-settings.update': true,
    'message-capping.update': true,
    'chats.lock': true,
    'settings.update': true,
};
export const BAILEYS_EVENT_NAMES = Object.keys(BaileysEventMapKeys);
function requiredString(field) {
    return z
        .string({
        error: (issue) => issue.input === undefined
            ? `${field} is required.`
            : `${field} must not be empty.`,
    })
        .min(1, `${field} must not be empty.`);
}
function requiredFunction(field) {
    return z.custom((val) => typeof val === 'function', {
        message: `${field} must be a valid function.`,
    });
}
export const CommandSchema = z.object({
    name: requiredString('name'),
    aliases: z.array(z.string()),
    withoutPrefix: z.boolean().default(false),
    execute: requiredFunction('execute'),
}).passthrough();
export const MiddlewareSchema = z.object({
    event: z.enum(['command', ...BAILEYS_EVENT_NAMES], {
        error: (issue) => issue.input === undefined
            ? 'event is required.'
            : `event '${issue.input}' is not recognized or supported. Valid values include: 'command', 'messages.upsert', etc.`,
    }),
    priority: z.number().default(0),
    handler: requiredFunction('handler'),
}).passthrough();
export const EventSchema = z.object({
    event: z.enum(BAILEYS_EVENT_NAMES, {
        error: (issue) => issue.input === undefined
            ? 'event is required.'
            : `event ${issue.input} is not recognized or not supported.`,
    }),
    priority: z.number().default(0),
    execute: requiredFunction('execute'),
}).passthrough();
