import { jsPDF } from "jspdf";
import ExcelJS from "exceljs";
import { ResourceRow } from "@/components/ResourceTable";

interface ReportData {
  projectName: string;
  reportDate: Date | undefined;
  weather: string;
  weatherPeriod: "AM" | "PM";
  temperature: string;
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
  doc.text(
    `Weather (${data.weatherPeriod}): ${data.weather} ${
      data.temperature ? `(${data.temperature}°C)` : ""
    }`,
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
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Daily Report");

  // Load logos
  let leftLogoBuffer: ArrayBuffer | null = null;
  let rightLogoBuffer: ArrayBuffer | null = null;
  try {
    const leftLogoDataUrl = await loadImageDataUrl("/cacpm_logo.png");
    const leftResponse = await fetch(leftLogoDataUrl);
    leftLogoBuffer = await leftResponse.arrayBuffer();
  } catch (e) {
    console.warn("Failed to load left logo:", e);
  }
  try {
    const rightLogoDataUrl = await loadImageDataUrl("/koica_logo.png");
    const rightResponse = await fetch(rightLogoDataUrl);
    rightLogoBuffer = await rightResponse.arrayBuffer();
  } catch (e) {
    console.warn("Failed to load right logo:", e);
  }

  // Add logos
  if (leftLogoBuffer) {
    const leftImageId = workbook.addImage({
      buffer: leftLogoBuffer,
      extension: "png",
    });
    worksheet.addImage(leftImageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 180, height: 50 },
    });
  }
  if (rightLogoBuffer) {
    const rightImageId = workbook.addImage({
      buffer: rightLogoBuffer,
      extension: "png",
    });
    worksheet.addImage(rightImageId, {
      tl: { col: 8, row: 0 },
      ext: { width: 120, height: 40 },
    });
  }

  let currentRow = 3;

  // Title
  const titleRow = worksheet.getRow(currentRow);
  titleRow.getCell(1).value = "DAILY REPORT";
  titleRow.getCell(1).font = { size: 20, bold: true };
  titleRow.getCell(1).alignment = { horizontal: "center" };
  worksheet.mergeCells(currentRow, 1, currentRow, 10);
  currentRow += 2;

  // Project Information
  const projectHeaderRow = worksheet.getRow(currentRow);
  projectHeaderRow.getCell(1).value = "Project Information";
  projectHeaderRow.getCell(1).font = { bold: true };
  worksheet.mergeCells(currentRow, 1, currentRow, 10);
  currentRow++;

  worksheet.getRow(currentRow).getCell(1).value = `Project Name: ${
    data.projectName || "N/A"
  }`;
  currentRow++;
  worksheet.getRow(currentRow).getCell(1).value = `Report Date: ${formatDate(
    data.reportDate
  )}`;
  currentRow++;
  worksheet.getRow(currentRow).getCell(1).value = `Weather (${
    data.weatherPeriod
  }): ${data.weather} ${data.temperature ? `(${data.temperature}°C)` : ""}`;
  currentRow += 2;

  // Activities side by side with blue headers
  const activityHeaderRow = worksheet.getRow(currentRow);
  activityHeaderRow.getCell(1).value = "Working Activity Today";
  activityHeaderRow.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF3498DB" },
  };
  activityHeaderRow.getCell(1).font = {
    color: { argb: "FFFFFFFF" },
    bold: true,
  };
  activityHeaderRow.getCell(6).value = "Work Plan for Next Day";
  activityHeaderRow.getCell(6).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF3498DB" },
  };
  activityHeaderRow.getCell(6).font = {
    color: { argb: "FFFFFFFF" },
    bold: true,
  };
  worksheet.mergeCells(currentRow, 1, currentRow, 5);
  worksheet.mergeCells(currentRow, 6, currentRow, 10);
  currentRow++;

  const activityContentRow = worksheet.getRow(currentRow);
  activityContentRow.getCell(1).value = data.activityToday || "N/A";
  activityContentRow.getCell(6).value = data.workPlanNextDay || "N/A";
  worksheet.mergeCells(currentRow, 1, currentRow, 5);
  worksheet.mergeCells(currentRow, 6, currentRow, 10);
  currentRow += 2;

  // Resources Employed header
  const resourcesHeaderRow = worksheet.getRow(currentRow);
  resourcesHeaderRow.getCell(1).value = "Resources Employed";
  resourcesHeaderRow.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF3498DB" },
  };
  resourcesHeaderRow.getCell(1).font = {
    color: { argb: "FFFFFFFF" },
    bold: true,
  };
  resourcesHeaderRow.getCell(1).alignment = { horizontal: "center" };
  worksheet.mergeCells(currentRow, 1, currentRow, 10);
  currentRow += 2;

  // Management Team and Working Team side by side
  const maxTeamRows = Math.max(
    data.managementTeam.length,
    data.workingTeam.length
  );

  // Sub-headers with blue background
  const teamSubHeaderRow = worksheet.getRow(currentRow);
  teamSubHeaderRow.getCell(1).value = "Site Management Team";
  teamSubHeaderRow.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF3498DB" },
  };
  teamSubHeaderRow.getCell(1).font = {
    color: { argb: "FFFFFFFF" },
    bold: true,
  };
  teamSubHeaderRow.getCell(6).value = "Site Working Team";
  teamSubHeaderRow.getCell(6).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF3498DB" },
  };
  teamSubHeaderRow.getCell(6).font = {
    color: { argb: "FFFFFFFF" },
    bold: true,
  };
  worksheet.mergeCells(currentRow, 1, currentRow, 5);
  worksheet.mergeCells(currentRow, 6, currentRow, 10);
  currentRow++;

  // Column headers
  const teamColumnHeaderRow = worksheet.getRow(currentRow);
  teamColumnHeaderRow.getCell(1).value = "Description";
  teamColumnHeaderRow.getCell(2).value = "Prev";
  teamColumnHeaderRow.getCell(3).value = "Today";
  teamColumnHeaderRow.getCell(4).value = "Accum";
  teamColumnHeaderRow.getCell(6).value = "Description";
  teamColumnHeaderRow.getCell(7).value = "Prev";
  teamColumnHeaderRow.getCell(8).value = "Today";
  teamColumnHeaderRow.getCell(9).value = "Accum";
  teamColumnHeaderRow.font = { bold: true };
  currentRow++;

  // Data rows with alternating colors
  for (let i = 0; i < maxTeamRows; i++) {
    const row = worksheet.getRow(currentRow);
    const mgmt = data.managementTeam[i] || {
      description: "",
      prev: "",
      today: "",
      accumulated: "",
    };
    const work = data.workingTeam[i] || {
      description: "",
      prev: "",
      today: "",
      accumulated: "",
    };

    row.getCell(1).value = mgmt.description || "";
    row.getCell(2).value = mgmt.prev || "";
    row.getCell(3).value = mgmt.today || "";
    row.getCell(4).value = mgmt.accumulated || "";
    row.getCell(6).value = work.description || "";
    row.getCell(7).value = work.prev || "";
    row.getCell(8).value = work.today || "";
    row.getCell(9).value = work.accumulated || "";

    if (i % 2 === 0) {
      for (let col = 1; col <= 10; col++) {
        row.getCell(col).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF5F5F5" },
        };
      }
    }
    currentRow++;
  }

  // Totals for teams
  const mgmtTotalPrev = data.managementTeam.reduce(
    (sum, row) => sum + (Number(row.prev) || 0),
    0
  );
  const mgmtTotalToday = data.managementTeam.reduce(
    (sum, row) => sum + (Number(row.today) || 0),
    0
  );
  const mgmtTotalAccum = data.managementTeam.reduce(
    (sum, row) => sum + (Number(row.accumulated) || 0),
    0
  );
  const workTotalPrev = data.workingTeam.reduce(
    (sum, row) => sum + (Number(row.prev) || 0),
    0
  );
  const workTotalToday = data.workingTeam.reduce(
    (sum, row) => sum + (Number(row.today) || 0),
    0
  );
  const workTotalAccum = data.workingTeam.reduce(
    (sum, row) => sum + (Number(row.accumulated) || 0),
    0
  );

  const teamTotalRow = worksheet.getRow(currentRow);
  teamTotalRow.getCell(1).value = "TOTAL";
  teamTotalRow.getCell(2).value = mgmtTotalPrev;
  teamTotalRow.getCell(3).value = mgmtTotalToday;
  teamTotalRow.getCell(4).value = mgmtTotalAccum;
  teamTotalRow.getCell(6).value = "TOTAL";
  teamTotalRow.getCell(7).value = workTotalPrev;
  teamTotalRow.getCell(8).value = workTotalToday;
  teamTotalRow.getCell(9).value = workTotalAccum;
  teamTotalRow.font = { bold: true };
  for (let col = 1; col <= 10; col++) {
    teamTotalRow.getCell(col).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFC0C0C0" },
    };
  }
  currentRow += 2;

  // Materials and Machinery side by side
  const maxMaterialRows = Math.max(
    data.materials.length,
    data.machinery.length
  );

  // Sub-headers with blue background
  const materialSubHeaderRow = worksheet.getRow(currentRow);
  materialSubHeaderRow.getCell(1).value = "Materials Deliveries";
  materialSubHeaderRow.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF3498DB" },
  };
  materialSubHeaderRow.getCell(1).font = {
    color: { argb: "FFFFFFFF" },
    bold: true,
  };
  materialSubHeaderRow.getCell(6).value = "Machinery & Equipment";
  materialSubHeaderRow.getCell(6).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF3498DB" },
  };
  materialSubHeaderRow.getCell(6).font = {
    color: { argb: "FFFFFFFF" },
    bold: true,
  };
  worksheet.mergeCells(currentRow, 1, currentRow, 5);
  worksheet.mergeCells(currentRow, 6, currentRow, 10);
  currentRow++;

  // Column headers
  const materialColumnHeaderRow = worksheet.getRow(currentRow);
  materialColumnHeaderRow.getCell(1).value = "Description";
  materialColumnHeaderRow.getCell(2).value = "Unit";
  materialColumnHeaderRow.getCell(3).value = "Prev";
  materialColumnHeaderRow.getCell(4).value = "Today";
  materialColumnHeaderRow.getCell(5).value = "Accum";
  materialColumnHeaderRow.getCell(6).value = "Description";
  materialColumnHeaderRow.getCell(7).value = "Unit";
  materialColumnHeaderRow.getCell(8).value = "Prev";
  materialColumnHeaderRow.getCell(9).value = "Today";
  materialColumnHeaderRow.getCell(10).value = "Accum";
  materialColumnHeaderRow.font = { bold: true };
  currentRow++;

  // Data rows with alternating colors
  for (let i = 0; i < maxMaterialRows; i++) {
    const row = worksheet.getRow(currentRow);
    const mat = data.materials[i] || {
      description: "",
      unit: "",
      prev: "",
      today: "",
      accumulated: "",
    };
    const mach = data.machinery[i] || {
      description: "",
      unit: "",
      prev: "",
      today: "",
      accumulated: "",
    };

    row.getCell(1).value = mat.description || "";
    row.getCell(2).value = mat.unit || "";
    row.getCell(3).value = mat.prev || "";
    row.getCell(4).value = mat.today || "";
    row.getCell(5).value = mat.accumulated || "";
    row.getCell(6).value = mach.description || "";
    row.getCell(7).value = mach.unit || "";
    row.getCell(8).value = mach.prev || "";
    row.getCell(9).value = mach.today || "";
    row.getCell(10).value = mach.accumulated || "";

    if (i % 2 === 0) {
      for (let col = 1; col <= 10; col++) {
        row.getCell(col).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF5F5F5" },
        };
      }
    }
    currentRow++;
  }

  // Totals for materials and machinery
  const matTotalPrev = data.materials.reduce(
    (sum, row) => sum + (Number(row.prev) || 0),
    0
  );
  const matTotalToday = data.materials.reduce(
    (sum, row) => sum + (Number(row.today) || 0),
    0
  );
  const matTotalAccum = data.materials.reduce(
    (sum, row) => sum + (Number(row.accumulated) || 0),
    0
  );
  const machTotalPrev = data.machinery.reduce(
    (sum, row) => sum + (Number(row.prev) || 0),
    0
  );
  const machTotalToday = data.machinery.reduce(
    (sum, row) => sum + (Number(row.today) || 0),
    0
  );
  const machTotalAccum = data.machinery.reduce(
    (sum, row) => sum + (Number(row.accumulated) || 0),
    0
  );

  const materialTotalRow = worksheet.getRow(currentRow);
  materialTotalRow.getCell(1).value = "TOTAL";
  materialTotalRow.getCell(3).value = matTotalPrev;
  materialTotalRow.getCell(4).value = matTotalToday;
  materialTotalRow.getCell(5).value = matTotalAccum;
  materialTotalRow.getCell(6).value = "TOTAL";
  materialTotalRow.getCell(8).value = machTotalPrev;
  materialTotalRow.getCell(9).value = machTotalToday;
  materialTotalRow.getCell(10).value = machTotalAccum;
  materialTotalRow.font = { bold: true };
  for (let col = 1; col <= 10; col++) {
    materialTotalRow.getCell(col).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFC0C0C0" },
    };
  }
  currentRow += 2;

  // Footer
  const footerRow = worksheet.getRow(currentRow);
  footerRow.getCell(1).value = `Generated on ${new Date().toLocaleString()}`;
  footerRow.getCell(1).font = { size: 8, color: { argb: "FF808080" } };
  footerRow.getCell(1).alignment = { horizontal: "center" };
  worksheet.mergeCells(currentRow, 1, currentRow, 10);

  // Set column widths
  worksheet.columns = [
    { width: 25 }, // Description
    { width: 8 }, // Unit
    { width: 8 }, // Prev
    { width: 8 }, // Today
    { width: 10 }, // Accum
    { width: 25 }, // Description
    { width: 8 }, // Unit
    { width: 8 }, // Prev
    { width: 8 }, // Today
    { width: 10 }, // Accum
  ];

  // Save
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
