interface MessagePayload {
    id: string;
    chat_jid: string;
    sender_jid: string | null;
    mtype: string | null;
    text_content: string | null;
    raw_message: string;
    timestamp: Date;
}
export declare class MessageBatcher {
    private buffer;
    private isProcessing;
    private batchInterval;
    private _intervalRef;
    constructor(intervalMs?: number);
    add(payload: MessagePayload): void;
    flush(): Promise<void>;
    destroy(): void;
}
export declare const messageBatcher: MessageBatcher;
export {};
