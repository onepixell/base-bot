import { db } from '@lazy/core/services/database/index';
import logger from '@lazy/core/utils/logger';
import env from '@lazy/core/services/env/index';
export class MessageBatcher {
    buffer = [];
    isProcessing = false;
    batchInterval;
    constructor(intervalMs = env.STORE_BATCH_INTERVAL_MS) {
        this.batchInterval = intervalMs;
        if (env.STORE_ENABLED && env.STORE_MESSAGES) {
            setInterval(() => this.flush(), this.batchInterval);
        }
    }
    add(payload) {
        if (!env.STORE_MESSAGES)
            return;
        this.buffer.push(payload);
        if (this.buffer.length >= 100) {
            this.flush();
        }
    }
    async flush() {
        if (this.buffer.length === 0 || this.isProcessing)
            return;
        this.isProcessing = true;
        const itemsToInsert = [...this.buffer];
        this.buffer = [];
        try {
            await db.batchInsert('store_messages', itemsToInsert, 50);
        }
        catch (err) {
            logger.error('[STORE]', `Failed to batch insert messages: ${err.message}`);
        }
        finally {
            this.isProcessing = false;
        }
    }
}
export const messageBatcher = new MessageBatcher();
