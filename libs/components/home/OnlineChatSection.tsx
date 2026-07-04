import React, { useEffect, useRef, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import { socketVar, userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { sweetErrorAlert } from '../../sweetAlert';
import Link from 'next/link';
import { useUiLang } from '../../utils/translations';

interface MessagePayload {
	event: string;
	text: string;
	authUser: {
		_id: string;
		firstName: string;
		lastName: string;
		avatar?: string;
	} | null;
}

const OnlineChatSection = () => {
	const ui = useUiLang();
	const socket = useReactiveVar(socketVar);
	const user = useReactiveVar(userVar);

	const [messages, setMessages] = useState<MessagePayload[]>([]);
	const [onlineUsers, setOnlineUsers] = useState(0);
	const [input, setInput] = useState('');
	const [connected, setConnected] = useState(false);

	const listRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!socket) { setConnected(false); return; }

		setConnected(socket.readyState === WebSocket.OPEN);

		const onOpen = () => setConnected(true);
		const onClose = () => setConnected(false);

		socket.onmessage = (e: MessageEvent) => {
			try {
				const data = JSON.parse(e.data);
				if (data.event === 'info') setOnlineUsers(data.totalClients ?? 0);
				else if (data.event === 'getMessages') setMessages(data.list ?? data.messages ?? []);
				else if (data.event === 'message') setMessages((p) => [...p, data]);
			} catch {}
		};

		socket.addEventListener('open', onOpen);
		socket.addEventListener('close', onClose);
		return () => {
			socket.removeEventListener('open', onOpen);
			socket.removeEventListener('close', onClose);
			socket.onmessage = null;
		};
	}, [socket]);

	useEffect(() => {
		if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
	}, [messages]);

	const handleSend = () => {
		if (!input.trim()) { sweetErrorAlert(ui('Please enter a message!')); return; }
		if (!socket || socket.readyState !== WebSocket.OPEN) return;
		socket.send(JSON.stringify({ event: 'message', data: input.trim() }));
		setInput('');
	};

	const getInitials = (authUser: MessagePayload['authUser']) => {
		if (!authUser) return '?';
		return `${authUser.firstName?.[0] ?? ''}${authUser.lastName?.[0] ?? ''}`.toUpperCase();
	};

	const getAvatar = (authUser: MessagePayload['authUser']) => {
		if (!authUser?.avatar) return '';
		return `${REACT_APP_API_URL}/uploads/${authUser.avatar}`;
	};

	const isMe = (authUser: MessagePayload['authUser']) =>
		!!user?._id && authUser?._id === user._id;

	return (
		<section className="home-live-chat">
			<div className="container">
				{/* Left — info */}
				<div className="hlc-left">
					<div className="hlc-badge">
						<span className={`hlc-dot ${connected ? 'live' : 'off'}`} />
						{connected ? ui('Live Now') : ui('Connecting...')}
					</div>
					<h2 className="hlc-title">
						{ui('Community')}<br />
						<span className="hlc-title-accent">{ui('Live Chat')}</span>
					</h2>
					<p className="hlc-desc">
						{ui('Connect with travelers, students, and expats in real time. Ask questions, share experiences, and get instant answers from the GMP community.')}
					</p>
					<div className="hlc-stats">
						<div className="hlc-stat">
							<span className="hlc-stat-num">{onlineUsers}</span>
							<span className="hlc-stat-label">{ui('Online now')}</span>
						</div>
						<div className="hlc-stat-sep" />
						<div className="hlc-stat">
							<span className="hlc-stat-num">{messages.length}</span>
							<span className="hlc-stat-label">{ui('Messages')}</span>
						</div>
					</div>
					{!user?._id && (
						<Link href="/account/join" className="hlc-join-btn">
							{ui('Join to Chat')}
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
								<line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
							</svg>
						</Link>
					)}
				</div>

				{/* Right — chat widget */}
				<div className="hlc-widget">
					{/* Widget header */}
					<div className="hlc-widget-head">
						<div className="hlc-widget-title">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
							</svg>
							{ui('Global Chat')}
						</div>
						<div className="hlc-widget-online">
							<span className="hlc-dot live small" />
							{onlineUsers} {ui('online')}
						</div>
					</div>

					{/* Messages */}
					<div className="hlc-messages" ref={listRef}>
						{messages.length === 0 ? (
							<div className="hlc-empty">
								<p>{ui('No messages yet. Be the first!')} 👋</p>
							</div>
						) : (
							messages.map((msg, idx) => {
								const mine = isMe(msg.authUser);
								const avatarUrl = getAvatar(msg.authUser);
								const initials = getInitials(msg.authUser);
								const name = msg.authUser
									? `${msg.authUser.firstName} ${msg.authUser.lastName}`
									: ui('Guest');

								return (
									<div key={idx} className={`hlc-msg ${mine ? 'mine' : 'theirs'}`}>
										{!mine && (
											<div className="hlc-avatar">
												{avatarUrl
													? <img src={avatarUrl} alt={name} />
													: <span>{initials}</span>}
											</div>
										)}
										<div className="hlc-bubble-wrap">
											{!mine && <span className="hlc-name">{name}</span>}
											<div className={`hlc-bubble ${mine ? 'mine' : 'theirs'}`}>
												{msg.text}
											</div>
										</div>
									</div>
								);
							})
						)}
					</div>

					{/* Input */}
					<div className="hlc-input-row">
						{user?._id ? (
							<>
								<input
									className="hlc-input"
									placeholder={ui('Type a message...')}
									value={input}
									onChange={(e) => setInput(e.target.value)}
									onKeyDown={(e) => e.key === 'Enter' && handleSend()}
									disabled={!connected}
								/>
								<button
									className="hlc-send"
									onClick={handleSend}
									disabled={!connected || !input.trim()}
								>
									<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
										<line x1="22" y1="2" x2="11" y2="13" />
										<polygon points="22 2 15 22 11 13 2 9 22 2" />
									</svg>
								</button>
							</>
						) : (
							<Link href="/account/join" className="hlc-login-prompt">
								{ui('Log in to join the conversation')} →
							</Link>
						)}
					</div>
				</div>
			</div>
		</section>
	);
};

export default OnlineChatSection;
