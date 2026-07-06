import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type Language = "zh" | "en"

interface I18nContextValue {
  language: Language
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
}

const LANGUAGE_STORAGE_KEY = "aiconductor-photoid-language"

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)

    if (savedLanguage === "zh" || savedLanguage === "en") {
      setLanguageState(savedLanguage)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en"
    document.title = language === "zh" ? "证照优化大师" : "AIConductor PhotoID"
  }, [language])

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage: setLanguageState,
      toggleLanguage: () => {
        setLanguageState((current) => (current === "zh" ? "en" : "zh"))
      },
    }),
    [language],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const value = useContext(I18nContext)

  if (!value) {
    throw new Error("useI18n must be used within I18nProvider")
  }

  return value
}
