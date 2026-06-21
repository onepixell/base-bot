export declare function addPluginToRegistry(pluginKey: string, version: string): Promise<void>;
export declare function removePluginFromRegistry(pluginKey: string): Promise<void>;
export declare function getRegistryDependencies(): Promise<Record<string, string>>;
