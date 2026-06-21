declare global {
  interface SerializedMessageExtensions {
    permissions: {
      sender: {
        /**
         * **[EN]** 
         * Indicates whether the sender of this message is the bot owner.
         * Defined via `plugins/@lazy/basic/configs/owner.json`.
         * 
         * **[ID]** 
         * Menandakan apakah pengirim pesan ini adalah Owner bot.
         * Didefinisikan melalui `plugins/@lazy/basic/configs/owner.json`.
         */
        owner?: boolean;
      };
    };
  }
}

export {};
