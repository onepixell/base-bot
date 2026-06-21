import { isJidGroup, jidNormalizedUser } from 'baileys';
import { db } from '@lazy/core/services/database/index';
import { CacheService } from '@lazy/core/services/cache/index';
import env from '@lazy/core/services/env/index';
import logger from '@lazy/core/utils/logger';
import { messageBatcher } from './batcher.js';
const storeCache = new CacheService('store');
export const bindStore = (sock) => {
    logger.info('[STORE]', 'Binding Baileys events to Knex Store...');
    sock.ev.on('contacts.upsert', async (contacts) => {
        if (!env.STORE_CONTACTS)
            return;
        try {
            const payloads = contacts.map((c) => {
                const jid = jidNormalizedUser(c.id);
                return {
                    jid,
                    name: c.name || c.notify || null,
                    pushname: c.notify || null,
                    updated_at: new Date(),
                };
            });
            for (const payload of payloads) {
                if (!payload.jid || payload.jid === 'status@broadcast')
                    continue;
                await db('store_contacts')
                    .insert(payload)
                    .onConflict('jid')
                    .merge(['name', 'pushname', 'updated_at'])
                    .catch(() => { });
                await storeCache.del(`name:${payload.jid}`);
            }
        }
        catch (err) {
            logger.error('[STORE]', `Error syncing contacts: ${err.message}`);
        }
    });
    sock.ev.on('groups.update', async (groups) => {
        if (!env.STORE_GROUPS)
            return;
        try {
            for (const group of groups) {
                if (!group.id)
                    continue;
                const jid = jidNormalizedUser(group.id);
                const payload = {
                    jid,
                    subject: group.subject || null,
                    updated_at: new Date(),
                };
                await db('store_groups')
                    .insert(payload)
                    .onConflict('jid')
                    .merge(['subject', 'updated_at'])
                    .catch(() => { });
                await storeCache.del(`group:${jid}`);
            }
        }
        catch (err) {
            logger.error('[STORE]', `Error syncing groups: ${err.message}`);
        }
    });
    sock.ev.on('messaging-history.set', async ({ chats, contacts, isLatest }) => {
        logger.info('[STORE]', `Processing history sync... (isLatest: ${isLatest})`);
        if (env.STORE_CONTACTS && contacts && contacts.length > 0) {
            try {
                for (const c of contacts) {
                    if (!c.id || c.id === 'status@broadcast')
                        continue;
                    const jid = jidNormalizedUser(c.id);
                    await db('store_contacts')
                        .insert({
                        jid,
                        name: c.name || c.notify || null,
                        pushname: c.notify || null,
                        updated_at: new Date(),
                    })
                        .onConflict('jid')
                        .merge(['name', 'pushname', 'updated_at'])
                        .catch(() => { });
                }
            }
            catch (err) {
                logger.error('[STORE]', `Error syncing history contacts: ${err.message}`);
            }
        }
        if (env.STORE_CHATS && chats && chats.length > 0) {
            try {
                for (const c of chats) {
                    if (!c.id || c.id === 'status@broadcast')
                        continue;
                    const jid = jidNormalizedUser(c.id);
                    await db('store_chats')
                        .insert({
                        id: jid,
                        conversation_timestamp: c.conversationTimestamp
                            ? Number(c.conversationTimestamp)
                            : null,
                        unread_count: c.unreadCount || 0,
                        updated_at: new Date(),
                    })
                        .onConflict('id')
                        .merge(['conversation_timestamp', 'unread_count', 'updated_at'])
                        .catch(() => { });
                }
            }
            catch (err) {
                logger.error('[STORE]', `Error syncing history chats: ${err.message}`);
            }
        }
    });
    sock.ev.on('chats.upsert', async (chats) => {
        if (!env.STORE_CHATS)
            return;
        try {
            for (const c of chats) {
                if (!c.id || c.id === 'status@broadcast')
                    continue;
                const jid = jidNormalizedUser(c.id);
                await db('store_chats')
                    .insert({
                    id: jid,
                    conversation_timestamp: c.conversationTimestamp
                        ? Number(c.conversationTimestamp)
                        : null,
                    unread_count: c.unreadCount || 0,
                    updated_at: new Date(),
                })
                    .onConflict('id')
                    .merge(['conversation_timestamp', 'unread_count', 'updated_at'])
                    .catch(() => { });
            }
        }
        catch (err) {
            logger.error('[STORE]', `Error syncing chats: ${err.message}`);
        }
    });
    sock.ev.on('chats.update', async (updates) => {
        if (!env.STORE_CHATS)
            return;
        try {
            for (const u of updates) {
                if (!u.id || u.id === 'status@broadcast')
                    continue;
                const jid = jidNormalizedUser(u.id);
                const updateData = { updated_at: new Date() };
                if (u.conversationTimestamp)
                    updateData.conversation_timestamp = Number(u.conversationTimestamp);
                if (u.unreadCount !== undefined)
                    updateData.unread_count = u.unreadCount;
                await db('store_chats')
                    .where('id', jid)
                    .update(updateData)
                    .catch(() => { });
            }
        }
        catch (err) {
            logger.error('[STORE]', `Error updating chats: ${err.message}`);
        }
    });
    sock.ev.on('messages.update', async (updates) => {
        if (!env.STORE_MESSAGES)
            return;
        try {
            for (const { key, update } of updates) {
                if (!key.id)
                    continue;
                if (update.messageStubType === 1) {
                    await db('store_messages')
                        .where('id', key.id)
                        .update({ status: 'deleted' })
                        .catch(() => { });
                }
                else {
                    await db('store_messages')
                        .where('id', key.id)
                        .update({ status: 'edited' })
                        .catch(() => { });
                }
            }
        }
        catch (err) {
            logger.error('[STORE]', `Error updating messages: ${err.message}`);
        }
    });
    sock.ev.on('messages.delete', async (item) => {
        if (!env.STORE_MESSAGES)
            return;
        try {
            if ('all' in item) {
                if (!item.jid)
                    return;
                await db('store_messages')
                    .where('chat_jid', jidNormalizedUser(item.jid))
                    .update({ status: 'deleted' })
                    .catch(() => { });
            }
            else {
                const ids = item.keys.map((k) => k.id).filter((id) => !!id);
                await db('store_messages')
                    .whereIn('id', ids)
                    .update({ status: 'deleted' })
                    .catch(() => { });
            }
        }
        catch (err) {
            logger.error('[STORE]', `Error deleting messages: ${err.message}`);
        }
    });
    sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
        if (!env.STORE_GROUPS)
            return;
        try {
            const jid = jidNormalizedUser(id);
            const group = await db('store_groups').where('jid', jid).first();
            if (!group)
                return;
            let metadata = group.metadata || { participants: [] };
            if (typeof metadata === 'string')
                metadata = JSON.parse(metadata);
            if (action === 'add') {
                const newParticipants = participants.map((p) => ({
                    id: p,
                    admin: null,
                }));
                metadata.participants.push(...newParticipants);
            }
            else if (action === 'remove') {
                metadata.participants = metadata.participants.filter((p) => !participants.includes(p.id));
            }
            else if (action === 'promote' || action === 'demote') {
                metadata.participants.forEach((p) => {
                    if (participants.includes(p.id))
                        p.admin = action === 'promote' ? 'admin' : null;
                });
            }
            await db('store_groups')
                .where('jid', jid)
                .update({
                metadata: JSON.stringify(metadata),
                updated_at: new Date(),
            })
                .catch(() => { });
            await storeCache.del(`group:${jid}`);
        }
        catch (err) {
            logger.error('[STORE]', `Error updating group participants: ${err.message}`);
        }
    });
    sock.ev.on('messages.upsert', async ({ messages }) => {
        if (!env.STORE_MESSAGES)
            return;
        try {
            for (const msg of messages) {
                if (!msg.message || msg.key.remoteJid === 'status@broadcast')
                    continue;
                const mtype = Object.keys(msg.message)[0];
                const textContent = msg.message.conversation ||
                    msg.message.extendedTextMessage?.text ||
                    msg.message.imageMessage?.caption ||
                    msg.message.videoMessage?.caption ||
                    null;
                const extractPnJid = (jid, altJid) => {
                    if (!jid)
                        return '';
                    if (jid.includes('@lid') &&
                        altJid &&
                        altJid.includes('@s.whatsapp.net')) {
                        return altJid;
                    }
                    return jid;
                };
                const chatJid = extractPnJid(msg.key.remoteJid, msg.key.remoteJidAlt);
                const senderJid = msg.key.fromMe
                    ? 'me'
                    : msg.key.participant
                        ? extractPnJid(msg.key.participant, msg.key.remoteJidAlt)
                        : chatJid;
                messageBatcher.add({
                    id: msg.key.id,
                    chat_jid: jidNormalizedUser(chatJid),
                    sender_jid: senderJid === 'me' ? 'me' : jidNormalizedUser(senderJid),
                    mtype,
                    text_content: textContent,
                    raw_message: JSON.stringify(msg),
                    timestamp: new Date(msg.messageTimestamp * 1000),
                });
            }
        }
        catch (err) {
            logger.error('[STORE]', `Error buffering messages: ${err.message}`);
        }
    });
};
export const getName = async (jid) => {
    if (!jid)
        return null;
    const cleanJid = jidNormalizedUser(jid);
    return await storeCache.remember(`name:${cleanJid}`, 86400, async () => {
        const contact = await db('store_contacts').where('jid', cleanJid).first();
        if (!contact)
            return null;
        return contact.name || contact.pushname || null;
    });
};
export const getGroupName = async (jid) => {
    if (!isJidGroup(jid))
        return null;
    const cleanJid = jidNormalizedUser(jid);
    return await storeCache.remember(`group:${cleanJid}`, 86400, async () => {
        const group = await db('store_groups').where('jid', cleanJid).first();
        if (!group)
            return null;
        return group.subject || null;
    });
};
export const loadMessages = async (jid, count, _cursor) => {
    if (!jid)
        return [];
    const cleanJid = jidNormalizedUser(jid);
    const msgs = await db('store_messages')
        .where('chat_jid', cleanJid)
        .whereNot('status', 'deleted')
        .orderBy('timestamp', 'desc')
        .limit(count);
    return msgs
        .reverse()
        .map((m) => {
        try {
            return typeof m.raw_message === 'string'
                ? JSON.parse(m.raw_message)
                : m.raw_message;
        }
        catch {
            return null;
        }
    })
        .filter((m) => m !== null);
};
export const loadMessage = async (jid, id) => {
    if (!jid || !id)
        return null;
    const cleanJid = jidNormalizedUser(jid);
    const msg = await db('store_messages')
        .where({ chat_jid: cleanJid, id })
        .first();
    if (!msg)
        return null;
    try {
        return typeof msg.raw_message === 'string'
            ? JSON.parse(msg.raw_message)
            : msg.raw_message;
    }
    catch {
        return null;
    }
};
export const mostRecentMessage = async (jid) => {
    if (!jid)
        return null;
    const cleanJid = jidNormalizedUser(jid);
    const msg = await db('store_messages')
        .where('chat_jid', cleanJid)
        .whereNot('status', 'deleted')
        .orderBy('timestamp', 'desc')
        .first();
    if (!msg)
        return null;
    try {
        return typeof msg.raw_message === 'string'
            ? JSON.parse(msg.raw_message)
            : msg.raw_message;
    }
    catch {
        return null;
    }
};
export const fetchImageUrl = async (jid, sock) => {
    if (!jid || !sock)
        return undefined;
    const cleanJid = jidNormalizedUser(jid);
    return await storeCache.remember(`ppUrl:${cleanJid}`, 86400 * 3, async () => {
        try {
            return await sock.profilePictureUrl(cleanJid);
        }
        catch (error) {
            return undefined;
        }
    });
};
export const fetchGroupMetadata = async (jid, sock) => {
    if (!isJidGroup(jid) || !sock)
        return null;
    const cleanJid = jidNormalizedUser(jid);
    return await storeCache.remember(`groupMeta:${cleanJid}`, 86400, async () => {
        try {
            const group = await db('store_groups').where('jid', cleanJid).first();
            if (group && group.metadata) {
                let meta = group.metadata;
                if (typeof meta === 'string')
                    meta = JSON.parse(meta);
                if (meta.participants && meta.participants.length > 0) {
                    return meta;
                }
            }
            const metadata = await sock.groupMetadata(cleanJid);
            await db('store_groups')
                .insert({
                jid: cleanJid,
                subject: metadata.subject,
                metadata: JSON.stringify(metadata),
            })
                .onConflict('jid')
                .merge(['subject', 'metadata']);
            return metadata;
        }
        catch (err) {
            return null;
        }
    });
};
export const getChats = async () => {
    return await db('store_chats').orderBy('conversation_timestamp', 'desc');
};
