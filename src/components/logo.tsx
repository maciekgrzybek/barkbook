import { PawPrint } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export function Logo() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-2">
      <PawPrint className="h-6 w-6 text-primary" />
      <span className="text-lg font-bold">{t('appName')}</span>
    </div>
  );
}
