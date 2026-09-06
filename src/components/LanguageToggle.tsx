'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'gu' : 'en')}
      className="text-xs font-medium px-2.5 py-1.5 rounded-full border border-brand-200 bg-white text-brand-700 whitespace-nowrap"
      aria-label="Toggle language"
    >
      {lang === 'en' ? 'ગુજરાતી' : 'English'}
    </button>
  );
}
