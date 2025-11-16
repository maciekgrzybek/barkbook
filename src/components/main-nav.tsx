'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Calendar,
  Settings,
  PawPrint,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/features/language/contexts/language-context';
import { Button } from '@/components/ui/button';

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const routes = [
    // {
    //   href: '/dashboard',
    //   label: t('dashboard'),
    //   icon: LayoutDashboard,
    //   active: pathname === '/dashboard',
    // },
    {
      href: '/clients',
      label: t('clients'),
      icon: Users,
      active: pathname.startsWith('/clients'),
    },
    {
      href: '/calendar',
      label: t('calendar'),
      icon: Calendar,
      active: pathname === '/calendar',
    },
    {
      href: '/pets',
      label: t('pets'),
      icon: PawPrint,
      active: pathname.startsWith('/pets'),
    },
    // {
    //   href: '/settings',
    //   label: t('settings'),
    //   icon: Settings,
    //   active: pathname === '/settings',
    // },
  ];

  return (
    <nav className={cn('flex flex-col gap-2', className)} {...props}>
      {routes.map((route) => (
        <Button
          key={route.href}
          asChild
          variant={route.active ? 'secondary' : 'ghost'}
          className="justify-start"
        >
          <Link href={route.href}>
            <route.icon className="mr-2 h-4 w-4" />
            {route.label}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
