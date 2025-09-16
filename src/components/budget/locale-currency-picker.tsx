"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SUPPORTED_CURRENCIES, SUPPORTED_LOCALES } from "@/lib/currencies"

interface LocaleCurrencyPickerProps {
  currency: string
  locale: string
  onCurrencyChange?: (currency: string) => void
  onLocaleChange?: (locale: string) => void
}

export function LocaleCurrencyPicker({
  currency,
  locale,
  onCurrencyChange,
  onLocaleChange,
}: LocaleCurrencyPickerProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Select value={currency} onValueChange={onCurrencyChange}>
          <SelectTrigger id="currency">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_CURRENCIES.map((option) => (
              <SelectItem key={option.code} value={option.code}>
                {option.label} ({option.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="locale">Locale</Label>
        <Select value={locale} onValueChange={onLocaleChange}>
          <SelectTrigger id="locale">
            <SelectValue placeholder="Select locale" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LOCALES.map((option) => (
              <SelectItem key={option.code} value={option.code}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
