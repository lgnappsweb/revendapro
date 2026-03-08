'use server';
/**
 * @fileOverview A Genkit flow for generating product descriptions.
 *
 * - generateProductDescription - A function that generates a product description based on input details.
 * - GenerateProductDescriptionInput - The input type for the generateProductDescription function.
 * - GenerateProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  brand: z.string().describe('The brand of the product (e.g., Avon, Natura).'),
  category: z.string().describe('The category of the product (e.g., perfume, makeup, cream).'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  description: z.string().describe('A compelling and descriptive text for the product.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

const productDescriptionPrompt = ai.definePrompt({
  name: 'productDescriptionPrompt',
  input: { schema: GenerateProductDescriptionInputSchema },
  output: { schema: GenerateProductDescriptionOutputSchema },
  prompt: `You are an expert copywriter specializing in beauty product descriptions for brands like Avon and Natura.

Generate a compelling, descriptive, and engaging product description based on the following details:

Product Name: {{{productName}}}
Brand: {{{brand}}}
Category: {{{category}}}

The description should be professional, highlight key features, and entice customers. Do not include any pricing information or call to actions.`,
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await productDescriptionPrompt(input);
    return output!;
  }
);

export async function generateProductDescription(
  input: GenerateProductDescriptionInput
): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}
