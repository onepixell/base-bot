export declare const databaseConfig: {
    mysql: {
        client: string;
        connection: {
            host: string | undefined;
            port: number;
            user: string | undefined;
            password: string | undefined;
            database: string | undefined;
        };
        migrations: {
            directory: string;
            tableName: string;
            loadExtensions: string[];
        };
    };
    sqlite: {
        client: string;
        connection: {
            filename: string;
        };
        useNullAsDefault: boolean;
        migrations: {
            directory: string;
            tableName: string;
            loadExtensions: string[];
        };
    };
};
