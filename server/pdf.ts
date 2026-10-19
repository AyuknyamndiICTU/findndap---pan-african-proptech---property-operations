import type { FinancialRecord } from '../src/types.js';

// Characters outside Latin-1 that WinAnsiEncoding maps to the 0x80-0x9F range.
const WIN_ANSI_EXTRAS: Record<string, number> = {
  '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87, 'ˆ': 0x88, '‰': 0x89,
  'Š': 0x8a, '‹': 0x8b, 'Œ': 0x8c, 'Ž': 0x8e, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95,
  '–': 0x96, '—': 0x97, '˜': 0x98, '™': 0x99, 'š': 0x9a, '›': 0x9b, 'œ': 0x9c, 'ž': 0x9e, 'Ÿ': 0x9f
};

/** Encodes text as a PDF literal string in WinAnsiEncoding; unsupported characters become "?". */
function pdfString(text: string): Buffer {
  const bytes: number[] = [0x28]; // (
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    let b: number;
    if (code === 0x28 || code === 0x29 || code === 0x5c) {
      bytes.push(0x5c); // escape ( ) and backslash
      b = code;
    } else if ((code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff)) {
      b = code;
    } else if (code === 0x202f || code === 0x00a0) {
      b = 0x20; // narrow/no-break spaces from toLocaleString
    } else {
      b = WIN_ANSI_EXTRAS[ch] ?? 0x3f;
    }
    bytes.push(b);
  }
  bytes.push(0x29); // )
  return Buffer.from(bytes);
}

interface Line {
  text: string;
  x: number;
  y: number;
  size: number;
  bold?: boolean;
}

function buildPdf(lines: Line[], rules: number[]): Buffer {
  const content: Buffer[] = [];
  for (const l of lines) {
    content.push(Buffer.from(`BT /${l.bold ? 'F2' : 'F1'} ${l.size} Tf ${l.x} ${l.y} Td `, 'latin1'));
    content.push(pdfString(l.text));
    content.push(Buffer.from(' Tj ET\n', 'latin1'));
  }
  for (const y of rules) content.push(Buffer.from(`0.6 w 50 ${y} m 545 ${y} l S\n`, 'latin1'));
  const stream = Buffer.concat(content);

  const objects: Buffer[] = [
    Buffer.from('<< /Type /Catalog /Pages 2 0 R >>'),
    Buffer.from('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),
    Buffer.from('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>'),
    Buffer.from('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'),
    Buffer.from('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'),
    Buffer.concat([Buffer.from(`<< /Length ${stream.length} >>\nstream\n`), stream, Buffer.from('\nendstream')])
  ];

  const parts: Buffer[] = [Buffer.from('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n', 'latin1')];
  const offsets: number[] = [];
  let length = parts[0].length;
  objects.forEach((body, i) => {
    offsets.push(length);
    const obj = Buffer.concat([Buffer.from(`${i + 1} 0 obj\n`), body, Buffer.from('\nendobj\n')]);
    parts.push(obj);
    length += obj.length;
  });

  const xref = [
    'xref',
    `0 ${objects.length + 1}`,
    '0000000000 65535 f ',
    ...offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n `),
    'trailer',
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    'startxref',
    String(length),
    '%%EOF'
  ].join('\n');
  parts.push(Buffer.from(xref + '\n', 'latin1'));
  return Buffer.concat(parts);
}

const LABELS = {
  en: {
    title: 'Official Rent Payment Receipt',
    receiptNo: 'Receipt No.',
    reference: 'Gateway Reference',
    date: 'Payment Date',
    tenant: 'Tenant',
    property: 'Property',
    unit: 'Unit',
    method: 'Payment Method',
    status: 'Status',
    amount: 'Amount Paid',
    issued: 'Issued electronically by FindNdap on',
    footer: 'This receipt is valid without signature. Keep it as proof of payment.'
  },
  fr: {
    title: 'Reçu officiel de paiement de loyer',
    receiptNo: 'N° de reçu',
    reference: 'Référence opérateur',
    date: 'Date du paiement',
    tenant: 'Locataire',
    property: 'Propriété',
    unit: 'Logement',
    method: 'Moyen de paiement',
    status: 'Statut',
    amount: 'Montant payé',
    issued: 'Émis électroniquement par FindNdap le',
    footer: 'Ce reçu est valable sans signature. Conservez-le comme preuve de paiement.'
  }
};

export function buildReceiptPdf(tx: FinancialRecord, lang: 'en' | 'fr' = 'en'): Buffer {
  const t = LABELS[lang];
  const locale = lang === 'fr' ? 'fr-FR' : 'en-GB';
  const parsed = Date.parse(tx.date);
  const paidOn = Number.isNaN(parsed) ? tx.date : new Date(parsed).toLocaleString(locale, { dateStyle: 'long', timeStyle: 'short' });
  const amount = `${tx.amountXAF.toLocaleString(locale)} XAF`;

  const rows: [string, string][] = [
    [t.receiptNo, tx.id],
    [t.reference, tx.txRef],
    [t.date, paidOn],
    [t.tenant, tx.tenantName],
    [t.property, tx.buildingName],
    [t.unit, tx.unitNumber],
    [t.method, tx.method],
    [t.status, tx.status]
  ];

  const lines: Line[] = [
    { text: 'FindNdap', x: 50, y: 780, size: 24, bold: true },
    { text: t.title, x: 50, y: 752, size: 14 }
  ];
  let y = 700;
  for (const [label, value] of rows) {
    lines.push({ text: label, x: 50, y, size: 11 });
    lines.push({ text: value, x: 220, y, size: 11, bold: true });
    y -= 26;
  }
  const amountY = y - 20;
  lines.push({ text: t.amount, x: 50, y: amountY, size: 14, bold: true });
  lines.push({ text: amount, x: 220, y: amountY, size: 14, bold: true });
  lines.push({
    text: `${t.issued} ${new Date().toLocaleString(locale, { dateStyle: 'long', timeStyle: 'short' })}.`,
    x: 50,
    y: amountY - 60,
    size: 9
  });
  lines.push({ text: t.footer, x: 50, y: amountY - 75, size: 9 });

  return buildPdf(lines, [735, amountY + 25, amountY - 15]);
}
