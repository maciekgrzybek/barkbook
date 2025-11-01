'use client';

import { PageHeader } from '@/components/page-header';
import { LanguageSwitcher } from '@/features/language/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/features/language/contexts/language-context';
import { useEffect, useState } from 'react';

export function SettingsPage() {
  const { t } = useLanguage();
  const [isCalConnected, setIsCalConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch('/api/calendar/connection', {
          cache: 'no-store',
        });
        const json = await res.json();
        setIsCalConnected(Boolean(json.connected));
      } catch (e) {
        setIsCalConnected(false);
      } finally {
        setLoading(false);
      }
    };
    checkConnection();
  }, []);

  return (
    <>
      <PageHeader title={t('settings.title')} />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendar Integration (Cal.com)</CardTitle>
            <CardDescription>
              Connect your Cal.com account to manage visits and sync events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">
                Checking connection…
              </div>
            ) : isCalConnected ? (
              <div className="flex items-center justify-between">
                <div className="text-sm">Connected to Cal.com</div>
                <Button
                  variant="outline"
                  onClick={() =>
                    window.location.assign('/api/auth/calcom?disconnect=1')
                  }
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => window.location.assign('/api/auth/calcom')}
              >
                Connect Cal.com
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.language')}</CardTitle>
            <CardDescription>
              Choose your preferred language for the application interface.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LanguageSwitcher />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.notifications')}</CardTitle>
            <CardDescription>
              {t('settings.notifications.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch id="notifications-switch" />
              <Label htmlFor="notifications-switch">
                {t('settings.notifications.enable')}
              </Label>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button>{t('save')}</Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
