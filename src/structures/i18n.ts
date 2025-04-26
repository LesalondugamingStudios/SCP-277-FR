/*
 * Copyright (C) 2023-2025  LesalondugamingStudios
 * 
 * See the README file for more information.
 */

import i18next from "i18next";
import Backend from "i18next-fs-backend";
import path from "path";
import { readdir, stat } from "fs/promises";

export const i18nLanguages = ["en", "fr", "de", "pt", "ru", "tr", "ua"]

async function walkDirectory(dir: string, namespaces: string[] = [], folderName = "") {
  const files = await readdir(dir);

  const languages = [];
  for (const file of files) {
    const _stat = await stat(path.join(dir, file));
    if (_stat.isDirectory()) {
      const isLanguage = i18nLanguages.includes(file);
      if (isLanguage) languages.push(file);

      const folder = await walkDirectory(path.join(dir, file), namespaces, isLanguage ? "" : `${file}/`);

      namespaces = folder.namespaces;
    } else {
      namespaces.push(`${folderName}${file.substr(0, file.length - 5)}`);
    }
  }

  return { namespaces: [...new Set(namespaces)], languages };
}

export default async () => {
  const { namespaces, languages } = await walkDirectory(path.resolve(import.meta.dirname, "../locales/"));

  i18next.use(Backend);

  await i18next.init({
    backend: {
      jsonIndent: 2,
      loadPath: path.resolve(import.meta.dirname, "../locales/{{lng}}/{{ns}}.json")
    },
    debug: false,
    fallbackLng: ["en", "fr"],
    initImmediate: false,
    interpolation: { escapeValue: false },
    load: "all",
    ns: namespaces,
    preload: languages
  });

  return new Map(languages.map(item => [item, i18next.getFixedT(item)]));
};