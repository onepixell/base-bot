import { getNestedValue } from '@lazy/core/utils/helpers';
import { interpolateString } from '@lazy/core/utils/helpers';
import pluginManager from '@lazy/core/services/plugin/index';
import logger from '@lazy/core/utils/logger';
import env from '@lazy/core/services/env/index';
import fs from 'fs/promises';
import path from 'path';
export let currentLang = env.DEFAULT_LANG;
const coreLanguages = new Map();
export const t = function (pathKey, params = {}, customLang) {
    let namespace = 'core';
    let keyPath = pathKey;
    if (pathKey.includes(':')) {
        const parts = pathKey.split(':');
        namespace = parts[0];
        keyPath = parts[1];
    }
    const langCode = customLang || currentLang;
    let langData;
    if (namespace === 'core') {
        langData = coreLanguages.get(langCode);
        if (!langData) {
            langData = coreLanguages.get('en') || {};
        }
    }
    else {
        langData = pluginManager.languages.get(`${namespace}:${langCode}`);
        if (!langData) {
            langData = pluginManager.languages.get(`${namespace}:en`) || {};
        }
    }
    const textTemplate = getNestedValue(langData, keyPath);
    if (typeof textTemplate === 'string') {
        return interpolateString(textTemplate, params);
    }
    return pathKey.includes(':') ? pathKey.split(':')[1] : pathKey;
};
async function loadCoreLangs() {
    const coreLangDir = path.join(process.cwd(), 'core', 'lang');
    try {
        const files = await fs.readdir(coreLangDir);
        await Promise.all(files.map(async (file) => {
            if (file.endsWith('.json')) {
                try {
                    const langCode = file.replace('.json', '');
                    const rawJson = await fs.readFile(path.join(coreLangDir, file), 'utf-8');
                    const langData = JSON.parse(rawJson);
                    coreLanguages.set(langCode, langData);
                }
                catch (err) {
                    logger.fatal('[i18n]', t('i18n.load_failed', { file }));
                    process.exit(1);
                }
            }
        }));
    }
    catch (err) {
        logger.fatal('[i18n]', t('i18n.folder_not_found', { dir: coreLangDir }));
        process.exit(1);
    }
}
export async function setGlobalLang(newLang) {
    try {
        currentLang = newLang;
        env.DEFAULT_LANG = newLang;
        const envPath = path.resolve(process.cwd(), '.env');
        let envContent = await fs.readFile(envPath, 'utf-8').catch(() => '');
        const regex = /^DEFAULT_LANG=.*$/m;
        if (regex.test(envContent)) {
            envContent = envContent.replace(regex, `DEFAULT_LANG=${newLang}`);
        }
        else {
            envContent += `\nDEFAULT_LANG=${newLang}`;
        }
        await fs.writeFile(envPath, envContent, 'utf-8');
        logger.ready('[i18n]', t('i18n.lang_changed', { lang: newLang }));
        return true;
    }
    catch (err) {
        logger.error('[i18n]', t('i18n.lang_change_failed', {
            lang: newLang,
            error: err?.message ?? err,
        }));
        return false;
    }
}
export async function initI18n() {
    await loadCoreLangs();
    logger.success('[i18n]', t('i18n.initialized'));
}
export const getAvailableLangs = () => Array.from(coreLanguages.keys());
