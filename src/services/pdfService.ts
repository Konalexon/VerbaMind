// PDF Generation Service for VerbaMind
// Uses jsPDF for real PDF generation with Polish character support
import { jsPDF } from 'jspdf';
import type { PDFTemplate } from '../types';
import { RobotoRegular } from './robotoFont';

// Register Roboto font for Polish character support
const registerRobotoFont = (doc: jsPDF) => {
  doc.addFileToVFS('Roboto-Regular.ttf', RobotoRegular);
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
  doc.setFont('Roboto');
};

interface PDFContent {
  title: string;
  text: string;
  author?: string;
  date?: string;
  template: PDFTemplate;
}

// Template configurations
const templateConfigs: Record<PDFTemplate, {
  headerBg: [number, number, number];
  headerText: [number, number, number];
  bodyText: [number, number, number];
  titleSize: number;
  bodySize: number;
  fontStyle: 'helvetica' | 'times' | 'courier';
}> = {
  official: {
    headerBg: [26, 26, 46],
    headerText: [255, 255, 255],
    bodyText: [51, 51, 51],
    titleSize: 24,
    bodySize: 12,
    fontStyle: 'times',
  },
  modern: {
    headerBg: [139, 92, 246],
    headerText: [255, 255, 255],
    bodyText: [51, 51, 51],
    titleSize: 28,
    bodySize: 11,
    fontStyle: 'helvetica',
  },
  minimal: {
    headerBg: [255, 255, 255],
    headerText: [0, 0, 0],
    bodyText: [68, 68, 68],
    titleSize: 20,
    bodySize: 11,
    fontStyle: 'helvetica',
  },
  academic: {
    headerBg: [255, 255, 255],
    headerText: [0, 0, 0],
    bodyText: [0, 0, 0],
    titleSize: 16,
    bodySize: 12,
    fontStyle: 'times',
  },
};

function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = doc.getTextWidth(testLine);

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export async function exportToPDF(content: PDFContent): Promise<void> {
  const config = templateConfigs[content.template];
  const formattedDate = content.date || new Date().toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Create PDF document (A4 format)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Register and set Roboto font for Polish character support
  registerRobotoFont(doc);

  // Draw header background (for official and modern templates)
  if (content.template === 'official' || content.template === 'modern') {
    doc.setFillColor(...config.headerBg);
    doc.rect(0, 0, pageWidth, 50, 'F');

    // Add gradient effect for modern template
    if (content.template === 'modern') {
      doc.setFillColor(6, 182, 212);
      doc.rect(pageWidth - 60, 0, 60, 50, 'F');
    }

    yPosition = 20;
  }

  // Title
  doc.setFontSize(config.titleSize);
  if (content.template === 'official' || content.template === 'modern') {
    doc.setTextColor(...config.headerText);
  } else {
    doc.setTextColor(...config.bodyText);
  }

  const titleLines = wrapText(doc, content.title, contentWidth);
  for (const line of titleLines) {
    if (content.template === 'academic') {
      doc.text(line, pageWidth / 2, yPosition, { align: 'center' });
    } else {
      doc.text(line, margin, yPosition);
    }
    yPosition += config.titleSize * 0.5;
  }

  // Meta info (date, author)
  doc.setFontSize(10);
  if (content.template === 'official' || content.template === 'modern') {
    doc.setTextColor(200, 200, 200);
  } else {
    doc.setTextColor(128, 128, 128);
  }

  const metaText = content.author ? `${content.author} • ${formattedDate}` : formattedDate;
  if (content.template === 'academic') {
    yPosition += 5;
    doc.text(metaText, pageWidth / 2, yPosition, { align: 'center' });
  } else {
    yPosition += 5;
    doc.text(metaText, margin, yPosition);
  }

  // Move past header
  if (content.template === 'official' || content.template === 'modern') {
    yPosition = 65;
  } else {
    yPosition += 20;
  }

  // Body text
  doc.setFontSize(config.bodySize);
  doc.setTextColor(...config.bodyText);

  const paragraphs = content.text.split('\n').filter(p => p.trim());
  const lineHeight = config.bodySize * 0.5;

  for (const paragraph of paragraphs) {
    const lines = wrapText(doc, paragraph.trim(), contentWidth);

    for (const line of lines) {
      // Check if we need a new page
      if (yPosition > pageHeight - margin - 20) {
        doc.addPage();
        yPosition = margin;
      }

      doc.text(line, margin, yPosition, { align: 'justify' });
      yPosition += lineHeight;
    }

    yPosition += lineHeight * 0.5; // Paragraph spacing
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Wygenerowano przez VerbaMind • Strona ${i} z ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Generate filename
  const filename = `${content.title.replace(/[^a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s]/g, '_')}.pdf`;

  // Save PDF
  doc.save(filename);

  // Return success for notification
  return Promise.resolve();
}

// Export for backward compatibility
export function downloadAsHTML(content: PDFContent): void {
  exportToPDF(content);
}
