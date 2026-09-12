// CP2-9 FIX: Removed Arabic (ar) locale support, added Russian (ru) locale.
// Korean (ko) and French (fr) were incorrectly removed and have been restored.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../locales/en.json';
import ms from '../../locales/ms.json';
import zhCN from '../../locales/zh-CN.json';
import ko from '../../locales/ko.json';
import fr from '../../locales/fr.json';
import de from '../../locales/de.json';
import ja from '../../locales/ja.json';
import ru from '../../locales/ru.json';

const resources = {
  en: { translation: en },
  ms: { translation: ms },
  'zh-CN': { translation: zhCN },
  ko: { translation: ko },
  fr: { translation: fr },
  de: { translation: de },
  ja: { translation: ja },
  ru: { translation: ru }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;