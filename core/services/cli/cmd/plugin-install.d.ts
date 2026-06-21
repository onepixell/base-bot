declare const _default: {
    name: string;
    description: string;
    usage: string;
    flags: {
        name: string;
        alias: string;
        type: string;
        description: string;
    }[];
    action: (args: string[], _flags: Record<string, any>, cli: any) => Promise<void>;
};
export default _default;
