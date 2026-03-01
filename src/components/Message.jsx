import React from 'react';
import { marked } from 'marked';
import { User } from 'lucide-react';
import mascotIconChatUrl from '../../asset/maskot-icon-chat.png';

marked.use({
    renderer: {
        link({ href, title, text }) {
            if (href.includes('undefined')) return text;
            return `<a href="${href}" target="_blank" rel="noopener noreferrer" title="${title || ''}">${text}</a>`;
        }
    }
});

export default function Message({ text, sender }) {
    const isUser = sender === 'user';

    const createMarkup = () => {
        if (isUser) return { __html: text };

        let processedText = text;
        processedText = processedText.replace(/\[([^\]]+)\]\([^)]*id=undefined[^)]*\)/g, '$1');
        processedText = processedText.replace(/(\bundefined\b)(?![^()]*\))/gi, '');
        processedText = processedText.replace(/[ \t]{2,}/g, ' ');
        processedText = processedText.replace(/\n{3,}/g, '\n\n');
        processedText = processedText.trim();

        const renderer = new marked.Renderer();
        renderer.link = ({ href, title, text }) => {
            if (href && href.includes('undefined')) return text;
            return `<a href="${href || '#'}" target="_blank" rel="noopener noreferrer" title="${title || ''}">${text}</a>`;
        };

        return { __html: marked.parse(processedText, { renderer, breaks: true, gfm: true }) };
    };

    return (
        <div className={`message-wrapper ${sender}`}>
            {!isUser && (
                <div className="avatar ai">
                    <img src={mascotIconChatUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="bot" />
                </div>
            )}

            <div className="message-bubble">
                {isUser ? (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>
                ) : (
                    <div dangerouslySetInnerHTML={createMarkup()} />
                )}
            </div>
        </div>
    );
}
