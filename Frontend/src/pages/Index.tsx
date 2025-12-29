import ReportHeader from "@/components/ReportHeader";
import ProjectInfo from "@/components/ProjectInfo";
import ActivitySection from "@/components/ActivitySection";
import ResourcesSection from "@/components/ResourcesSection";
import ReportActions from "@/components/ReportActions";
import PDFPreviewModal from "@/components/PDFPreviewModal";
import { useReportForm } from "@/hooks/useReportForm";

const Index = () => {
// CALL IT ONCE - Get everything out in one go
  const {
    reportDate, setReportDate,
    projectName, setProjectName,
    weather, setWeather,
    weatherPeriod, setWeatherPeriod,
    temperature, setTemperature,
    activityToday, setActivityToday,
    workPlanNextDay, setWorkPlanNextDay,
    managementTeam, setManagementTeam,
    workingTeam, setWorkingTeam,
    materials, setMaterials,
    machinery, setMachinery,
    previewUrl,
    showPreview, setShowPreview,
    isSubmitting, handlePreview, 
    handleExportPDF, handleExportExcel, 
    handleExportAll, handleClear, handleSubmit,
    isPreviewing, isExporting
  } = useReportForm();

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
