'use client';

import { useLanguage } from '@/contexts/language-context';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <RadioGroup
      defaultValue={language}
      onValueChange={(value) => setLanguage(value as 'en' | 'pl')}
      className="flex items-center space-x-4"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="en" id="en" />
        <Label htmlFor="en">English</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="pl" id="pl" />
        <Label htmlFor="pl">Polski</Label>
      </div>
    </RadioGroup>
  );
}
