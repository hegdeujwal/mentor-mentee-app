import { describe, expect, it } from "vitest";
import { csvToRecords, parseCsv, toCsv } from "@/lib/csv";

describe("parseCsv", () => {
  it("handles quoted fields with commas, quotes and line breaks", () => {
    const rows = parseCsv('a,b,c\r\n"x, y","say ""hi""","line1\nline2"\n');
    expect(rows).toEqual([
      ["a", "b", "c"],
      ["x, y", 'say "hi"', "line1\nline2"],
    ]);
  });

  it("skips blank lines and strips a byte-order mark", () => {
    const bom = String.fromCharCode(0xfeff);
    expect(parseCsv(`${bom}a,b\n\n1,2\n`)).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
});

describe("csvToRecords", () => {
  it("maps rows to lower-case header keys and trims values", () => {
    expect(csvToRecords("Name, Email\n Asha , asha@example.edu\n")).toEqual([{ name: "Asha", email: "asha@example.edu" }]);
  });

  it("returns an empty list for an empty file", () => {
    expect(csvToRecords("")).toEqual([]);
  });
});

describe("toCsv", () => {
  it("quotes values that need it", () => {
    expect(toCsv([["a,b", 'he said "x"', null]])).toBe('"a,b","he said ""x""",\r\n');
  });

  it("neutralises spreadsheet formula injection", () => {
    expect(toCsv([["=HYPERLINK(1)", "+1", "-2", "@x"]])).toBe("'=HYPERLINK(1),'+1,'-2,'@x\r\n");
  });
});
