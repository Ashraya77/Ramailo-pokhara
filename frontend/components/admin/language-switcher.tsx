"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAdminI18n } from "@/components/admin/admin-language-provider";
import {
  ADMIN_LANGUAGE_COOKIE,
  adminLanguageLabels,
  adminLanguages,
  type AdminLanguage,
} from "@/lib/admin-i18n";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languageItems = adminLanguages.map((value) => ({
  value,
  label: adminLanguageLabels[value],
}));

export function LanguageSwitcher() {
  const router = useRouter();
  const { dictionary, language, setLanguage } = useAdminI18n();

  const handleLanguageChange = (value: AdminLanguage | null) => {
    if (!value || value === language) return;

    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${ADMIN_LANGUAGE_COOKIE}=${value}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
    setLanguage(value);
    router.refresh();
  };

  return (
    <Select
      items={languageItems}
      value={language}
      onValueChange={handleLanguageChange}
    >
      <SelectTrigger
        size="sm"
        className="min-w-24 border-primary/20 text-primary hover:bg-accent"
        aria-label={dictionary.common.language}
      >
        <Languages data-icon="inline-start" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end" alignItemWithTrigger={false}>
        <SelectGroup>
          {languageItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
