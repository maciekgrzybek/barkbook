import { PawPrint } from 'lucide-react';
import { useLanguage } from '@/features/language/contexts/language-context';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function Logo() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-2">
      <PawPrint className="h-6 w-6 text-primary" />
      <span className="text-lg font-bold">{t('appName')}</span>
    </div>
  );
}
