import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import ReportHeader from "@/components/ReportHeader";
import ProjectInfo from "@/components/ProjectInfo";
import ActivitySection from "@/components/ActivitySection";
import ResourcesSection from "@/components/ResourcesSection";
import ReportActions from "@/components/ReportActions";
import PDFPreviewModal from "@/components/PDFPreviewModal";
import { ResourceRow } from "@/components/ResourceTable";
import { exportToPDF, exportToExcel } from "@/lib/exportUtils";

// API Configuration
const API_BASE_URL = "http://localhost:5000/api/daily-reports";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// API functions
const saveReportToDB = async (reportData: any) => {
  const response = await fetch(`${API_BASE_URL}/save`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(reportData),
  });
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to save report" }));
    throw new Error(error.message || "Failed to save report");
  }
  return response.json();
};

const submitReportToDB = async (projectName: string, reportDate: Date) => {
  const dateStr = reportDate.toISOString().split("T")[0];
  const response = await fetch(`${API_BASE_URL}/submit`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ projectName, date: dateStr }),
  });
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to submit report" }));
    throw new Error(error.message || "Failed to submit report");
  }
  return response.json();
};

// FIXED: Removed duplicate "daily-reports" from path
const loadReportFromDB = async (reportDate: Date) => {
  const dateStr = reportDate.toISOString().split("T")[0];
  const response = await fetch(`${API_BASE_URL}/date/${dateStr}`);

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Failed to load report");
  }
  return response.json();
};

// Local Storage helpers (for offline drafts)
const STORAGE_PREFIX = "daily-report:";
const dateKey = (date: Date | undefined): string => {
  if (!date) return STORAGE_PREFIX + "unknown";
  return STORAGE_PREFIX + date.toISOString().slice(0, 10);
};

