declare global {
  interface CommandExtensions {
    /**
     * **[EN]** 
     * If set to `true`, the command can be executed even if the user types it without a prefix (e.g., "help" instead of "/help").
     * 
     * **[ID]** 
     * Jika diatur ke `true`, command dapat dijalankan meskipun pengguna mengetik tanpa menggunakan prefix (misal: "help" alih-alih "/help").
     * 
     * @default false
     */
    withoutPrefix?: boolean;
  }

  interface SerializedMessageExtensions {
    body: {
      prefixes?: string[];
      prefix?: string;
      commandWithPrefix?: string;
    };
  }
}

export {};
