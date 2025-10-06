import jsPDF from 'jspdf';

export interface BrandDNAData {
  brand_name: string;
  niche: string;
  industry: string;
  target_audience: any;
  customer_avatar: string;
  brand_voice: string[];
  tone_attributes: any;
  writing_style: string;
  mission_statement: string;
  value_proposition: string;
  key_messages: string[];
  brand_values: string[];
  content_pillars: string[];
  topics_to_avoid: string[];
  preferred_formats: string[];
  content_goals: string[];
}

export function generateBrandDNAPDF(data: BrandDNAData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Cover Page
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text('Brand DNA', pageWidth / 2, 80, { align: 'center' });
  doc.setFontSize(24);
  doc.text(data.brand_name || 'Your Brand', pageWidth / 2, 110, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 140, { align: 'center' });

  // Page 2: Overview
  doc.addPage();
  yPos = 20;
  doc.setTextColor(0, 0, 0);
  addSection(doc, 'Brand Overview', yPos);
  yPos += 15;
  addField(doc, 'Brand Name', data.brand_name, yPos);
  yPos += 12;
  addField(doc, 'Niche', data.niche, yPos);
  yPos += 12;
  addField(doc, 'Industry', data.industry, yPos);
  yPos += 20;

  // Target Audience
  if (yPos > 240) { doc.addPage(); yPos = 20; }
  addSection(doc, 'Target Audience', yPos);
  yPos += 15;
  if (typeof data.target_audience === 'object') {
    Object.entries(data.target_audience).forEach(([key, value]) => {
      if (yPos > 270) { doc.addPage(); yPos = 20; }
      addField(doc, key.replace(/_/g, ' ').toUpperCase(), String(value), yPos);
      yPos += 12;
    });
  }

  // Brand Voice
  doc.addPage();
  yPos = 20;
  addSection(doc, 'Brand Voice & Tone', yPos);
  yPos += 15;
  if (data.brand_voice?.length > 0) {
    addList(doc, 'Voice Characteristics', data.brand_voice, yPos);
    yPos += (data.brand_voice.length * 8) + 15;
  }
  if (data.writing_style) {
    if (yPos > 240) { doc.addPage(); yPos = 20; }
    addField(doc, 'Writing Style', data.writing_style, yPos, true);
    yPos += 30;
  }

  // Messaging
  if (yPos > 200) { doc.addPage(); yPos = 20; }
  addSection(doc, 'Messaging Framework', yPos);
  yPos += 15;
  if (data.mission_statement) {
    addField(doc, 'Mission', data.mission_statement, yPos, true);
    yPos += 25;
  }
  if (data.value_proposition) {
    if (yPos > 240) { doc.addPage(); yPos = 20; }
    addField(doc, 'Value Proposition', data.value_proposition, yPos, true);
    yPos += 25;
  }

  // Content Strategy
  doc.addPage();
  yPos = 20;
  addSection(doc, 'Content Strategy', yPos);
  yPos += 15;
  if (data.content_pillars?.length > 0) {
    addList(doc, 'Content Pillars', data.content_pillars, yPos);
    yPos += (data.content_pillars.length * 8) + 15;
  }
  if (data.preferred_formats?.length > 0) {
    if (yPos > 200) { doc.addPage(); yPos = 20; }
    addList(doc, 'Preferred Formats', data.preferred_formats, yPos);
  }

  return doc;
}

function addSection(doc: jsPDF, title: string, y: number) {
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(99, 102, 241);
  doc.text(title, 20, y);
  doc.setDrawColor(99, 102, 241);
  doc.line(20, y + 2, 190, y + 2);
}

function addField(doc: jsPDF, label: string, value: string, y: number, multiline = false) {
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(label + ':', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  if (multiline) {
    const lines = doc.splitTextToSize(value, 150);
    doc.text(lines, 20, y + 6);
  } else {
    doc.text(value, 70, y);
  }
}

function addList(doc: jsPDF, title: string, items: string[], y: number) {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title + ':', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  items.forEach((item, i) => {
    doc.text('• ' + item, 25, y + 8 + (i * 8));
  });
}