function saveDraftLocally(date: Date | undefined, data: ReportData): void {
  try {
    localStorage.setItem(dateKey(date), JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

function loadDraftLocally(date: Date | undefined): ReportData | null {
  try {
    const raw = localStorage.getItem(dateKey(date));
    return raw ? (JSON.parse(raw) as ReportData) : null;
  } catch (e) {
    console.error("Failed to load from localStorage:", e);
    return null;
  }
}

interface ReportData {
  projectName: string;
  reportDate: string | null;
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

const Index = () => {
  const { toast } = useToast();

  // Project Info
  const [projectName, setProjectName] = useState("");
  const [reportDate, setReportDate] = useState<Date | undefined>(new Date());
  const [weather, setWeather] = useState("Sunny");
  const [weatherPeriod, setWeatherPeriod] = useState<"AM" | "PM">("AM");
  const [temperature, setTemperature] = useState("");

  // Activities
  const [activityToday, setActivityToday] = useState("");
  const [workPlanNextDay, setWorkPlanNextDay] = useState("");

  // Resources
  const [managementTeam, setManagementTeam] = useState<ResourceRow[]>([]);
  const [workingTeam, setWorkingTeam] = useState<ResourceRow[]>([]);
  const [materials, setMaterials] = useState<ResourceRow[]>([]);
  const [machinery, setMachinery] = useState<ResourceRow[]>([]);

  // UI State
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Track previous date to detect changes
  const lastDateRef = useRef<string | null>(null);

  // Helper to get current report data
  const getReportData = useCallback(
    (): ReportData => ({
      projectName,
      reportDate: reportDate?.toISOString() || null,
      weather,
      weatherPeriod,
      temperature,
      activityToday,
      workPlanNextDay,
      managementTeam,
      workingTeam,
      materials,
      machinery,
    }),
    [
      projectName,
      reportDate,
      weather,
      weatherPeriod,
      temperature,
      activityToday,
      workPlanNextDay,
      managementTeam,
      workingTeam,
      materials,
      machinery,
    ]
  );

  // Load report on mount - Try DB first, fallback to localStorage
  useEffect(() => {
    const loadInitialReport = async () => {
      if (!reportDate) return;

      try {
        // Try to load from database first
        const dbReport = await loadReportFromDB(reportDate);

        if (dbReport) {
          // Load from database
          setProjectName(dbReport.projectName || "");
          setReportDate(
            dbReport.reportDate ? new Date(dbReport.reportDate) : new Date()
          );
          setWeather(dbReport.weather || "Sunny");
          setWeatherPeriod(dbReport.weatherPeriod || "AM");
          setTemperature(dbReport.temperature || "");
          setActivityToday(dbReport.activityToday || "");
          setWorkPlanNextDay(dbReport.workPlanNextDay || "");
          setManagementTeam(dbReport.managementTeam || []);
          setWorkingTeam(dbReport.workingTeam || []);
          setMaterials(dbReport.materials || []);
          setMachinery(dbReport.machinery || []);
        } else {
          // Fallback to localStorage
          const localDraft = loadDraftLocally(reportDate);
          if (localDraft) {
            setProjectName(localDraft.projectName || "");
            setReportDate(
              localDraft.reportDate
                ? new Date(localDraft.reportDate)
                : new Date()
            );
            setWeather(localDraft.weather || "Sunny");
            setWeatherPeriod(localDraft.weatherPeriod || "AM");
            setTemperature(localDraft.temperature || "");
            setActivityToday(localDraft.activityToday || "");
            setWorkPlanNextDay(localDraft.workPlanNextDay || "");
            setManagementTeam(localDraft.managementTeam || []);
            setWorkingTeam(localDraft.workingTeam || []);
            setMaterials(localDraft.materials || []);
            setMachinery(localDraft.machinery || []);
          }
        }
      } catch (e) {
        console.error("Failed to load report:", e);
        // Fallback to localStorage if DB fails
        const localDraft = loadDraftLocally(reportDate);
        if (localDraft) {
          setProjectName(localDraft.projectName || "");
          setReportDate(
            localDraft.reportDate ? new Date(localDraft.reportDate) : new Date()
          );
          setWeather(localDraft.weather || "Sunny");
          setWeatherPeriod(localDraft.weatherPeriod || "AM");
          setTemperature(localDraft.temperature || "");
          setActivityToday(localDraft.activityToday || "");
          setWorkPlanNextDay(localDraft.workPlanNextDay || "");
          setManagementTeam(localDraft.managementTeam || []);
          setWorkingTeam(localDraft.workingTeam || []);
          setMaterials(localDraft.materials || []);
          setMachinery(localDraft.machinery || []);
        }
      }
    };

    loadInitialReport();
  }, []); // Run only on mount

  // Handle date change: save current, load target, prefill from prev day if new
  useEffect(() => {
    const newDateStr = reportDate?.toISOString().slice(0, 10) || null;
    const prevDateStr = lastDateRef.current;

    if (prevDateStr && newDateStr && prevDateStr !== newDateStr) {
      // Date changed: save current date draft locally
      saveDraftLocally(new Date(prevDateStr), getReportData());

      // Load the target date
      const loadTargetDate = async () => {
        try {
          // Try database first
          const dbReport = await loadReportFromDB(reportDate!);

          if (dbReport) {
            // Found report in database
            setProjectName(dbReport.projectName || "");
            setWeather(dbReport.weather || "Sunny");
            setWeatherPeriod(dbReport.weatherPeriod || "AM");
            setTemperature(dbReport.temperature || "");
            setActivityToday(dbReport.activityToday || "");
            setWorkPlanNextDay(dbReport.workPlanNextDay || "");
            setManagementTeam(dbReport.managementTeam || []);
            setWorkingTeam(dbReport.workingTeam || []);
            setMaterials(dbReport.materials || []);
            setMachinery(dbReport.machinery || []);
          } else {
            // No DB report, try localStorage
            const localDraft = loadDraftLocally(reportDate);

            if (localDraft) {
              // Found local draft
              setProjectName(localDraft.projectName || "");
              setWeather(localDraft.weather || "Sunny");
              setWeatherPeriod(localDraft.weatherPeriod || "AM");
              setTemperature(localDraft.temperature || "");
              setActivityToday(localDraft.activityToday || "");
              setWorkPlanNextDay(localDraft.workPlanNextDay || "");
              setManagementTeam(localDraft.managementTeam || []);
              setWorkingTeam(localDraft.workingTeam || []);
              setMaterials(localDraft.materials || []);
              setMachinery(localDraft.machinery || []);
            } else {
              // No saved report: prefill from yesterday
              const yesterday = new Date(reportDate!.getTime() - 86400000);
              const prevData = loadDraftLocally(yesterday);

              if (prevData) {
                // Copy prev-day accumulated -> today's prev
                const mapPrevFromAccum = (rows: ResourceRow[]) =>
                  rows.map((r) => ({
                    ...r,
                    prev: r.accumulated,
                    today: 0,
                    accumulated: r.accumulated,
                  }));

                setManagementTeam(
                  mapPrevFromAccum(prevData.managementTeam || [])
                );
                setWorkingTeam(mapPrevFromAccum(prevData.workingTeam || []));
                setMaterials(mapPrevFromAccum(prevData.materials || []));
                setMachinery(mapPrevFromAccum(prevData.machinery || []));

                // Reset other fields for new day
                setProjectName("");
                setWeather("Sunny");
                setWeatherPeriod("AM");
                setTemperature("");
                setActivityToday("");
                setWorkPlanNextDay("");
              }
            }
          }
        } catch (e) {
          console.error("Failed to load report for new date:", e);
        }
      };

      loadTargetDate();
    }

    lastDateRef.current = newDateStr;
  }, [reportDate, getReportData]);

  // Save draft to localStorage (silent mode for auto-save)
  const saveDraft = useCallback(
    (silent = false) => {
      setIsSaving(true);
      try {
        saveDraftLocally(reportDate, getReportData());
        if (!silent) {
          toast({
            title: "Draft Saved",
            description: "Your report has been saved locally.",
          });
        }
      } catch (e) {
        if (!silent) {
          toast({
            title: "Save Failed",
            description: "Could not save your draft. Please try again.",
            variant: "destructive",
          });
        }
      }
      setTimeout(() => setIsSaving(false), 500);
    },
    [reportDate, getReportData, toast]
  );

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [saveDraft]);

  const validateReport = (): boolean => {
    if (!projectName.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name is required.",
        variant: "destructive",
      });
      return false;
    }
    if (!reportDate) {
      toast({
        title: "Validation Error",
        description: "Report date is required.",
        variant: "destructive",
      });
      return false;
    }
    if (!activityToday.trim()) {
      toast({
        title: "Validation Error",
        description: "Today's activity description is required.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleExportPDF = async () => {
    if (!validateReport()) return;

    setIsExporting(true);
    try {
      await exportToPDF({
        projectName,
        reportDate,
        weather,
        weatherPeriod,
        temperature,
        activityToday,
        workPlanNextDay,
        managementTeam,
        workingTeam,
        materials,
        machinery,
      });
      toast({
        title: "PDF Exported",
        description: "Your report has been exported as PDF successfully.",
      });
    } catch (e) {
      toast({
        title: "Export Failed",
        description: "Could not export PDF. Please try again.",
        variant: "destructive",
      });
    }
    setIsExporting(false);
  };

  const handlePreview = async () => {
    if (!validateReport()) return;

    setIsPreviewing(true);
    try {
      const url = (await exportToPDF(
        {
          projectName,
          reportDate,
          weather,
          weatherPeriod,
          temperature,
          activityToday,
          workPlanNextDay,
          managementTeam,
          workingTeam,
          materials,
          machinery,
        },
        true
      )) as string;

      setPreviewUrl(url);
      setShowPreview(true);
    } catch (e) {
      toast({
        title: "Preview Failed",
        description: "Could not generate preview. Please try again.",
        variant: "destructive",
      });
    }
    setIsPreviewing(false);
  };

  const handleDownloadFromPreview = async () => {
    try {
      await exportToPDF({
        projectName,
        reportDate,
        weather,
        weatherPeriod,
        temperature,
        activityToday,
        workPlanNextDay,
        managementTeam,
        workingTeam,
        materials,
        machinery,
      });
      toast({
        title: "PDF Exported",
        description: "Your report has been exported as PDF successfully.",
      });
    } catch (e) {
      toast({
        title: "Export Failed",
        description: "Could not export PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportExcel = () => {
    if (!validateReport()) return;

    setIsExporting(true);
    try {
      exportToExcel({
        projectName,
        reportDate,
        weather,
        weatherPeriod,
        temperature,
        activityToday,
        workPlanNextDay,
        managementTeam,
        workingTeam,
        materials,
        machinery,
      });
      toast({
        title: "Excel Exported",
        description: "Your report has been exported as Excel successfully.",
      });
    } catch (e) {
      toast({
        title: "Export Failed",
        description: "Could not export Excel. Please try again.",
        variant: "destructive",
      });
    }
    setIsExporting(false);
  };

  const handleExportAll = async () => {
    if (!validateReport()) return;

    setIsExporting(true);
    try {
      // Export PDF first
      await exportToPDF({
        projectName,
        reportDate,
        weather,
        weatherPeriod,
        temperature,
        activityToday,
        workPlanNextDay,
        managementTeam,
        workingTeam,
        materials,
        machinery,
      });

      // Then export Excel
      exportToExcel({
        projectName,
        reportDate,
        weather,
        weatherPeriod,
        temperature,
        activityToday,
        workPlanNextDay,
        managementTeam,
        workingTeam,
        materials,
        machinery,
      });

      toast({
        title: "All Exports Completed",
        description:
          "Your report has been exported as PDF and Excel successfully.",
      });
    } catch (e) {
      toast({
        title: "Export Failed",
        description: "Could not export all formats. Please try again.",
        variant: "destructive",
      });
    }
    setIsExporting(false);
  };

  const handleClear = () => {
    setProjectName("");
    setReportDate(new Date());
    setWeather("Sunny");
    setWeatherPeriod("AM");
    setTemperature("");
    setActivityToday("");
    setWorkPlanNextDay("");
    setManagementTeam([]);
    setWorkingTeam([]);
    setMaterials([]);
    setMachinery([]);
    // Clear localStorage for current date
    localStorage.removeItem(dateKey(reportDate));
    toast({
      title: "Data Cleared",
      description: "All form data has been cleared.",
    });
  };

  const cleanResourceRows = (rows: ResourceRow[]) => {
    return rows
      .filter(
        (r) =>
          // Keep row if it has description OR any numeric values
          (r.description && r.description.trim() !== "") ||
          (r.prev && r.prev > 0) ||
          (r.today && r.today > 0) ||
          (r.accumulated && r.accumulated > 0)
      )
      .map((r) => ({
        description: r.description?.trim() || "",
        unit: r.unit || "",
        prev: r.prev || 0,
        today: r.today || 0,
        accumulated: r.accumulated || 0,
      }));
  };

  const handleSubmit = async () => {
    if (!validateReport()) return;

    setIsSubmitting(true);
    try {
      // Prepare report data and clean empty rows
      const rawData = getReportData();
      const cleanedData = {
        ...rawData,
        managementTeam: cleanResourceRows(rawData.managementTeam),
        workingTeam: cleanResourceRows(rawData.workingTeam),
        materials: cleanResourceRows(rawData.materials),
        machinery: cleanResourceRows(rawData.machinery),
      };

      // Step 1: Save the report data to database
      await saveReportToDB(cleanedData);

      // Step 2: Mark it as submitted (changes status)
      await submitReportToDB(
        cleanedData.projectName,
        new Date(cleanedData.reportDate!)
      );

      // Step 3: Clear localStorage after successful submission
      localStorage.removeItem(dateKey(reportDate));

      // Step 4: Prepare next day's data (Running Total / Carry-Forward)
      const nextDay = new Date(reportDate!.getTime() + 86400000);
      const carryForwardData = {
        projectName: cleanedData.projectName,
        reportDate: nextDay.toISOString(),
        weather: "Sunny",
        weatherPeriod: "AM" as "AM" | "PM",
        temperature: "",
        activityToday: "",
        workPlanNextDay: "",
        managementTeam: cleanedData.managementTeam.map((r) => ({
          ...r,
          prev: r.accumulated, // ✅ Carry forward accumulated to prev
          today: 0,
          accumulated: r.accumulated,
        })),
        workingTeam: cleanedData.workingTeam.map((r) => ({
          ...r,
          prev: r.accumulated,
          today: 0,
          accumulated: r.accumulated,
        })),
        materials: cleanedData.materials.map((r) => ({
          ...r,
          prev: r.accumulated,
          today: 0,
          accumulated: r.accumulated,
        })),
        machinery: cleanedData.machinery.map((r) => ({
          ...r,
          prev: r.accumulated,
          today: 0,
          accumulated: r.accumulated,
        })),
      };

      // Save next day's template locally
      saveDraftLocally(nextDay, carryForwardData);

      toast({
        title: "Report Submitted",
        description:
          "Your report has been submitted successfully. Tomorrow's report is ready with carried-forward totals.",
        duration: 5000,
      });
    } catch (e: any) {
      toast({
        title: "Submission Failed",
        description: e.message || "Could not submit report. Please try again.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <ReportHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <ProjectInfo
          projectName={projectName}
          setProjectName={setProjectName}
          reportDate={reportDate}
          setReportDate={setReportDate}
          weather={weather}
          setWeather={setWeather}
          weatherPeriod={weatherPeriod}
          setWeatherPeriod={setWeatherPeriod}
          temperature={temperature}
          setTemperature={setTemperature}
        />

        <ActivitySection
          activityToday={activityToday}
          setActivityToday={setActivityToday}
          workPlanNextDay={workPlanNextDay}
          setWorkPlanNextDay={setWorkPlanNextDay}
        />

        <ResourcesSection
          managementTeam={managementTeam}
          setManagementTeam={setManagementTeam}
          workingTeam={workingTeam}
          setWorkingTeam={setWorkingTeam}
          materials={materials}
          setMaterials={setMaterials}
          machinery={machinery}
          setMachinery={setMachinery}
        />

        <ReportActions
          onPreview={handlePreview}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
          onExportAll={handleExportAll}
          onClear={handleClear}
          onSubmit={handleSubmit}
          isPreviewing={isPreviewing}
          isExporting={isExporting}
          isSubmitting={isSubmitting}
        />

        <PDFPreviewModal
          open={showPreview}
          onClose={() => {
            setShowPreview(false);
            if (previewUrl) {
              URL.revokeObjectURL(previewUrl);
            }
          }}
          pdfUrl={previewUrl}
        />
      </main>
    </div>
  );
};

export default Index;
