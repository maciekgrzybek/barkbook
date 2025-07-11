'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-context';
import { placeholderAppointments } from '@/lib/placeholder-data';
import { Calendar as CalendarIcon, ArrowRight } from 'lucide-react';

export default function CalendarPage() {
    const { t } = useLanguage();

    return (
        <>
            <PageHeader title={t('calendar.title')} />
            <div className="grid gap-6">
                <Card className="bg-gradient-to-br from-primary/10 to-card">
                    <CardHeader>
                        <CardTitle>{t('calendar.connect')}</CardTitle>
                        <CardDescription>{t('calendar.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="secondary">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {t('calendar.connect')}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('dashboard.upcoming_appointments')}</CardTitle>
                        <CardDescription>A list of your scheduled appointments for today.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {placeholderAppointments.map(appt => (
                                <div key={appt.id} className="flex items-center p-3 rounded-lg border bg-card/50">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                        <CalendarIcon className="h-6 w-6" />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <p className="font-semibold">{appt.dogName} - {appt.services}</p>
                                        <p className="text-sm text-muted-foreground">{appt.clientName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{appt.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
