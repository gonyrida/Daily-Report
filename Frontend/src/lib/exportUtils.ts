import { jsPDF } from "jspdf";
import ExcelJS from "exceljs";
import { ResourceRow } from "@/components/ResourceTable";

interface ReportData {
  projectName: string;
  reportDate: Date | undefined;
  weatherAM: string;
  weatherPM: string;
  tempAM: string;
  tempPM: string;
  activityToday: string;
  workPlanNextDay: string;
  managementTeam: ResourceRow[];
  workingTeam: ResourceRow[];
  materials: ResourceRow[];
  machinery: ResourceRow[];
}

const formatDate = (date: Date | undefined): string => {
  if (!date) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const loadImageDataUrl = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas 2D context not available"));
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        resolve(dataUrl);
      };
      img.onerror = (e) => reject(e);
      img.src = src;
    } catch (e) {
      reject(e);
    }
  });
};

export const exportToPDF = async (
  data: ReportData,
  preview: boolean = false
): Promise<string | void> => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;
  // Load logos (public root)
  let leftLogo: string | null = null;
  let rightLogo: string | null = null;
  try {
    leftLogo = await loadImageDataUrl("/cacpm_logo.png");
  } catch (e) {
    leftLogo = null;
  }
  try {
    rightLogo = await loadImageDataUrl("/koica_logo.png");
  } catch (e) {
    rightLogo = null;
  }

  // Title and logos
  const logoHeight = 18; // mm
  const logoWidth = 50; // mm
  const cacpmLogoWidth = 65; // mm (larger for CACPM)
  const cacpmLogoHeight = 24; // mm
  try {
    if (leftLogo) {
      doc.addImage(leftLogo, "PNG", margin, 3, cacpmLogoWidth, cacpmLogoHeight);
    }
  } catch (e) {
    console.warn("Failed to add left logo:", e);
  }
  try {
    if (rightLogo) {
      doc.addImage(
        rightLogo,
        "PNG",
        pageWidth - margin - logoWidth,
        5,
        logoWidth,
        logoHeight
      );
    }
  } catch (e) {
    console.warn("Failed to add right logo:", e);
  }

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("DAILY REPORT", pageWidth / 2, 30, { align: "center" });
  y = 34;

  // doc.setFontSize(10);
  // doc.setFont("helvetica", "normal");
  // doc.text("Construction Project Management", pageWidth / 2, y, {
  //   align: "center",
  // });
  // y += 12;

  // // Project Info
  // doc.setFontSize(12);
  // doc.setFont("helvetica", "bold");
  // doc.text("Project Information", margin, y);
  // y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Project Name: ${data.projectName || "N/A"}`, margin, y);
  y += 6;
  doc.text(`Report Date: ${formatDate(data.reportDate)}`, margin, y);
  y += 6;
  // Weather Summary in the format: Weather: AM Cloudy | PM Cloudy
  const weatherAMDisplay = data.weatherAM || "";
  const weatherPMDisplay = data.weatherPM || "";
  doc.text(
    `Weather      : AM ${weatherAMDisplay}  |  PM ${weatherPMDisplay}`,
    margin,
    y
  );
  y += 6;
  // Temperature Summary in the format: Temperature: AM 28°C | PM 32°C
  const tempAMDisplay = data.tempAM ? `${data.tempAM}°C` : "";
  const tempPMDisplay = data.tempPM ? `${data.tempPM}°C` : "";
  doc.text(
    `Temperature  : AM ${tempAMDisplay}    |  PM ${tempPMDisplay}`,
    margin,
    y
  );
  y += 12;

  // Activity Today and Work Plan side by side
  const colWidth = (contentWidth - 4) / 2; // 2 columns with small gap
  const gap = 2;

  // Headers
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(52, 152, 219); // Blue color
  doc.setTextColor(255, 255, 255); // White text
  doc.rect(margin, y - 4, colWidth, 6, "F");
  doc.rect(margin + colWidth + gap, y - 4, colWidth, 6, "F");
  doc.text("Working Activity Today", margin + 2, y);
  doc.text("Work Plan for Next Day", margin + colWidth + gap + 2, y);
  doc.setTextColor(0, 0, 0); // Reset text color
  y += 8;

  // Content
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const activityLines = doc.splitTextToSize(
    data.activityToday || "N/A",
    colWidth - 4
  );
  const planLines = doc.splitTextToSize(
    data.workPlanNextDay || "N/A",
    colWidth - 4
  );

  const maxLines = Math.max(activityLines.length, planLines.length);
  const lineHeight = 5;

  // Draw content and borders
  const contentHeight = maxLines * lineHeight + 4;
  doc.rect(margin, y - 4, colWidth, contentHeight);
  doc.rect(margin + colWidth + gap, y - 4, colWidth, contentHeight);

  doc.text(activityLines, margin + 2, y);
  doc.text(planLines, margin + colWidth + gap + 2, y);

  y += contentHeight + 8;

  // Check if we need a new page
  if (y > 200) {
    doc.addPage();
    y = 20;
  }

  // Resource Tables - side by side
  const addResourceTablePair = (
    groupTitle: string = "",
    title1: string,
    rows1: ResourceRow[],
    title2: string,
    rows2: ResourceRow[],
    hasUnit = false
  ) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    const tableColWidth = (contentWidth - 2) / 2; // 2 columns with small gap
    const tableGap = 2;
    const leftX = margin;
    const rightX = margin + tableColWidth + tableGap;

    // Group Title with background color (only if provided)
    if (groupTitle) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setFillColor(52, 152, 219); // Blue color
      doc.setTextColor(255, 255, 255); // White text
      doc.rect(leftX, y - 4, contentWidth, 6, "F");
      doc.text(groupTitle, leftX + contentWidth / 2, y, { align: "center" });
      doc.setTextColor(0, 0, 0); // Reset text color
      y += 7;
    }

    // Sub-titles with color
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(52, 152, 219); // Blue color
    doc.setTextColor(255, 255, 255); // White text
    doc.rect(leftX, y - 3, tableColWidth, 5, "F");
    doc.rect(rightX, y - 3, tableColWidth, 5, "F");
    doc.text(title1, leftX + 2, y);
    doc.text(title2, rightX + 2, y);
    doc.setTextColor(0, 0, 0); // Reset text color
    y += 5;

    // Calculate totals for both tables
    let totalPrev1 = 0,
      totalToday1 = 0,
      totalAccum1 = 0;
    let totalPrev2 = 0,
      totalToday2 = 0,
      totalAccum2 = 0;
    rows1.forEach((row) => {
      totalPrev1 += Number(row.prev) || 0;
      totalToday1 += Number(row.today) || 0;
      totalAccum1 += Number(row.accumulated) || 0;
    });
    rows2.forEach((row) => {
      totalPrev2 += Number(row.prev) || 0;
      totalToday2 += Number(row.today) || 0;
      totalAccum2 += Number(row.accumulated) || 0;
    });

    // Column widths for each side-by-side table
    const colWidths = hasUnit ? [38, 15, 12, 12, 12] : [53, 12, 12, 12];

    // Headers text (no background)
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);

    // Headers text
    let x = leftX;
    if (hasUnit) {
      doc.text("Description", x, y);
      x += colWidths[0];
      doc.text("Unit", x, y);
      x += colWidths[1];
      doc.text("Prev", x, y);
      x += colWidths[2];
      doc.text("Today", x, y);
      x += colWidths[3];
      doc.text("Accum", x, y);
    } else {
      doc.text("Description", x, y);
      x += colWidths[0];
      doc.text("Prev", x, y);
      x += colWidths[1];
      doc.text("Today", x, y);
      x += colWidths[2];
      doc.text("Accum", x, y);
    }

    x = rightX;
    if (hasUnit) {
      doc.text("Description", x, y);
      x += colWidths[0];
      doc.text("Unit", x, y);
      x += colWidths[1];
      doc.text("Prev", x, y);
      x += colWidths[2];
      doc.text("Today", x, y);
      x += colWidths[3];
      doc.text("Accum", x, y);
    } else {
      doc.text("Description", x, y);
      x += colWidths[0];
      doc.text("Prev", x, y);
      x += colWidths[1];
      doc.text("Today", x, y);
      x += colWidths[2];
      doc.text("Accum", x, y);
    }
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    // Get max rows for height calculation
    const maxRows = Math.max(rows1.length, rows2.length);
    const rowHeight = 5;
    const padding = 1;

    // Data rows
    for (let i = 0; i < maxRows; i++) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      // Draw row background (alternating light gray)
      if (i % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(leftX, y - 3, tableColWidth, rowHeight, "F");
        doc.rect(rightX, y - 3, tableColWidth, rowHeight, "F");
      }

      // Left table
      if (i < rows1.length) {
        const row = rows1[i];
        x = leftX + padding;
        if (hasUnit) {
          doc.text(row.description.substring(0, 20) || "-", x, y);
          x += colWidths[0];
          doc.text(row.unit || "-", x, y);
          x += colWidths[1];
          doc.text(String(row.prev), x, y);
          x += colWidths[2];
          doc.text(String(row.today), x, y);
          x += colWidths[3];
          doc.text(String(row.accumulated), x, y);
        } else {
          doc.text(row.description.substring(0, 30) || "-", x, y);
          x += colWidths[0];
          doc.text(String(row.prev), x, y);
          x += colWidths[1];
          doc.text(String(row.today), x, y);
          x += colWidths[2];
          doc.text(String(row.accumulated), x, y);
        }
      }

      // Right table
      if (i < rows2.length) {
        const row = rows2[i];
        x = rightX + padding;
        if (hasUnit) {
          doc.text(row.description.substring(0, 20) || "-", x, y);
          x += colWidths[0];
          doc.text(row.unit || "-", x, y);
          x += colWidths[1];
          doc.text(String(row.prev), x, y);
          x += colWidths[2];
          doc.text(String(row.today), x, y);
          x += colWidths[3];
          doc.text(String(row.accumulated), x, y);
        } else {
          doc.text(row.description.substring(0, 30) || "-", x, y);
          x += colWidths[0];
          doc.text(String(row.prev), x, y);
          x += colWidths[1];
          doc.text(String(row.today), x, y);
          x += colWidths[2];
          doc.text(String(row.accumulated), x, y);
        }
      }
      y += rowHeight;
    }

    // Total rows
    doc.setFont("helvetica", "bold");
    doc.setFillColor(200, 200, 200);
    doc.rect(leftX, y - 3, tableColWidth, 4, "F");
    doc.rect(rightX, y - 3, tableColWidth, 4, "F");

    x = leftX;
    if (hasUnit) {
      doc.text("TOTAL", x, y);
      x += colWidths[0];
      doc.text("", x, y);
      x += colWidths[1];
      doc.text(String(totalPrev1), x, y);
      x += colWidths[2];
      doc.text(String(totalToday1), x, y);
      x += colWidths[3];
      doc.text(String(totalAccum1), x, y);
    } else {
      doc.text("TOTAL", x, y);
      x += colWidths[0];
      doc.text(String(totalPrev1), x, y);
      x += colWidths[1];
      doc.text(String(totalToday1), x, y);
      x += colWidths[2];
      doc.text(String(totalAccum1), x, y);
    }

    x = rightX;
    if (hasUnit) {
      doc.text("TOTAL", x, y);
      x += colWidths[0];
      doc.text("", x, y);
      x += colWidths[1];
      doc.text(String(totalPrev2), x, y);
      x += colWidths[2];
      doc.text(String(totalToday2), x, y);
      x += colWidths[3];
      doc.text(String(totalAccum2), x, y);
    } else {
      doc.text("TOTAL", x, y);
      x += colWidths[0];
      doc.text(String(totalPrev2), x, y);
      x += colWidths[1];
      doc.text(String(totalToday2), x, y);
      x += colWidths[2];
      doc.text(String(totalAccum2), x, y);
    }

    y += 8;
  };

  addResourceTablePair(
    "Resources Employeed",
    "Site Management Team",
    data.managementTeam,
    "Site Working Team",
    data.workingTeam,
    false
  );
  addResourceTablePair(
    "",
    "Materials Deliveries",
    data.materials,
    "Machinery & Equipment",
    data.machinery,
    true
  );

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128);
  doc.text(
    `Generated on ${new Date().toLocaleString()}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: "center" }
  );

  // Save
  const fileName = `Daily_Report_${
    data.projectName?.replace(/\s+/g, "_") || "Report"
  }_${formatDate(data.reportDate).replace(/\s+/g, "_")}.pdf`;

  if (preview) {
    // Return blob URL for preview instead of downloading
    const blob = doc.output("blob");
    return URL.createObjectURL(blob);
  } else {
    doc.save(fileName);
  }
};

export const exportToExcel = async (data: ReportData) => {
  // Load the provided Excel template so the export matches the exact layout
  const response = await fetch("/template.xlsx");
  if (!response.ok) {
    throw new Error("Unable to load Excel template");
  }

  const templateBuffer = await response.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(templateBuffer);

  const worksheet = workbook.getWorksheet("REPORT") || workbook.worksheets[0];

  const safeNumber = (value: number | string | undefined) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const cloneStyle = (cell: ExcelJS.Cell) =>
    JSON.parse(JSON.stringify(cell.style || {}));

  const mergeIfNeeded = (range: string) => {
    try {
      worksheet.mergeCells(range);
    } catch {
      // ignore if already merged in template
    }
  };

  const splitIntoRows = (text: string, maxRows: number, maxLen = 55) => {
    if (!text) return Array(maxRows).fill("");

    const lines: string[] = [];
    text.split(/\r?\n/).forEach((rawLine) => {
      const words = rawLine.split(/\s+/);
      let current = "";
      words.forEach((word) => {
        const next = current ? `${current} ${word}` : word;
        if (next.length > maxLen) {
          if (current) lines.push(current);
          current = word;
        } else {
          current = next;
        }
      });
      if (current) lines.push(current);
      if (lines.length >= maxRows) return;
    });

    return Array.from({ length: maxRows }, (_, i) => lines[i] || "");
  };

  const dateValue =
    data.reportDate instanceof Date
      ? data.reportDate
      : data.reportDate
      ? new Date(data.reportDate)
      : undefined;

  // Header info
  worksheet.getCell("B7").value = `Project Name : ${data.projectName || ""}`;
  // Weather Summary in the format: Weather: AM Cloudy | PM Cloudy
  const weatherAMDisplay = data.weatherAM || "";
  const weatherPMDisplay = data.weatherPM || "";
  worksheet.getCell("B8").value = `Weather          : AM ${weatherAMDisplay}  |  PM ${weatherPMDisplay}`;
  // Temperature Summary in the format: Temperature: AM 28°C | PM 32°C
  const tempAMDisplay = data.tempAM ? `${data.tempAM}°C` : "";
  const tempPMDisplay = data.tempPM ? `${data.tempPM}°C` : "";
  worksheet.getCell("B9").value = `Temperature  : AM ${tempAMDisplay}    |  PM ${tempPMDisplay}`;
  const dateCell = worksheet.getCell("I9");
  dateCell.value = dateValue || null;
  if (!dateCell.numFmt) {
    dateCell.numFmt = "yyyy-mm-dd";
  }

  // Activities (10 available rows in the template)
  const activityLines = splitIntoRows(data.activityToday || "", 10);
  const planLines = splitIntoRows(data.workPlanNextDay || "", 10);
  const baseActivityStyle = cloneStyle(worksheet.getCell("B12"));
  const basePlanStyle = cloneStyle(worksheet.getCell("G12"));

  for (let i = 0; i < 10; i++) {
    const row = 12 + i;
    const leftCell = worksheet.getCell(`B${row}`);
    leftCell.style = { ...baseActivityStyle, alignment: { wrapText: true } };
    leftCell.value = activityLines[i] || "";

    const rightCell = worksheet.getCell(`G${row}`);
    rightCell.style = { ...basePlanStyle, alignment: { wrapText: true } };
    rightCell.value = planLines[i] || "";
  }

  // Resource tables (Site Management / Working Team)
  const startTeamRow = 25;
  const baseTeamRows = 6;
  const teamRowsNeeded = Math.max(
    baseTeamRows,
    data.managementTeam.length,
    data.workingTeam.length
  );

  // Insert extra rows if more data than template rows
  if (teamRowsNeeded > baseTeamRows) {
    const rowsToInsert = teamRowsNeeded - baseTeamRows;
    worksheet.spliceRows(startTeamRow + baseTeamRows, 0, ...new Array(rowsToInsert).fill([]));
  }

  const totalRowIndex = startTeamRow + teamRowsNeeded;

  // Preserve cell styles from the first data row
  // Ensure description merges exist for all dynamic rows
  for (let r = startTeamRow; r < totalRowIndex; r++) {
    mergeIfNeeded(`B${r}:C${r}`);
    mergeIfNeeded(`G${r}:H${r}`);
  }

  for (let i = 0; i < teamRowsNeeded; i++) {
    const rowIndex = startTeamRow + i;
    const mgmt = data.managementTeam[i];
    const work = data.workingTeam[i];

    const setCell = (
      address: string,
      value: string | number | null,
      styleCol: string
    ) => {
      const cell = worksheet.getCell(address);
      cell.style = cloneStyle(worksheet.getCell(`${styleCol}${startTeamRow}`));
      cell.value = value ?? "";
    };

    setCell(`B${rowIndex}`, mgmt?.description ?? "", "B");
    setCell(`D${rowIndex}`, safeNumber(mgmt?.prev), "D");
    setCell(`E${rowIndex}`, safeNumber(mgmt?.today), "E");
    const leftAccum = worksheet.getCell(`F${rowIndex}`);
    leftAccum.style = cloneStyle(worksheet.getCell(`F${startTeamRow}`));
    leftAccum.value = { formula: `SUM(D${rowIndex}:E${rowIndex})` };

    setCell(`G${rowIndex}`, work?.description ?? "", "G");
    setCell(`I${rowIndex}`, safeNumber(work?.prev), "I");
    setCell(`J${rowIndex}`, safeNumber(work?.today), "J");
    const rightAccum = worksheet.getCell(`K${rowIndex}`);
    rightAccum.style = cloneStyle(worksheet.getCell(`K${startTeamRow}`));
    rightAccum.value = { formula: `SUM(I${rowIndex}:J${rowIndex})` };
  }

  // Total row (re-merge and re-point formulas)
  mergeIfNeeded(`B${totalRowIndex}:C${totalRowIndex}`);
  mergeIfNeeded(`G${totalRowIndex}:H${totalRowIndex}`);
  const totalRow = worksheet.getRow(totalRowIndex);
  totalRow.getCell("B").value = "TOTAL";
  totalRow.getCell("G").value = "TOTAL";
  totalRow.getCell("D").value = {
    formula: `SUM(D${startTeamRow}:D${totalRowIndex - 1})`,
  };
  totalRow.getCell("E").value = {
    formula: `SUM(E${startTeamRow}:E${totalRowIndex - 1})`,
  };
  totalRow.getCell("F").value = {
    formula: `SUM(F${startTeamRow}:F${totalRowIndex - 1})`,
  };
  totalRow.getCell("I").value = {
    formula: `SUM(I${startTeamRow}:I${totalRowIndex - 1})`,
  };
  totalRow.getCell("J").value = {
    formula: `SUM(J${startTeamRow}:J${totalRowIndex - 1})`,
  };
  totalRow.getCell("K").value = { formula: `SUM(I${totalRowIndex}:J${totalRowIndex})` };

  // Materials & Machinery table
  const materialStartRow = 34; // first row below column headers
  const materialRowsNeeded = Math.max(
    data.materials.length,
    data.machinery.length,
    1
  );

  // Insert extra rows if needed (template has rows up to ~75)
  const availableMaterialRows = worksheet.rowCount - materialStartRow + 1;
  if (materialRowsNeeded > availableMaterialRows) {
    const rowsToInsert = materialRowsNeeded - availableMaterialRows;
    worksheet.spliceRows(materialStartRow + availableMaterialRows, 0, ...new Array(rowsToInsert).fill([]));
  }

  for (let i = 0; i < materialRowsNeeded; i++) {
    const rowIndex = materialStartRow + i;
    const mat = data.materials[i];
    const mach = data.machinery[i];

    const setMatCell = (
      col: string,
      value: string | number | null,
      styleCol: string
    ) => {
      const cell = worksheet.getCell(`${col}${rowIndex}`);
      cell.style = cloneStyle(worksheet.getCell(`${styleCol}${materialStartRow}`));
      cell.value = value ?? "";
    };

    setMatCell("B", mat?.description ?? "", "B");
    setMatCell("C", mat?.unit ?? "", "C");
    setMatCell("D", safeNumber(mat?.prev), "D");
    setMatCell("E", safeNumber(mat?.today), "E");
    const matAccum =
      mat?.accumulated ??
      (mat ? safeNumber(mat.prev) + safeNumber(mat.today) : "");
    setMatCell("F", matAccum, "F");

    setMatCell("G", mach?.description ?? "", "G");
    setMatCell("H", mach?.unit ?? "", "H");
    setMatCell("I", safeNumber(mach?.prev), "I");
    setMatCell("J", safeNumber(mach?.today), "J");
    const machAccum =
      mach?.accumulated ??
      (mach ? safeNumber(mach.prev) + safeNumber(mach.today) : "");
    setMatCell("K", machAccum, "K");
  }

  const fileName = `Daily_Report_${
    data.projectName?.replace(/\s+/g, "_") || "Report"
  }_${formatDate(data.reportDate).replace(/\s+/g, "_")}.xlsx`;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};
