"use client";

import { createContext, useContext, useMemo, useState } from "react";

import {
  adminLocales,
  getAdminDictionary,
  type AdminDictionary,
  type AdminLanguage,
} from "@/lib/admin-i18n";

type AdminLanguageContextValue = {
  language: AdminLanguage;
  locale: string;
  dictionary: AdminDictionary;
  setLanguage: (language: AdminLanguage) => void;
};

const AdminLanguageContext = createContext<AdminLanguageContextValue | null>(null);

export function AdminLanguageProvider({
  children,
  initialLanguage,
}: {
  children: React.ReactNode;
  initialLanguage: AdminLanguage;
}) {
  const [language, setLanguage] = useState<AdminLanguage>(initialLanguage);
  const value = useMemo(
    () => ({
      language,
      locale: adminLocales[language],
      dictionary: getAdminDictionary(language),
      setLanguage,
    }),
    [language],
  );

  return (
    <AdminLanguageContext.Provider value={value}>
      {children}
    </AdminLanguageContext.Provider>
  );
}

export function useAdminI18n(): AdminLanguageContextValue {
  const context = useContext(AdminLanguageContext);

  if (!context) {
    throw new Error("useAdminI18n must be used within AdminLanguageProvider");
  }

  return context;
}
