import React, { useEffect, useRef, useState } from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { useUiLang } from '../../utils/translations';

interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

const AiSearchAssistant = () => {
	const ui = useUiLang();
	const [open, setOpen] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);

	const bodyRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (bodyRef.current) {
			bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
		}
	}, [messages, loading]);

	const handleSend = async () => {
		const text = input.trim();
		if (!text || loading) return;

		const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
		setMessages(nextMessages);
		setInput('');
		setError(false);
		setLoading(true);

		try {
			const res = await fetch('/api/ai/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: nextMessages }),
			});

			if (!res.ok) throw new Error('request_failed');

			const data = await res.json();
			const reply = data?.reply as string | null;

			if (!reply) throw new Error('empty_reply');

			setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
		} catch {
			setError(true);
		} finally {
			setLoading(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') handleSend();
	};

	return (
		<>
			<button
				type="button"
				className="ai-assist-btn"
				onClick={() => setOpen(true)}
				title={ui('ai.askAi')}
			>
				<AutoAwesomeIcon />
				<span>AI</span>
			</button>

			{open && (
				<div className="ai-assist-overlay" onClick={() => setOpen(false)}>
					<div className="ai-assist-modal" onClick={(e) => e.stopPropagation()}>
						<div className="ai-assist-header">
							<span>
								<AutoAwesomeIcon /> {ui('ai.aIAssistant')}
							</span>
							<button type="button" className="ai-assist-close" onClick={() => setOpen(false)} aria-label={ui('admin.close')}>
								<CloseIcon />
							</button>
						</div>

						<div className="ai-assist-body" ref={bodyRef}>
							{messages.length === 0 && (
								<div className="ai-assist-empty">
									<span className="ai-empty-icon"><ChatBubbleOutlineIcon /></span>
									<p>{ui('ai.hiAskMeAnythingAbout')}</p>
								</div>
							)}

							{messages.map((msg, idx) => (
								<div key={idx} className={msg.role === 'user' ? 'ai-msg-user' : 'ai-msg-bot'}>
									{msg.content}
								</div>
							))}

							{loading && (
								<div className="ai-msg-bot ai-msg-loading">
									<span className="ai-typing-dot" />
									<span className="ai-typing-dot" />
									<span className="ai-typing-dot" />
								</div>
							)}
							{error && <div className="ai-assist-error">{ui('ai.somethingWentWrongPleaseTry')}</div>}
						</div>

						<div className="ai-assist-footer">
							<input
								type="text"
								placeholder={ui('ai.askAboutVisasAgenciesOr')}
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={handleKeyDown}
								disabled={loading}
							/>
							<button type="button" onClick={handleSend} disabled={loading || !input.trim()}>
								<SendIcon />
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default AiSearchAssistant;
