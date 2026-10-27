import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { toCsv } from "@/lib/csv";
import { STATUS_LABEL } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import type { DepartmentSummary } from "./queries";

export function summaryToCsv(summary: DepartmentSummary) {
  return toCsv([
    ["Name", "USN", "Semester", "Section", "Mentor", "Status", "Completion %", "Sessions"],
    ...summary.rows.map((r) => [r.name, r.usn, r.semester, r.section, r.mentor ?? "Unassigned", STATUS_LABEL[r.status], r.completion, r.sessions]),
  ]);
}

const NAVY = rgb(13 / 255, 59 / 255, 102 / 255);
const A4: [number, number] = [595, 842];
const MARGIN = 40;

/** The standard PDF fonts only cover Latin-1: thin spaces become spaces, other characters become "?". */
const safe = (text: string) =>
  [...text]
    .map((ch) => {
      const code = ch.codePointAt(0)!;
      if (code === 0x2009 || code === 0x202f) return " ";
      return (code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) ? ch : "?";
    })
    .join("");

/** Builds a simple A4 department report with summary figures, workload and the mentee list. */
export async function summaryToPdf(summary: DepartmentSummary, generatedFor: string) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage(A4);
  let y = A4[1] - MARGIN;

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN) {
      page = pdf.addPage(A4);
      y = A4[1] - MARGIN;
    }
  };
  const write = (text: string, opts: { size?: number; f?: PDFFont; x?: number; p?: PDFPage } = {}) => {
    (opts.p ?? page).drawText(safe(text), { x: opts.x ?? MARGIN, y, size: opts.size ?? 10, font: opts.f ?? font, color: NAVY });
  };
  const table = (headers: string[], widths: number[], rows: (string | number)[][]) => {
    const drawRow = (cells: (string | number)[], f: PDFFont) => {
      ensureSpace(16);
      let x = MARGIN;
      cells.forEach((cell, i) => {
        let text = safe(String(cell));
        while (text.length > 1 && f.widthOfTextAtSize(text, 9) > widths[i] - 4) text = text.slice(0, -1);
        page.drawText(text, { x, y, size: 9, font: f, color: NAVY });
        x += widths[i];
      });
      y -= 14;
    };
    drawRow(headers, bold);
    page.drawLine({ start: { x: MARGIN, y: y + 10 }, end: { x: A4[0] - MARGIN, y: y + 10 }, thickness: 0.5, color: NAVY });
    rows.forEach((r) => drawRow(r, font));
    y -= 8;
  };

  write(`Department mentoring summary - ${summary.department}`, { size: 16, f: bold });
  y -= 18;
  write(`Generated ${formatDateTime(new Date())} for ${generatedFor}`, { size: 9 });
  y -= 24;

  const t = summary.totals;
  write("Key figures", { size: 12, f: bold });
  y -= 16;
  table(
    ["Mentees", "Mentors", "Endorsed", "Submitted", "Changes req.", "Draft", "Sessions", "Avg. completion"],
    [64, 64, 64, 64, 72, 50, 58, 79],
    [[t.mentees, t.mentors, t.endorsed, t.submitted, t.changesRequested, t.draft, t.sessions, `${t.averageCompletion}%`]],
  );

  write("Mentor workload", { size: 12, f: bold });
  y -= 16;
  table(
    ["Mentor", "Mentees", "Sessions", "Notes", "Recommendations"],
    [195, 75, 75, 75, 95],
    summary.workload.map((w) => [w.name, w.mentees, w.sessions, w.notes, w.recommendations]),
  );

  write("Mentees", { size: 12, f: bold });
  y -= 16;
  table(
    ["Name", "USN", "Sem", "Mentor", "Status", "Done", "Sessions"],
    [115, 78, 28, 105, 95, 40, 54],
    summary.rows.map((r) => [r.name, r.usn, r.semester ?? "-", r.mentor ?? "Unassigned", STATUS_LABEL[r.status], `${r.completion}%`, r.sessions]),
  );

  return pdf.save();
}
