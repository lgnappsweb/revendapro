'use server';
/**
 * @fileOverview A Genkit flow for generating personalized WhatsApp marketing message drafts for clients.
 *
 * - generateWhatsappMarketingMessage - A function that generates a personalized WhatsApp marketing message draft.
 * - GenerateWhatsappMarketingMessageInput - The input type for the generateWhatsappMarketingMessage function.
 * - GenerateWhatsappMarketingMessageOutput - The return type for the generateWhatsappMarketingMessage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateWhatsappMarketingMessageInputSchema = z.object({
  clientName: z.string().describe('The name of the client to personalize the message for.'),
  lastPurchasedProducts: z
    .array(z.string())
    .describe('A list of product names the client has previously purchased.'),
  preferredCategories: z
    .array(z.string())
    .describe(
      'A list of product categories that the client has shown interest in or frequently buys (e.g., perfume, maquiagem).' Byron'
    ),
});

export type GenerateWhatsappMarketingMessageInput = z.infer<
  typeof GenerateWhatsappMarketingMessageInputSchema
>;

const GenerateWhatsappMarketingMessageOutputSchema = z.object({
  messageDraft: z.string().describe('A personalized WhatsApp marketing message draft for the client.'),
});

export type GenerateWhatsappMarketingMessageOutput = z.infer<
  typeof GenerateWhatsappMarketingMessageOutputSchema
>;

export async function generateWhatsappMarketingMessage(
  input: GenerateWhatsappMarketingMessageInput
): Promise<GenerateWhatsappMarketingMessageOutput> {
  return generateWhatsappMarketingMessageFlow(input);
}

const marketingMessagePrompt = ai.definePrompt({
  name: 'whatsappMarketingMessagePrompt',
  input: { schema: GenerateWhatsappMarketingMessageInputSchema },
  output: { schema: GenerateWhatsappMarketingMessageOutputSchema },
  prompt: `You are an AI assistant specialized in creating engaging and personalized marketing messages for WhatsApp.
Your goal is to draft a friendly, concise, and persuasive message for a client, recommending products or promotions based on their past purchasing behavior.

--- Client Information ---
Client Name: {{{clientName}}}
Last Purchased Products: {{#if lastPurchasedProducts}}{{lastPurchasedProducts}}{{else}}None listed.{{/if}}
Preferred Categories: {{#if preferredCategories}}{{preferredCategories}}{{else}}None listed.{{/if}}

--- Instructions ---
Draft a marketing message (max 2-3 paragraphs) for {{{clientName}}} to be sent via WhatsApp.

1.  Start with a friendly greeting.
2.  Reference their past purchases or preferred categories to make the message personal and relevant.
3.  Suggest new products, special offers, or upcoming promotions that might appeal to them.
4.  End with a call to action, inviting them to check out new arrivals or current deals. Keep it light and encouraging.
5.  Ensure the tone is warm, inviting, and professional, suitable for a direct message from a beauty product reseller.

Message Draft:`,
});

const generateWhatsappMarketingMessageFlow = ai.defineFlow(
  {
    name: 'generateWhatsappMarketingMessageFlow',
    inputSchema: GenerateWhatsappMarketingMessageInputSchema,
    outputSchema: GenerateWhatsappMarketingMessageOutputSchema,
  },
  async (input) => {
    const { output } = await marketingMessagePrompt(input);
    return output!;
  }
);
