import "server-only";

import { cookies } from "next/headers";

import {
  ADMIN_LANGUAGE_COOKIE,
  DEFAULT_ADMIN_LANGUAGE,
  adminLocales,
  getAdminDictionary,
  isAdminLanguage,
  type AdminLanguage,
} from "@/frontend/lib/admin-i18n";

export async function getAdminLanguage(): Promise<AdminLanguage> {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_LANGUAGE_COOKIE)?.value;

  return isAdminLanguage(value) ? value : DEFAULT_ADMIN_LANGUAGE;
}

export async function getAdminI18n() {
  const language = await getAdminLanguage();

  return {
    language,
    locale: adminLocales[language],
    dictionary: getAdminDictionary(language),
  };
}
