'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2, Sparkles } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/hooks/use-toast';
import { generateMarketingContent, generateImage } from '@/ai/flows/marketing-flow';

export default function MarketingPage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [postContent, setPostContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic) return;

        setIsLoading(true);
        setIsGeneratingImage(false);
        setPostContent('');
        setImageUrl('');

        try {
            const contentResult = await generateMarketingContent({ topic });
            setPostContent(contentResult.post);
            
            setIsGeneratingImage(true);
            const imageResult = await generateImage({ prompt: contentResult.imagePrompt });
            setImageUrl(imageResult.imageUrl);

        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error generating content',
                description: 'Something went wrong. Please try again.',
            });
        } finally {
            setIsLoading(false);
            setIsGeneratingImage(false);
        }
    };

    return (
        <>
            <PageHeader title={t('marketing.title')} />
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('marketing.generator_title')}</CardTitle>
                        <CardDescription>{t('marketing.generator_description')}</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="topic">{t('marketing.topic_label')}</Label>
                                <Textarea
                                    id="topic"
                                    placeholder={t('marketing.topic_placeholder')}
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isLoading || !topic}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {isGeneratingImage ? t('marketing.generating_image') : t('marketing.generating_post')}
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        {t('marketing.generate_button')}
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>{t('marketing.result_title')}</CardTitle>
                        <CardDescription>{t('marketing.result_description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        {(isLoading || postContent) ? (
                             <div className="space-y-4">
                                <div>
                                    <Label className="text-sm font-semibold">Image</Label>
                                    <div className="mt-2 aspect-video w-full rounded-lg border bg-muted flex items-center justify-center">
                                        {(isLoading && isGeneratingImage) ? (
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Loader2 className="h-8 w-8 animate-spin" />
                                                <p>Generating image...</p>
                                            </div>
                                        ) : imageUrl ? (
                                            <Image src={imageUrl} alt="Generated image" width={500} height={281} className="rounded-lg object-cover" />
                                        ) : (
                                            !isLoading && <div className="text-muted-foreground">Image will appear here</div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-semibold">Post</Label>
                                    {isLoading && !postContent ? (
                                         <div className="space-y-2 mt-2">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-3/4" />
                                         </div>
                                    ) : (
                                        <p className="mt-2 whitespace-pre-wrap rounded-lg border bg-muted p-4 text-sm">{postContent}</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed text-center">
                                <p className="text-muted-foreground">{t('marketing.awaiting_generation')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
