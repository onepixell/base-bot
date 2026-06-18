import { WAMessage } from 'baileys';
export declare class MessageContext {
    #private;
    key: any;
    chat: string;
    fromMe: boolean;
    flags: any;
    bot: any;
    sender: any;
    permissions: any;
    body: any;
    message: any;
    quoted: any;
    commands: any[];
    plugins: any;
    constructor(sock: any, raw: WAMessage, data: any);
    reply(text: string): Promise<any>;
    sendImage(image: Buffer | {
        url: string;
    }, caption?: string): Promise<any>;
    sendVideo(video: Buffer | {
        url: string;
    }, caption?: string): Promise<any>;
    sendAudio(audio: Buffer | {
        url: string;
    }, ptt?: boolean): Promise<any>;
    sendDocument(document: Buffer | {
        url: string;
    }, options?: any): Promise<any>;
    sendSticker(sticker: Buffer | {
        url: string;
    }): Promise<any>;
    react(emoji: string): Promise<any>;
    delete(): Promise<any>;
    downloadMedia(): Promise<Buffer<ArrayBufferLike>>;
}
export default function ({ id, sock, WAMessage }: {
    id: string;
    sock: any;
    WAMessage: WAMessage;
}): Promise<MessageContext>;
