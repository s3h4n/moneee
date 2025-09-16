interface CurrencyOption {
  code: string
  label: string
}

interface LocaleOption {
  code: string
  label: string
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: "LKR", label: "Sri Lankan Rupee" },
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "AUD", label: "Australian Dollar" },
  { code: "CAD", label: "Canadian Dollar" },
  { code: "INR", label: "Indian Rupee" },
  { code: "SGD", label: "Singapore Dollar" },
]

export const SUPPORTED_LOCALES: LocaleOption[] = [
  { code: "en-LK", label: "English (Sri Lanka)" },
  { code: "en-US", label: "English (United States)" },
  { code: "en-GB", label: "English (United Kingdom)" },
  { code: "si-LK", label: "Sinhala" },
  { code: "ta-LK", label: "Tamil" },
]
