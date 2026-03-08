import { Message } from '@/components/ChatMessage';

export const exportAsMarkdown = (messages: Message[], title?: string) => {
  const now = new Date().toLocaleString();
  let md = `# ${title || 'AdiGon AI Conversation'}\n\n_Exported on ${now}_\n\n---\n\n`;

  messages.forEach((msg) => {
    const role = msg.role === 'user' ? '**You**' : '**AdiGon AI**';
    const text = msg.parts.map(p => p.text).join('\n');
    md += `### ${role}\n\n${text}\n\n`;
    if (msg.imageUrl) md += `![Image](${msg.imageUrl})\n\n`;
    md += '---\n\n';
  });

  const blob = new Blob([md], { type: 'text/markdown' });
  downloadBlob(blob, `${title || 'conversation'}.md`);
};

export const exportAsPDF = (messages: Message[], title?: string) => {
  const now = new Date().toLocaleString();
  const styles = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1a1a; }
    h1 { font-size: 24px; border-bottom: 2px solid #e5e5e5; padding-bottom: 12px; }
    .meta { color: #666; font-size: 12px; margin-bottom: 32px; }
    .message { margin-bottom: 24px; padding: 16px; border-radius: 12px; }
    .user { background: #f0f0f0; }
    .model { background: #fff; border: 1px solid #e5e5e5; }
    .role { font-weight: 700; font-size: 13px; margin-bottom: 8px; color: #333; text-transform: uppercase; letter-spacing: 0.5px; }
    .text { font-size: 14px; line-height: 1.7; white-space: pre-wrap; }
    pre { background: #f5f5f5; padding: 12px; border-radius: 8px; overflow-x: auto; font-size: 13px; }
    code { font-family: 'SF Mono', Monaco, monospace; }
    img { max-width: 100%; border-radius: 8px; }
  `;

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title || 'Conversation'}</title><style>${styles}</style></head><body>`;
  html += `<h1>${title || 'AdiGon AI Conversation'}</h1><p class="meta">Exported on ${now}</p>`;

  messages.forEach((msg) => {
    const role = msg.role === 'user' ? 'You' : 'AdiGon AI';
    const text = msg.parts.map(p => p.text).join('\n')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    html += `<div class="message ${msg.role}"><div class="role">${role}</div><div class="text">${text}</div>`;
    if (msg.imageUrl) html += `<img src="${msg.imageUrl}" alt="attachment">`;
    html += `</div>`;
  });

  html += `</body></html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
