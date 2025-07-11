'use server';
/**
 * @fileOverview A marketing assistant AI agent for generating social media content.
 *
 * - generateMarketingContent - Generates a social media post and an image prompt for a given topic.
 * - GenerateMarketingContentInput - The input type for the generateMarketingContent function.
 * - GenerateMarketingContentOutput - The return type for the generateMarketingContent function.
 * - generateImage - Generates an image from a prompt.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schema for generating post content
const GenerateMarketingContentInputSchema = z.object({
  topic: z.string().describe('The topic for the social media post.'),
});
export type GenerateMarketingContentInput = z.infer<typeof GenerateMarketingContentInputSchema>;

const GenerateMarketingContentOutputSchema = z.object({
  post: z.string().describe('The generated social media post content. It should be engaging and relevant for a dog grooming salon in Poland. Include hashtags.'),
  imagePrompt: z.string().describe('A descriptive prompt for an image generation model, based on the post. It should describe a visually appealing scene related to the post.'),
});
export type GenerateMarketingContentOutput = z.infer<typeof GenerateMarketingContentOutputSchema>;

const marketingContentPrompt = ai.definePrompt({
    name: 'marketingContentPrompt',
    input: {schema: GenerateMarketingContentInputSchema},
    output: {schema: GenerateMarketingContentOutputSchema},
    prompt: `You are a marketing assistant for a dog grooming salon called SalonMinder, based in Poland. Your task is to generate a short, engaging social media post based on the following topic. The post should be friendly, professional, and appeal to dog owners. Also, provide a simple, descriptive prompt to generate a relevant image.

Topic: {{{topic}}}
`,
});

const marketingContentFlow = ai.defineFlow(
  {
    name: 'marketingContentFlow',
    inputSchema: GenerateMarketingContentInputSchema,
    outputSchema: GenerateMarketingContentOutputSchema,
  },
  async (input) => {
      const {output} = await marketingContentPrompt(input);
      return output!;
  }
);

export async function generateMarketingContent(input: GenerateMarketingContentInput): Promise<GenerateMarketingContentOutput> {
    return marketingContentFlow(input);
}


// Schema for generating image
const GenerateImageInputSchema = z.object({
    prompt: z.string().describe('The prompt to generate an image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
    imageUrl: z.string().describe("The generated image as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

const generateImageFlow = ai.defineFlow({
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
}, async (input) => {
    const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: input.prompt,
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });
    
    if (!media?.url) {
        throw new Error('Image generation failed.');
    }

    return {
        imageUrl: media.url
    };
});

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
    return generateImageFlow(input);
}
