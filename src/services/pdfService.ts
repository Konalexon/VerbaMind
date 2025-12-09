// PDF Generation Service for VerbaMind
import type { PDFTemplate } from '../types';

interface PDFContent {
    title: string;
    text: string;
    author?: string;
    date?: string;
    template: PDFTemplate;
}

// Template styles
const templateStyles: Record<PDFTemplate, {
    headerBg: string;
    headerText: string;
    bodyBg: string;
    bodyText: string;
    fontFamily: string;
    titleSize: string;
}> = {
    official: {
        headerBg: '#1a1a2e',
        headerText: '#ffffff',
        bodyBg: '#ffffff',
        bodyText: '#333333',
        fontFamily: 'Georgia, serif',
        titleSize: '28px',
    },
    modern: {
        headerBg: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
        headerText: '#ffffff',
        bodyBg: '#fafafa',
        bodyText: '#333333',
        fontFamily: "'Inter', sans-serif",
        titleSize: '32px',
    },
    minimal: {
        headerBg: '#ffffff',
        headerText: '#000000',
        bodyBg: '#ffffff',
        bodyText: '#444444',
        fontFamily: "'Inter', sans-serif",
        titleSize: '24px',
    },
    academic: {
        headerBg: '#ffffff',
        headerText: '#000000',
        bodyBg: '#ffffff',
        bodyText: '#000000',
        fontFamily: "'Times New Roman', Times, serif",
        titleSize: '18px',
    },
};

function generateHTMLContent(content: PDFContent): string {
    const styles = templateStyles[content.template];
    const formattedDate = content.date || new Date().toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const paragraphs = content.text
        .split('\n')
        .filter(p => p.trim())
        .map(p => `<p style="margin-bottom: 1.2em; line-height: 1.8;">${p}</p>`)
        .join('');

    if (content.template === 'modern') {
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { margin: 0; size: A4; }
    body { font-family: ${styles.fontFamily}; background: ${styles.bodyBg}; color: ${styles.bodyText}; }
    .header { background: ${styles.headerBg}; padding: 50px; color: ${styles.headerText}; }
    .title { font-size: ${styles.titleSize}; font-weight: 700; margin-bottom: 10px; }
    .meta { font-size: 14px; opacity: 0.8; }
    .content { padding: 50px; font-size: 12pt; text-align: justify; }
    .footer { position: fixed; bottom: 30px; left: 50px; right: 50px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">${content.title}</div>
    <div class="meta">${content.author ? `${content.author} • ` : ''}${formattedDate}</div>
  </div>
  <div class="content">${paragraphs}</div>
  <div class="footer">Wygenerowano przez VerbaMind • ${formattedDate}</div>
</body>
</html>`;
    }

    if (content.template === 'academic') {
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { margin: 72px; size: A4; }
    body { font-family: ${styles.fontFamily}; background: ${styles.bodyBg}; color: ${styles.bodyText}; font-size: 12pt; line-height: 2; }
    .title { font-size: ${styles.titleSize}; font-weight: 700; text-align: center; margin-bottom: 24px; }
    .author { font-size: 12pt; text-align: center; font-style: italic; margin-bottom: 48px; }
    .content { text-align: justify; text-indent: 24px; }
    .content p { margin-bottom: 0; }
  </style>
</head>
<body>
  <div class="title">${content.title}</div>
  ${content.author ? `<div class="author">${content.author}</div>` : ''}
  <div class="content">${paragraphs}</div>
</body>
</html>`;
    }

    if (content.template === 'minimal') {
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { margin: 80px; size: A4; }
    body { font-family: ${styles.fontFamily}; background: ${styles.bodyBg}; color: ${styles.bodyText}; font-size: 11pt; }
    .title { font-size: ${styles.titleSize}; font-weight: 600; margin-bottom: 60px; }
    .content { line-height: 2; }
  </style>
</head>
<body>
  <div class="title">${content.title}</div>
  <div class="content">${paragraphs}</div>
</body>
</html>`;
    }

    // Official (default)
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { margin: 60px; size: A4; }
    body { font-family: ${styles.fontFamily}; background: ${styles.bodyBg}; color: ${styles.bodyText}; font-size: 12pt; }
    .header { background: ${styles.headerBg}; color: ${styles.headerText}; padding: 40px; margin: -60px -60px 40px -60px; }
    .title { font-size: ${styles.titleSize}; font-weight: 700; margin-bottom: 10px; }
    .meta { font-size: 14px; opacity: 0.7; }
    .content { text-align: justify; line-height: 1.8; }
    .footer { position: fixed; bottom: 40px; left: 60px; right: 60px; font-size: 10px; color: #999; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">${content.title}</div>
    <div class="meta">${content.author ? `${content.author} • ` : ''}${formattedDate}</div>
  </div>
  <div class="content">${paragraphs}</div>
  <div class="footer">Wygenerowano przez VerbaMind</div>
</body>
</html>`;
}

export async function exportToPDF(content: PDFContent): Promise<void> {
    const html = generateHTMLContent(content);

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        throw new Error('Could not open print window. Please allow popups.');
    }

    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for styles and fonts to load
    await new Promise(resolve => setTimeout(resolve, 500));

    // Trigger print dialog (which allows saving as PDF)
    printWindow.print();
}

// Alternative: Generate HTML file for download
export function downloadAsHTML(content: PDFContent): void {
    const html = generateHTMLContent(content);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
