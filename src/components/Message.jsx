import React from 'react';
import { marked } from 'marked';
import { User, Bot } from 'lucide-react';

// Configure marked to open links in new tabs safely
marked.use({
    renderer: {
        link({ href, title, text }) {
            // Failsafe: if the link is broken (e.g., id=undefined), return just the text
            if (href.includes('undefined')) return text;
            return `<a href="${href}" target="_blank" rel="noopener noreferrer" title="${title || ''}">${text}</a>`;
        }
    }
});

export default function Message({ text, sender }) {
    const isUser = sender === 'user';

    // Parse markdown if the message is from AI
    const createMarkup = () => {
        if (isUser) return { __html: text };

        let processedText = text;

        // 1. Handle broken links: [Name](...id=undefined) -> just Name
        processedText = processedText.replace(/\[([^\]]+)\]\([^)]*id=undefined[^)]*\)/g, '$1');

        // 2. Remove "undefined" from text, but AVOID touching content inside parentheses (likely URLs)
        // This looks for "undefined" when it's NOT inside (...) 
        // A simple way is to match strings that aren't parts of a link.
        processedText = processedText.replace(/(\bundefined\b)(?![^()]*\))/gi, '');

        // 3. Clean up horizontal spaces but PRESERVE newlines
        // Only collapse 2+ spaces into 1 space
        processedText = processedText.replace(/[ \t]{2,}/g, ' ');
        // Collapse 3+ newlines into 2 to keep it neat but spacious
        processedText = processedText.replace(/\n{3,}/g, '\n\n');

        processedText = processedText.trim();

        // Configure a local renderer for this parse call to be safe
        const renderer = new marked.Renderer();
        renderer.link = ({ href, title, text }) => {
            // Failsafe: if for some reason the href still has 'undefined', just show the text
            if (href && href.includes('undefined')) return text;

            return `<a href="${href || '#'}" target="_blank" rel="noopener noreferrer" title="${title || ''}">${text}</a>`;
        };

        return { __html: marked.parse(processedText, { renderer, breaks: true, gfm: true }) };
    };

    return (
        <div className={`message-wrapper ${sender}`}>
            {!isUser && (
                <div className="avatar ai">
                    <Bot size={20} />
                </div>
            )}

            <div className="message-bubble">
                {isUser ? (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>
                ) : (
                    <div dangerouslySetInnerHTML={createMarkup()} />
                )}
            </div>

            {isUser && (
                <div className="avatar user" style={{ backgroundColor: '#444746' }}>
                    <User size={20} color="#e3e3e3" />
                </div>
            )}
        </div>
    );
}
