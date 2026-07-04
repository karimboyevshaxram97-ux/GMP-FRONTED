import type { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-opus-4-8';
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

const SYSTEM_PROMPT = `You are the AI search assistant embedded next to the search bar on the homepage of GMP (Global Migration Platform) — a platform connecting people with verified agencies for studying abroad, working abroad, travel, and visa services.

Help users:
- Find the right service type or country for their goal (study, work, travel, visa).
- Understand how GMP works (browsing agencies/services, applying, tracking applications).
- Get general, practical guidance about studying/working/traveling abroad.

Always reply in the same language the user writes in (Uzbek, Russian, English, or Korean). Keep answers short and practical — a few sentences, not an essay. If the user's question has nothing to do with migration, travel, study, work abroad, or GMP itself, politely say that's outside what you can help with here.`;

let client: Anthropic | null = null;

function getClient(): Anthropic {
	if (!client) {
		const apiKey = process.env.ANTHROPIC_API_KEY;
		if (!apiKey) {
			throw new Error('ANTHROPIC_API_KEY is not configured');
		}
		client = new Anthropic({ apiKey });
	}
	return client;
}

interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', 'POST');
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const { messages } = req.body ?? {};

	if (!Array.isArray(messages) || messages.length === 0) {
		return res.status(400).json({ error: 'messages must be a non-empty array' });
	}
	if (messages.length > MAX_MESSAGES) {
		return res.status(400).json({ error: `Too many messages (max ${MAX_MESSAGES})` });
	}

	const sanitized: ChatMessage[] = [];
	for (const m of messages) {
		if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string' || !m.content.trim()) {
			return res.status(400).json({ error: 'Invalid message format' });
		}
		if (m.content.length > MAX_MESSAGE_LENGTH) {
			return res.status(400).json({ error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)` });
		}
		sanitized.push({ role: m.role, content: m.content });
	}

	try {
		const anthropic = getClient();
		const response = await anthropic.messages.create({
			model: MODEL,
			max_tokens: 1024,
			system: SYSTEM_PROMPT,
			thinking: { type: 'adaptive' },
			output_config: { effort: 'low' },
			messages: sanitized,
		});

		if (response.stop_reason === 'refusal') {
			return res.status(200).json({ reply: null, refused: true });
		}

		const textBlock = response.content.find((block) => block.type === 'text');
		const reply = textBlock && textBlock.type === 'text' ? textBlock.text : '';

		return res.status(200).json({ reply });
	} catch (err) {
		console.error('AI chat error:', err);
		return res.status(500).json({ error: 'AI assistant is temporarily unavailable.' });
	}
}
