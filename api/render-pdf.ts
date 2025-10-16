// api/render-pdf.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import PDFDocument from 'pdfkit';

type Meal = { meal_type: 'breakfast'|'lunch'|'dinner'|'snack'; title: string; kcal: number };
type DayPlan = { date: string; meals: Meal[] };
type Plan = {
  days: number;
  client_name: string;
  diet_style: string;
  target_kcal: number;
  days_plan: DayPlan[];
  shopping_list?: { qty: string; unit: string; item: string }[];
  recipes?: any[];
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const plan = req.body as Plan | undefined;
  if (!plan || !Array.isArray(plan.days_plan)) {
    return res.status(400).json({ error: 'Invalid plan payload' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="meal-plan.pdf"');

  const doc = new PDFDocument({ size: 'LETTER', margin: 50 });

  // Stream PDF to response
  doc.pipe(res);

  // Cover
  doc
    .fontSize(26)
    .fillColor('#111111')
    .text(`${plan.client_name} — ${plan.diet_style} Plan`, { align: 'left' });
  doc.moveDown(0.5);
  doc
    .fontSize(14)
    .fillColor('#444444')
    .text(`Duration: ${plan.days} days`, { continued: true })
    .text(`   •   Target: ${plan.target_kcal} kcal/day`);
  doc.moveDown(0.5);
  doc
    .moveTo(50, doc.y + 5)
    .lineTo(562, doc.y + 5)
    .lineWidth(2)
    .stroke('#E6B325');
  doc.moveDown(1.2);

  // Weekly view
  plan.days_plan.forEach((d, idx) => {
    doc.fontSize(16).fillColor('#111').text(formatDate(d.date));
    doc.moveDown(0.25);

    d.meals.forEach((m) => {
      doc
        .fontSize(12)
        .fillColor('#333')
        .text(`• ${capitalize(m.meal_type)} — ${m.title} (${m.kcal} kcal)`);
    });

    if (idx !== plan.days_plan.length - 1) {
      doc.moveDown(0.5);
      doc
        .moveTo(50, doc.y + 6)
        .lineTo(562, doc.y + 6)
        .lineWidth(1)
        .stroke('#EEEEEE');
      doc.moveDown(0.8);
    } else {
      doc.moveDown(1);
    }
  });

  // Shopping list
  if (plan.shopping_list && plan.shopping_list.length > 0) {
    doc.addPage();
    doc.fontSize(20).fillColor('#111').text('Shopping List');
    doc.moveDown(0.5);
    plan.shopping_list.forEach((it) => {
      doc.fontSize(12).fillColor('#333').text(`• ${it.qty} ${it.unit} ${it.item}`);
    });
  }

  doc.end();
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}