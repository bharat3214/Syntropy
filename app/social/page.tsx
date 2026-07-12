"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// Types matching database schema
interface CsrActivity {
  id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  location: string;
  date: string;
  durationHours: number;
  maxParticipants: number;
  status: string;
  organizer: string;
  _count?: { participations: number };
}

interface EmployeeParticipation {
  id: string;
  activityId: string;
  employeeName: string;
  employeeId: string;
  department: string;
  proof: string | null;
  approvalStatus: string;
  pointsEarned: number;
  completionDate: string | null;
  registeredDate: string;
  reviewedBy: string | null;
  rejectionReason: string | null;
  activity?: { title: string; category?: string };
}

interface DiversityMetric {
  id: string;
  department: string;
  category: string;
  label: string;
  value: number;
  total: number;
  period: string;
  year: number;
}

interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  trainer: string;
  durationHours: number;
  mandatory: boolean;
  startDate: string;
  endDate: string;
  status: string;
  maxCapacity: number;
  _count?: { completions: number };
}

interface TrainingCompletion {
  id: string;
  trainingId: string;
  employeeName: string;
  employeeId: string;
  department: string;
  completionDate: string | null;
  score: number | null;
  status: string;
  certificateUrl: string | null;
  training?: { title: string; category?: string };
}

interface Toast {
  message: string;
  type: "success" | "error" | "info";
  id: number;
}

export default function SocialModuleDashboard() {
  // Navigation tabs: "analytics" | "activities" | "participations" | "diversity" | "training"
  const [activeTab, setActiveTab] = useState<string>("analytics");

  // State lists
  const [activities, setActivities] = useState<CsrActivity[]>([]);
  const [participations, setParticipations] = useState<EmployeeParticipation[]>([]);
  const [diversityMetrics, setDiversityMetrics] = useState<DiversityMetric[]>([]);
  const [trainings, setTrainings] = useState<TrainingProgram[]>([]);
  const [trainingCompletions, setTrainingCompletions] = useState<TrainingCompletion[]>([]);
  const [engagement, setEngagement] = useState<any>(null);
  
  // Loading & Submitting states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  // Hover chart tooltip states
  const [hoveredChartItem, setHoveredChartItem] = useState<string | null>(null);
  const [hoveredDeptItem, setHoveredDeptItem] = useState<string | null>(null);

  // Help info popover state
  const [activeHelpInfo, setActiveHelpInfo] = useState<string | null>(null);

  // Roster specific states
  const [selectedRosterItemId, setSelectedRosterItemId] = useState<string | null>(null);
  const [rosterType, setRosterType] = useState<"volunteering" | "training">("volunteering");

  // Modals & Form state controllers
  const [activeModal, setActiveModal] = useState<string | null>(null); // "activity" | "register" | "review" | "diversity" | "training" | "completion"
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [formStep, setFormStep] = useState<number>(1); // Multi-step wizards
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Mock upload drag-and-drop states
  const [draggedFile, setDraggedFile] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Form states
  const [activityForm, setActivityForm] = useState({
    title: "",
    description: "",
    category: "Environment",
    department: "",
    location: "",
    date: "",
    durationHours: "",
    maxParticipants: "",
    organizer: "",
    status: "Draft",
  });

  const [registerForm, setRegisterForm] = useState({
    activityId: "",
    employeeName: "",
    employeeId: "",
    department: "",
    proof: "",
  });

  const [reviewForm, setReviewForm] = useState({
    decision: "Approved",
    reviewedBy: "",
    pointsEarned: "10",
    reason: "",
  });

  const [diversityForm, setDiversityForm] = useState({
    department: "",
    category: "Gender",
    label: "",
    value: "",
    total: "",
    period: "",
    year: new Date().getFullYear().toString(),
  });

  const [trainingForm, setTrainingForm] = useState({
    title: "",
    description: "",
    category: "ESG Awareness",
    department: "",
    trainer: "",
    durationHours: "",
    mandatory: false,
    startDate: "",
    endDate: "",
    maxCapacity: "",
    status: "Scheduled",
  });

  const [completionForm, setCompletionForm] = useState({
    trainingId: "",
    employeeName: "",
    employeeId: "",
    department: "",
    status: "Completed",
    score: "",
    certificateUrl: "",
  });

  // Toasts notification system
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch all initial data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/social");
      if (!res.ok) throw new Error("Failed to load dashboard data.");
      const data = await res.json();
      setActivities(data.activities || []);
      setParticipations(data.participations || []);
      setDiversityMetrics(data.diversityMetrics || []);
      setTrainings(data.trainings || []);
      setTrainingCompletions(data.trainingCompletions || []);
      setEngagement(data.engagement || null);
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Form step controls and validations
  const validateActivityStep1 = () => {
    const errors: Record<string, string> = {};
    if (!activityForm.title || activityForm.title.trim().length < 5) {
      errors.title = "Title must be at least 5 characters long.";
    }
    if (!activityForm.description || activityForm.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters.";
    }
    if (!activityForm.department.trim()) {
      errors.department = "Target department is required.";
    }
    if (!activityForm.organizer.trim()) {
      errors.organizer = "Organizer name is required.";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (formStep === 1) {
      if (validateActivityStep1()) {
        setFormStep(2);
      }
    }
  };

  // Drag and Drop simulation handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent, type: "proof" | "certificate") => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setDraggedFile(file.name);
      // Simulate file upload by generating dummy URL
      const mockUrl = `https://storage.syntropy-esg.com/uploads/${Date.now()}_${file.name}`;
      if (type === "proof") {
        setRegisterForm((prev) => ({ ...prev, proof: mockUrl }));
      } else {
        setCompletionForm((prev) => ({ ...prev, certificateUrl: mockUrl }));
      }
      addToast(`Mock file uploaded successfully: ${file.name}`, "info");
    }
  };

  const triggerMockInputClick = (type: "proof" | "certificate") => {
    const mockUrl = `https://storage.syntropy-esg.com/uploads/${Date.now()}_mock_proof.jpg`;
    setDraggedFile("mock_proof.jpg");
    if (type === "proof") {
      setRegisterForm((prev) => ({ ...prev, proof: mockUrl }));
    } else {
      setCompletionForm((prev) => ({ ...prev, certificateUrl: mockUrl }));
    }
    addToast("Sample evidence attachment simulated.", "info");
  };

  // Form submissions
  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setActiveModal(null);
    addToast("Creating CSR Activity...", "info");
    setIsSubmitting("activity");
    try {
      const res = await fetch("/api/social/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activityForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create activity.");
      addToast("CSR Activity created successfully!", "success");
      // Reset form
      setActivityForm({
        title: "",
        description: "",
        category: "Environment",
        department: "",
        location: "",
        date: "",
        durationHours: "",
        maxParticipants: "",
        organizer: "",
        status: "Draft",
      });
      setFormStep(1);
      setValidationErrors({});
      fetchData();
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleRegisterParticipation = async (e: React.FormEvent) => {
    e.preventDefault();
    setActiveModal(null);
    addToast("Registering employee...", "info");
    setIsSubmitting("register");
    try {
      const res = await fetch("/api/social/participation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register.");
      addToast("Employee registered successfully!", "success");
      setRegisterForm({
        activityId: "",
        employeeName: "",
        employeeId: "",
        department: "",
        proof: "",
      });
      setDraggedFile(null);
      fetchData();
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleReviewParticipation = async (e: React.FormEvent) => {
    e.preventDefault();
    setActiveModal(null);
    addToast("Submitting review...", "info");
    setIsSubmitting("review");
    try {
      const res = await fetch(`/api/social/participation/${selectedReviewId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: reviewForm.decision,
          reviewedBy: reviewForm.reviewedBy,
          pointsEarned: Number(reviewForm.pointsEarned),
          reason: reviewForm.reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to review.");
      addToast(`Participation review completed: ${reviewForm.decision}`, "success");
      setSelectedReviewId(null);
      setReviewForm({
        decision: "Approved",
        reviewedBy: "",
        pointsEarned: "10",
        reason: "",
      });
      fetchData();
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleCreateDiversity = async (e: React.FormEvent) => {
    e.preventDefault();
    setActiveModal(null);
    addToast("Saving diversity metrics...", "info");
    setIsSubmitting("diversity");
    try {
      const res = await fetch("/api/social/diversity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...diversityForm,
          value: Number(diversityForm.value),
          total: Number(diversityForm.total),
          year: Number(diversityForm.year),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save diversity metrics.");
      addToast("Diversity metrics recorded successfully.", "success");
      setDiversityForm({
        department: "",
        category: "Gender",
        label: "",
        value: "",
        total: "",
        period: "",
        year: new Date().getFullYear().toString(),
      });
      fetchData();
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleCreateTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    setActiveModal(null);
    addToast("Creating training program...", "info");
    setIsSubmitting("training");
    try {
      const res = await fetch("/api/social/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trainingForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create program.");
      addToast("Training program created successfully.", "success");
      setTrainingForm({
        title: "",
        description: "",
        category: "ESG Awareness",
        department: "",
        trainer: "",
        durationHours: "",
        mandatory: false,
        startDate: "",
        endDate: "",
        maxCapacity: "",
        status: "Scheduled",
      });
      fetchData();
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleCreateCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setActiveModal(null);
    addToast("Recording training completion...", "info");
    setIsSubmitting("completion");
    try {
      const res = await fetch("/api/social/training/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...completionForm,
          score: completionForm.score ? Number(completionForm.score) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record completion.");
      addToast("Training completion recorded.", "success");
      setCompletionForm({
        trainingId: "",
        employeeName: "",
        employeeId: "",
        department: "",
        status: "Completed",
        score: "",
        certificateUrl: "",
      });
      setDraggedFile(null);
      fetchData();
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleUpdateActivityStatus = async (id: string, nextStatus: string) => {
    setIsSubmitting(`update-status-${id}`);
    try {
      const res = await fetch(`/api/social/activities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status.");
      addToast(`Activity status updated to ${nextStatus}`);
      fetchData();
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity? All participations will be deleted.")) return;
    setIsSubmitting(`delete-${id}`);
    try {
      const res = await fetch(`/api/social/activities/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete.");
      addToast("Activity deleted.");
      fetchData();
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setIsSubmitting(null);
    }
  };

  const triggerExport = (type: string) => {
    window.open(`/api/social/export?type=${type}`, "_blank");
    addToast(`Exported ${type} CSV successfully.`);
  };

  // Rendering Helpers
  const renderLoadingSpinner = () => (
    <svg className="animate-spin h-4 w-4 text-current inline mr-2" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  // High-fidelity Skeletons
  const renderSkeletonActivities = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-[#111815] border border-[#232B27] p-6 rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-4 w-16 bg-zinc-800 rounded"></div>
            <div className="h-4 w-12 bg-zinc-800 rounded"></div>
          </div>
          <div className="h-6 w-3/4 bg-zinc-800 rounded"></div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-zinc-800 rounded"></div>
            <div className="h-3 w-5/6 bg-zinc-800 rounded"></div>
          </div>
          <div className="border-t border-[#232B27]/50 pt-4 space-y-2">
            <div className="h-3 w-1/2 bg-zinc-800 rounded"></div>
            <div className="h-3 w-1/3 bg-zinc-800 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSkeletonTable = () => (
    <div className="bg-[#111815] border border-[#232B27] rounded-xl overflow-hidden animate-pulse">
      <div className="h-14 bg-[#0F1512] border-b border-[#232B27] flex items-center justify-between px-6">
        <div className="h-5 w-48 bg-zinc-800 rounded"></div>
        <div className="h-5 w-24 bg-zinc-800 rounded"></div>
      </div>
      <div className="p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-[#232B27]/30 last:border-0">
            <div className="flex gap-4 items-center">
              <div className="h-8 w-8 bg-zinc-800 rounded-full"></div>
              <div className="space-y-1.5">
                <div className="h-4 w-28 bg-zinc-800 rounded"></div>
                <div className="h-3 w-16 bg-zinc-800 rounded"></div>
              </div>
            </div>
            <div className="h-4 w-32 bg-zinc-800 rounded"></div>
            <div className="h-4 w-16 bg-zinc-800 rounded"></div>
            <div className="h-6 w-20 bg-zinc-800 rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  );

  // Styled Empty States
  const renderEmptyState = (title: string, description: string, buttonText?: string, onAction?: () => void) => (
    <div className="bg-[#111815] border border-[#232B27] p-12 rounded-xl text-center flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto my-12">
      <div className="w-12 h-12 bg-zinc-900 border border-[#232B27] rounded-full flex items-center justify-center text-zinc-500 mb-2">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-[#F3F4F1]">{title}</h3>
      <p className="text-sm text-[#9CA3AF] max-w-sm">{description}</p>
      {buttonText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-sm rounded-lg bg-[#22C55E] text-[#0B0F0D] font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] hover:opacity-90"
        >
          {buttonText}
        </button>
      )}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-[#0B0F0D] text-[#F3F4F1] font-sans antialiased min-h-screen">
      {/* Toast Notification Container */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg border shadow-lg flex items-center justify-between transition-all duration-300 transform scale-100 ${
              toast.type === "success"
                ? "bg-[#111815] border-[#22C55E]/30 text-[#22C55E]"
                : toast.type === "error"
                ? "bg-[#111815] border-[#EF4444]/30 text-[#EF4444]"
                : "bg-[#111815] border-[#3B82F6]/30 text-[#3B82F6]"
            }`}
          >
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-4 hover:opacity-80"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* Main Sidebar & Dashboard Layout */}
      <div className="flex flex-1">
        {/* Sidebar Nav */}
        <aside className="w-64 border-r border-[#232B27] bg-[#111815] p-6 flex flex-col justify-between">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-8 hover:opacity-85 transition-opacity cursor-pointer">
              <div className="w-8 h-8 bg-[#22C55E] rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-[#0B0F0D]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-[#F3F4F1]">Syntropy</span>
            </Link>

            <nav className="flex flex-col gap-1">
              <button
                onClick={() => { setActiveTab("analytics"); setSearchQuery(""); }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                  activeTab === "analytics"
                    ? "bg-[#22C55E]/10 text-[#22C55E]"
                    : "text-[#9CA3AF] hover:bg-[#0F1512] hover:text-[#F3F4F1]"
                }`}
              >
                Dashboard Analytics
              </button>

              <button
                onClick={() => { setActiveTab("activities"); setSearchQuery(""); }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                  activeTab === "activities"
                    ? "bg-[#22C55E]/10 text-[#22C55E]"
                    : "text-[#9CA3AF] hover:bg-[#0F1512] hover:text-[#F3F4F1]"
                }`}
              >
                CSR Activities
              </button>

              <button
                onClick={() => { setActiveTab("participations"); setSearchQuery(""); }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                  activeTab === "participations"
                    ? "bg-[#22C55E]/10 text-[#22C55E]"
                    : "text-[#9CA3AF] hover:bg-[#0F1512] hover:text-[#F3F4F1]"
                }`}
              >
                Registrations & Reviews
              </button>

              <button
                onClick={() => { setActiveTab("diversity"); setSearchQuery(""); }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                  activeTab === "diversity"
                    ? "bg-[#22C55E]/10 text-[#22C55E]"
                    : "text-[#9CA3AF] hover:bg-[#0F1512] hover:text-[#F3F4F1]"
                }`}
              >
                Diversity Metric
              </button>

              <button
                onClick={() => { setActiveTab("training"); setSearchQuery(""); }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                  activeTab === "training"
                    ? "bg-[#22C55E]/10 text-[#22C55E]"
                    : "text-[#9CA3AF] hover:bg-[#0F1512] hover:text-[#F3F4F1]"
                }`}
              >
                Training Programs
              </button>

              <button
                onClick={() => { setActiveTab("rosters"); setSearchQuery(""); setSelectedRosterItemId(null); }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                  activeTab === "rosters"
                    ? "bg-[#22C55E]/10 text-[#22C55E]"
                    : "text-[#9CA3AF] hover:bg-[#0F1512] hover:text-[#F3F4F1]"
                }`}
              >
                Program Rosters
              </button>
            </nav>
          </div>

          <div className="border-t border-[#232B27] pt-4">
            <span className="text-xs text-[#9CA3AF] block font-mono">Social Module Engine</span>
            <span className="text-xs text-[#22C55E] block font-mono">v1.3.0-interactive</span>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 p-8 overflow-y-auto relative">
          {/* Header */}
          <header className="flex justify-between items-center mb-8 border-b border-[#232B27] pb-6">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-[#4ADE80]">
                  {activeTab === "analytics" && "Social Module Overview"}
                  {activeTab === "activities" && "CSR Activities"}
                  {activeTab === "participations" && "Registrations & Reviews"}
                  {activeTab === "diversity" && "Diversity & Inclusion"}
                  {activeTab === "training" && "Training & Development"}
                  {activeTab === "rosters" && "Program & Activity Rosters"}
                </h1>
                
                {/* Help popover trigger */}
                <div className="relative">
                  <button
                    onClick={() => setActiveHelpInfo(activeHelpInfo ? null : activeTab)}
                    className="w-5 h-5 rounded-full bg-zinc-900 border border-[#232B27] text-zinc-400 hover:text-[#22C55E] flex items-center justify-center text-xs font-mono font-bold transition-colors"
                  >
                    i
                  </button>
                  
                  {activeHelpInfo === activeTab && (
                    <div className="absolute left-0 mt-2 w-72 bg-[#111815] border border-[#232B27] p-4 rounded-xl shadow-2xl z-20 text-xs text-[#9CA3AF] space-y-2 animate-fade-in">
                      <div className="font-bold text-[#F3F4F1] border-b border-[#232B27] pb-1 flex justify-between">
                        <span>Information Guide</span>
                        <button onClick={() => setActiveHelpInfo(null)} className="text-zinc-500 hover:text-zinc-300">&times;</button>
                      </div>
                      {activeTab === "analytics" && (
                        <p>Dashboard aggregates all points, registrations, and trainings. Department contribution points feed directly into the company's social rating.</p>
                      )}
                      {activeTab === "activities" && (
                        <p>CSR status changes control when employees can register. Publishing changes a draft into active, which unlocks enrollment.</p>
                      )}
                      {activeTab === "participations" && (
                        <p>Proof is strictly mandatory for approvals. An auditor validates the employee ID and provided file link before awarding points.</p>
                      )}
                      {activeTab === "diversity" && (
                        <p>Demographic logs provide snapshots of workplace balance. They track ratios over specific reporting quarters.</p>
                      )}
                      {activeTab === "training" && (
                        <p>Mandatory training programs monitor institutional alignment. Score registries keep logs of completed exams.</p>
                      )}
                      {activeTab === "rosters" && (
                        <p>Grouped registers of participants. Inspect rosters for individual CSR activities or compliance training programs.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-[#9CA3AF] mt-1 text-sm">
                {activeTab === "analytics" && "Aggregated analytics, department scores, and trends."}
                {activeTab === "activities" && "Manage company-wide volunteering, environmental drives, and health camps."}
                {activeTab === "participations" && "Review proof of participation and approve employee ESG points."}
                {activeTab === "diversity" && "Monitor demographics, diversity metrics, and balance across departments."}
                {activeTab === "training" && "Oversee ESG compliance, DEI training, and completion records."}
                {activeTab === "rosters" && "Detailed breakdown of registered participants grouped by volunteering activity or training program."}
              </p>
            </div>

            {/* Quick Actions / Exports */}
            <div className="flex gap-3">
              <button
                onClick={() => triggerExport(activeTab === "training" ? "training" : activeTab === "participations" ? "participation" : "activities")}
                className="px-4 py-2 text-sm rounded-lg border border-[#232B27] text-[#9CA3AF] hover:text-[#F3F4F1] bg-[#111815] transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
              >
                Export CSV
              </button>
              {activeTab === "activities" && (
                <button
                  onClick={() => { setActiveModal("activity"); setFormStep(1); }}
                  className="px-4 py-2 text-sm rounded-lg bg-[#22C55E] text-[#0B0F0D] font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] hover:opacity-90"
                >
                  Create Activity
                </button>
              )}
              {activeTab === "participations" && (
                <button
                  onClick={() => { setActiveModal("register"); setDraggedFile(null); }}
                  className="px-4 py-2 text-sm rounded-lg bg-[#22C55E] text-[#0B0F0D] font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] hover:opacity-90"
                >
                  Register Employee
                </button>
              )}
              {activeTab === "diversity" && (
                <button
                  onClick={() => { setActiveModal("diversity"); }}
                  className="px-4 py-2 text-sm rounded-lg bg-[#22C55E] text-[#0B0F0D] font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] hover:opacity-90"
                >
                  Add Diversity Metric
                </button>
              )}
              {activeTab === "training" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setActiveModal("completion"); setDraggedFile(null); }}
                    className="px-4 py-2 text-sm rounded-lg border border-[#232B27] text-[#4ADE80] font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] hover:bg-[#0F1512]"
                  >
                    Record Completion
                  </button>
                  <button
                    onClick={() => { setActiveModal("training"); }}
                    className="px-4 py-2 text-sm rounded-lg bg-[#22C55E] text-[#0B0F0D] font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] hover:opacity-90"
                  >
                    Create Program
                  </button>
                </div>
              )}
            </div>
          </header>

          {isLoading ? (
            activeTab === "activities" ? renderSkeletonActivities() : renderSkeletonTable()
          ) : (
            <>
              {/* Tab 1: Analytics Dashboard */}
              {activeTab === "analytics" && engagement && (
                <div className="space-y-8 animate-fade-in">
                  {/* Top Key Statistics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-[#111815] border border-[#232B27] p-6 rounded-xl hover:translate-y-[-4px] hover:shadow-[0_12px_24px_rgba(34,197,94,0.02)] transition-all duration-200 cursor-default">
                      <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider block">CSR Activities</span>
                      <span className="text-3xl font-bold mt-2 block text-[#4ADE80]">{engagement.totalActivities}</span>
                      <span className="text-xs text-[#9CA3AF] mt-1 block">{engagement.activeActivities} Active right now</span>
                    </div>

                    <div className="bg-[#111815] border border-[#232B27] p-6 rounded-xl hover:translate-y-[-4px] hover:shadow-[0_12px_24px_rgba(34,197,94,0.02)] transition-all duration-200 cursor-default">
                      <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider block">Total Participations</span>
                      <span className="text-3xl font-bold mt-2 block text-[#3B82F6]">{engagement.totalParticipations}</span>
                      <span className="text-xs text-[#9CA3AF] mt-1 block">{engagement.participationApprovalRate}% approval rate</span>
                    </div>

                    <div className="bg-[#111815] border border-[#232B27] p-6 rounded-xl hover:translate-y-[-4px] hover:shadow-[0_12px_24px_rgba(34,197,94,0.02)] transition-all duration-200 cursor-default">
                      <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider block">Completed Trainings</span>
                      <span className="text-3xl font-bold mt-2 block text-purple-400">{engagement.completedTrainingRecords}</span>
                      <span className="text-xs text-[#9CA3AF] mt-1 block">{engagement.trainingCompletionRate}% completion rate</span>
                    </div>

                    <div className="bg-[#111815] border border-[#232B27] p-6 rounded-xl hover:translate-y-[-4px] hover:shadow-[0_12px_24px_rgba(34,197,94,0.02)] transition-all duration-200 cursor-default">
                      <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider block">Total Points Awarded</span>
                      <span className="text-3xl font-bold mt-2 block text-amber-500">{engagement.totalPointsAwarded} pts</span>
                      <span className="text-xs text-[#9CA3AF] mt-1 block">Contributed to company ESG score</span>
                    </div>
                  </div>

                  {/* Charts & Tables Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Department Ranking with Tooltip */}
                    <div className="bg-[#111815] border border-[#232B27] p-6 rounded-xl relative">
                      <h3 className="text-lg font-semibold text-[#F3F4F1] mb-4">Department ESG Score Contributions</h3>
                      <div className="space-y-4">
                        {activities.length === 0 ? (
                          <p className="text-sm text-[#9CA3AF]">No data available.</p>
                        ) : (
                          ["Operations", "Engineering", "HR", "Marketing", "Procurement"].map((dept) => {
                            const deptParticipations = participations.filter((p) => p.department === dept);
                            const totalRegistered = deptParticipations.length;
                            const approvedPart = deptParticipations.filter((p) => p.approvalStatus === "Approved");
                            const pts = approvedPart.reduce((sum, p) => sum + p.pointsEarned, 0);

                            return (
                              <div
                                key={dept}
                                className="space-y-1 relative group cursor-pointer"
                                onMouseEnter={() => setHoveredDeptItem(dept)}
                                onMouseLeave={() => setHoveredDeptItem(null)}
                              >
                                <div className="flex justify-between text-sm transition-colors group-hover:text-[#4ADE80]">
                                  <span className="text-[#F3F4F1] font-medium">{dept}</span>
                                  <span className="text-[#4ADE80] font-bold">{pts} pts</span>
                                </div>
                                <div className="h-2.5 w-full bg-[#0B0F0D] rounded-full overflow-hidden border border-zinc-900 group-hover:border-[#22C55E]/20 transition-colors">
                                  <div
                                    className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
                                    style={{ width: `${Math.max(4, Math.min(100, (pts / (engagement.totalPointsAwarded || 1)) * 100))}%` }}
                                  ></div>
                                </div>

                                {/* Floating Tooltip */}
                                {hoveredDeptItem === dept && (
                                  <div className="absolute right-0 bottom-full mb-1 z-10 w-48 bg-[#0F1512] border border-[#22C55E]/40 p-3 rounded-lg shadow-xl text-xs space-y-1 animate-fade-in">
                                    <div className="font-bold text-[#F3F4F1] border-b border-[#232B27] pb-1 mb-1">{dept} Summary</div>
                                    <div className="flex justify-between"><span>Approved Points:</span> <span className="font-bold text-[#22C55E]">{pts}</span></div>
                                    <div className="flex justify-between"><span>Total Enrolled:</span> <span className="text-zinc-300">{totalRegistered}</span></div>
                                    <div className="flex justify-between"><span>Approval Rate:</span> <span className="text-zinc-300">{totalRegistered > 0 ? Math.round((approvedPart.length / totalRegistered) * 100) : 0}%</span></div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Category Distribution with Tooltip */}
                    <div className="bg-[#111815] border border-[#232B27] p-6 rounded-xl relative">
                      <h3 className="text-lg font-semibold text-[#F3F4F1] mb-4">CSR Category Breakdown</h3>
                      <div className="space-y-4">
                        {["Environment", "Community", "Education", "Health"].map((cat) => {
                          const catActs = activities.filter((a) => a.category === cat);
                          const count = catActs.length;
                          const pct = activities.length > 0 ? Math.round((count / activities.length) * 100) : 0;
                          
                          return (
                            <div
                              key={cat}
                              className="flex items-center gap-4 relative group cursor-pointer"
                              onMouseEnter={() => setHoveredChartItem(cat)}
                              onMouseLeave={() => setHoveredChartItem(null)}
                            >
                              <span className="w-24 text-sm text-[#9CA3AF] group-hover:text-blue-400 transition-colors">{cat}</span>
                              <div className="flex-1 h-3 bg-[#0B0F0D] rounded-full overflow-hidden border border-zinc-900 group-hover:border-blue-400/20 transition-colors">
                                <div
                                  className="h-full bg-[#3B82F6] rounded-full transition-all duration-500"
                                  style={{ width: `${Math.max(4, pct)}%` }}
                                ></div>
                              </div>
                              <span className="w-8 text-right text-sm text-[#F3F4F1] font-mono">{count}</span>

                              {/* Floating Tooltip */}
                              {hoveredChartItem === cat && (
                                <div className="absolute right-0 bottom-full mb-1 z-10 w-48 bg-[#0F1512] border border-[#3B82F6]/40 p-3 rounded-lg shadow-xl text-xs space-y-1 animate-fade-in">
                                  <div className="font-bold text-[#F3F4F1] border-b border-[#232B27] pb-1 mb-1">{cat} Category</div>
                                  <div className="flex justify-between"><span>Percentage Share:</span> <span className="font-bold text-blue-400">{pct}%</span></div>
                                  <div className="flex justify-between"><span>Created Campaigns:</span> <span className="text-zinc-300">{count}</span></div>
                                  <div className="flex justify-between"><span>Active Drives:</span> <span className="text-zinc-300">{catActs.filter(a => a.status === "Active").length}</span></div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: CSR Activities */}
              {activeTab === "activities" && (
                <div className="space-y-6 animate-fade-in">
                  {/* Search/Filter Bar */}
                  <div className="bg-[#111815] border border-[#232B27] p-4 rounded-xl flex flex-wrap gap-4">
                    <input
                      type="text"
                      placeholder="Search activities by title or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-[#0B0F0D] border border-[#232B27] text-sm text-[#F3F4F1] focus:outline-none focus:ring-1 focus:ring-[#22C55E] flex-1 min-w-[200px]"
                    />
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-[#0B0F0D] border border-[#232B27] text-sm text-[#F3F4F1] focus:outline-none"
                    >
                      <option value="">All Categories</option>
                      <option value="Environment">Environment</option>
                      <option value="Community">Community</option>
                      <option value="Education">Education</option>
                      <option value="Health">Health</option>
                    </select>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-[#0B0F0D] border border-[#232B27] text-sm text-[#F3F4F1] focus:outline-none"
                    >
                      <option value="">All Statuses</option>
                      <option value="Draft">Draft</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Empty State / Grid */}
                  {activities.filter((act) => {
                    const matchesSearch = act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      act.description.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesCategory = !filterCategory || act.category === filterCategory;
                    const matchesStatus = !filterStatus || act.status === filterStatus;
                    return matchesSearch && matchesCategory && matchesStatus;
                  }).length === 0 ? (
                    renderEmptyState(
                      "No CSR activities found",
                      "Try refining your search text or create a brand-new CSR volunteering activity now.",
                      "Create Activity",
                      () => { setActiveModal("activity"); setFormStep(1); }
                    )
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {activities
                        .filter((act) => {
                          const matchesSearch = act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            act.description.toLowerCase().includes(searchQuery.toLowerCase());
                          const matchesCategory = !filterCategory || act.category === filterCategory;
                          const matchesStatus = !filterStatus || act.status === filterStatus;
                          return matchesSearch && matchesCategory && matchesStatus;
                        })
                        .map((act) => (
                          <div key={act.id} className="bg-[#111815] border border-[#232B27] p-6 rounded-xl flex flex-col justify-between hover:translate-y-[-4px] hover:shadow-[0_12px_24px_rgba(34,197,94,0.03)] transition-all duration-200">
                            <div>
                              <div className="flex justify-between items-start gap-2 mb-4">
                                <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-400">
                                  {act.category}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                                  act.status === "Active" ? "bg-[#22C55E]/10 text-[#22C55E]" :
                                  act.status === "Completed" ? "bg-[#3B82F6]/10 text-[#3B82F6]" : "bg-zinc-800 text-zinc-400"
                                }`}>
                                  {act.status}
                                </span>
                              </div>
                              <h3 className="text-lg font-semibold mb-2 text-[#4ADE80]">{act.title}</h3>
                              <p className="text-sm text-[#9CA3AF] mb-4 line-clamp-3">{act.description}</p>

                              <div className="space-y-1.5 text-xs text-[#9CA3AF] mb-6 font-medium">
                                <div><strong className="text-[#F3F4F1]">Location:</strong> {act.location}</div>
                                <div><strong className="text-[#F3F4F1]">Organizer:</strong> {act.organizer}</div>
                                <div><strong className="text-[#F3F4F1]">Date:</strong> {new Date(act.date).toLocaleDateString()}</div>
                                <div><strong className="text-[#F3F4F1]">Department:</strong> {act.department}</div>
                                <div>
                                  <strong className="text-[#F3F4F1]">Capacity:</strong>{" "}
                                  {act._count?.participations || 0} / {act.maxParticipants} registered
                                </div>
                              </div>
                            </div>

                            {/* Activity Quick Actions */}
                            <div className="flex gap-2 border-t border-[#232B27] pt-4">
                              {act.status === "Draft" && (
                                <button
                                  disabled={isSubmitting !== null}
                                  onClick={() => handleUpdateActivityStatus(act.id, "Active")}
                                  className="flex-1 py-1.5 text-xs rounded bg-[#22C55E]/10 text-[#22C55E] font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] hover:bg-[#22C55E]/20 disabled:opacity-50"
                                >
                                  {isSubmitting === `update-status-${act.id}` ? (
                                    <>
                                      {renderLoadingSpinner()}
                                      Publishing...
                                    </>
                                  ) : (
                                    "Publish Active"
                                  )}
                                </button>
                              )}
                              {act.status === "Active" && (
                                <button
                                  disabled={isSubmitting !== null}
                                  onClick={() => handleUpdateActivityStatus(act.id, "Completed")}
                                  className="flex-1 py-1.5 text-xs rounded bg-blue-500/10 text-blue-400 font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] hover:bg-blue-500/20 disabled:opacity-50"
                                >
                                  {isSubmitting === `update-status-${act.id}` ? (
                                    <>
                                      {renderLoadingSpinner()}
                                      Completing...
                                    </>
                                  ) : (
                                    "Mark Completed"
                                  )}
                                </button>
                              )}
                              <button
                                disabled={isSubmitting !== null}
                                onClick={() => handleDeleteActivity(act.id)}
                                className="px-3 py-1.5 text-xs rounded bg-red-500/10 text-red-400 font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] hover:bg-red-500/20 disabled:opacity-50"
                              >
                                {isSubmitting === `delete-${act.id}` ? (
                                  <>
                                    {renderLoadingSpinner()}
                                    Deleting...
                                  </>
                                ) : (
                                  "Delete"
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Registrations & Reviews */}
              {activeTab === "participations" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-[#111815] border border-[#232B27] rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-[#232B27] flex flex-wrap justify-between items-center gap-4">
                      <input
                        type="text"
                        placeholder="Search registrations by employee name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-[#0B0F0D] border border-[#232B27] text-sm text-[#F3F4F1] focus:outline-none focus:ring-1 focus:ring-[#22C55E] w-64"
                      />
                      <div className="flex gap-2">
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="px-3 py-2 rounded-lg bg-[#0B0F0D] border border-[#232B27] text-sm text-[#F3F4F1] focus:outline-none"
                        >
                          <option value="">All statuses</option>
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>

                    {participations.filter((p) => {
                      const matchesSearch = p.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.activity?.title.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesStatus = !filterStatus || p.approvalStatus === filterStatus;
                      return matchesSearch && matchesStatus;
                    }).length === 0 ? (
                      renderEmptyState(
                        "No participation registry found",
                        "Enroll an employee into an active CSR campaign to review and award ESG points.",
                        "Register Employee",
                        () => { setActiveModal("register"); setDraggedFile(null); }
                      )
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="bg-[#0F1512] border-b border-[#232B27] text-[#9CA3AF] font-mono text-xs uppercase">
                              <th className="p-4">Employee</th>
                              <th className="p-4">Activity</th>
                              <th className="p-4">Department</th>
                              <th className="p-4">Proof Attachment</th>
                              <th className="p-4">Status</th>
                              <th className="p-4">Points</th>
                              <th className="p-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#232B27]">
                            {participations
                              .filter((p) => {
                                const matchesSearch = p.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  p.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  p.activity?.title.toLowerCase().includes(searchQuery.toLowerCase());
                                const matchesStatus = !filterStatus || p.approvalStatus === filterStatus;
                                return matchesSearch && matchesStatus;
                              })
                              .map((p) => (
                                <tr key={p.id} className="hover:bg-[#0F1512]/50 transition-colors">
                                  <td className="p-4">
                                    <div className="font-semibold text-[#F3F4F1]">{p.employeeName}</div>
                                    <div className="text-xs text-[#9CA3AF] font-mono">{p.employeeId}</div>
                                  </td>
                                  <td className="p-4 text-[#9CA3AF]">{p.activity?.title || "Unknown Activity"}</td>
                                  <td className="p-4 text-[#9CA3AF]">{p.department}</td>
                                  <td className="p-4">
                                    {p.proof ? (
                                      <a href={p.proof} target="_blank" rel="noopener noreferrer" className="text-[#22C55E] hover:underline font-mono text-xs">
                                        View Evidence
                                      </a>
                                    ) : (
                                      <span className="text-[#9CA3AF] italic text-xs">No proof uploaded</span>
                                    )}
                                  </td>
                                  <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${
                                      p.approvalStatus === "Approved" ? "bg-[#22C55E]/10 text-[#22C55E]" :
                                      p.approvalStatus === "Rejected" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-amber-500/10 text-amber-500"
                                    }`}>
                                      {p.approvalStatus}
                                    </span>
                                  </td>
                                  <td className="p-4 font-mono font-bold text-amber-500">{p.pointsEarned} pts</td>
                                  <td className="p-4 text-right">
                                    {p.approvalStatus === "Pending" ? (
                                      <button
                                        onClick={() => {
                                          setSelectedReviewId(p.id);
                                          setActiveModal("review");
                                        }}
                                        className="px-3 py-1 rounded bg-[#22C55E] text-[#0B0F0D] text-xs font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] hover:opacity-90"
                                      >
                                        Review
                                      </button>
                                    ) : (
                                      <span className="text-xs text-[#9CA3AF]">
                                        {p.reviewedBy ? `Reviewed by ${p.reviewedBy}` : "Completed"}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 4: Diversity Tracking */}
              {activeTab === "diversity" && (
                <div className="space-y-6 animate-fade-in">
                  {/* Summary grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {["Gender", "Ethnicity", "Age Group"].map((cat) => {
                      const list = diversityMetrics.filter((m) => m.category === cat);

                      return (
                        <div key={cat} className="bg-[#111815] border border-[#232B27] p-6 rounded-xl hover:translate-y-[-4px] hover:shadow-[0_12px_24px_rgba(34,197,94,0.02)] transition-all duration-200">
                          <h4 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-4">{cat} Metrics</h4>
                          <div className="space-y-3">
                            {list.length === 0 ? (
                              <p className="text-xs text-[#9CA3AF] italic">No records added yet.</p>
                            ) : (
                              list.map((m) => {
                                const percentage = m.total > 0 ? Math.round((m.value / m.total) * 100) : 0;
                                return (
                                  <div key={m.id} className="space-y-1">
                                    <div className="flex justify-between text-xs font-medium">
                                      <span>{m.label} ({m.department})</span>
                                      <span className="text-[#9CA3AF]">{m.value} / {m.total} ({percentage}%)</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-[#0B0F0D] rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Raw Data List */}
                  <div className="bg-[#111815] border border-[#232B27] rounded-xl overflow-hidden">
                    <h3 className="text-sm font-semibold p-4 border-b border-[#232B27]">Recorded Diversity Snapshots</h3>
                    {diversityMetrics.length === 0 ? (
                      renderEmptyState(
                        "No diversity metrics logged",
                        "Record employee balance snapshots across organizational departments.",
                        "Add Diversity Metric",
                        () => setActiveModal("diversity")
                      )
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="bg-[#0F1512] border-b border-[#232B27] text-[#9CA3AF] font-mono text-xs uppercase">
                              <th className="p-4">Department</th>
                              <th className="p-4">Category</th>
                              <th className="p-4">Label</th>
                              <th className="p-4">Metrics (Count / Total)</th>
                              <th className="p-4">Period</th>
                              <th className="p-4">Year</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#232B27]">
                            {diversityMetrics.map((m) => (
                              <tr key={m.id} className="hover:bg-[#0F1512]/50 transition-colors">
                                <td className="p-4 font-semibold text-[#F3F4F1]">{m.department}</td>
                                <td className="p-4 text-blue-400 font-mono text-xs">{m.category}</td>
                                <td className="p-4 text-[#9CA3AF]">{m.label}</td>
                                <td className="p-4 font-mono text-[#9CA3AF]">
                                  {m.value} / {m.total} ({m.total > 0 ? Math.round((m.value / m.total) * 100) : 0}%)
                                </td>
                                <td className="p-4 text-[#9CA3AF]">{m.period}</td>
                                <td className="p-4 text-[#9CA3AF]">{m.year}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 5: Training Programs */}
              {activeTab === "training" && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in">
                  {/* Programs column */}
                  <div className="xl:col-span-2 space-y-6">
                    <h3 className="text-lg font-bold text-[#4ADE80]">Active Training Programs</h3>
                    {trainings.length === 0 ? (
                      renderEmptyState(
                        "No training programs found",
                        "Create ESG courses to ensure employees meet sustainability criteria.",
                        "Create Program",
                        () => setActiveModal("training")
                      )
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {trainings.map((prog) => (
                          <div key={prog.id} className="bg-[#111815] border border-[#232B27] p-6 rounded-xl flex flex-col justify-between hover:translate-y-[-4px] hover:shadow-[0_12px_24px_rgba(34,197,94,0.02)] transition-all duration-200">
                            <div>
                              <div className="flex justify-between items-start mb-4">
                                <span className="px-2 py-0.5 rounded text-xs font-mono bg-purple-500/10 text-purple-400">
                                  {prog.category}
                                </span>
                                {prog.mandatory && (
                                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-red-500/10 text-red-400 font-bold">
                                    MANDATORY
                                  </span>
                                )}
                              </div>
                              <h4 className="text-md font-semibold mb-2 text-[#F3F4F1]">{prog.title}</h4>
                              <p className="text-xs text-[#9CA3AF] mb-4 line-clamp-3">{prog.description}</p>

                              <div className="space-y-1 text-xs text-[#9CA3AF]">
                                <div><strong>Trainer:</strong> {prog.trainer}</div>
                                <div><strong>Duration:</strong> {prog.durationHours} hrs</div>
                                <div><strong>Dates:</strong> {new Date(prog.startDate).toLocaleDateString()} - {new Date(prog.endDate).toLocaleDateString()}</div>
                                <div><strong>Target Department:</strong> {prog.department}</div>
                                <div>
                                  <strong>Registered Completions:</strong> {prog._count?.completions || 0} / {prog.maxCapacity}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Completion records column */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-purple-400">Completion Registry</h3>
                    <div className="bg-[#111815] border border-[#232B27] rounded-xl divide-y divide-[#232B27] max-h-[600px] overflow-y-auto">
                      {trainingCompletions.length === 0 ? (
                        <p className="p-4 text-xs text-[#9CA3AF] italic text-center">No completions logged.</p>
                      ) : (
                        trainingCompletions.map((comp) => (
                          <div key={comp.id} className="p-4 space-y-2 hover:bg-[#0F1512]/50 transition-colors">
                            <div className="flex justify-between">
                              <span className="font-semibold text-sm text-[#F3F4F1]">{comp.employeeName}</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                                comp.status === "Completed" ? "bg-[#22C55E]/10 text-[#22C55E]" :
                                comp.status === "Failed" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-amber-500/10 text-amber-500"
                              }`}>
                                {comp.status}
                              </span>
                            </div>
                            <div className="text-xs text-[#9CA3AF]">
                              <div><strong>Training:</strong> {comp.training?.title}</div>
                              {comp.score != null && <div><strong>Score:</strong> {comp.score}%</div>}
                              {comp.completionDate && <div><strong>Completed:</strong> {new Date(comp.completionDate).toLocaleDateString()}</div>}
                            </div>
                            {comp.certificateUrl && (
                              <a href={comp.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#22C55E] hover:underline font-mono block">
                                View Certificate
                              </a>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 6: Program & Activity Rosters */}
              {activeTab === "rosters" && (
                <div className="space-y-6 animate-fade-in">
                  {/* Top selection group */}
                  <div className="flex gap-2 bg-[#111815] border border-[#232B27] p-1 rounded-lg w-max">
                    <button
                      onClick={() => { setRosterType("volunteering"); setSelectedRosterItemId(null); }}
                      className={`px-4 py-2 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer ${
                        rosterType === "volunteering"
                          ? "bg-[#22C55E] text-[#0B0F0D]"
                          : "text-[#9CA3AF] hover:text-[#F3F4F1] hover:bg-[#0F1512]"
                      }`}
                    >
                      Volunteering Roster (CSR)
                    </button>
                    <button
                      onClick={() => { setRosterType("training"); setSelectedRosterItemId(null); }}
                      className={`px-4 py-2 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer ${
                        rosterType === "training"
                          ? "bg-[#22C55E] text-[#0B0F0D]"
                          : "text-[#9CA3AF] hover:text-[#F3F4F1] hover:bg-[#0F1512]"
                      }`}
                    >
                      Training Programs Roster
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: List of Activities / Programs */}
                    <div className="lg:col-span-1 space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">
                        Select {rosterType === "volunteering" ? "Activity" : "Training Program"}
                      </h3>
                      {rosterType === "volunteering" ? (
                        activities.length === 0 ? (
                          <div className="bg-[#111815] border border-[#232B27] rounded-xl p-6 text-center text-xs text-[#9CA3AF] italic">
                            No volunteering activities found.
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                            {activities.map((act) => {
                              const count = participations.filter((p) => p.activityId === act.id).length;
                              const isSelected = selectedRosterItemId === act.id;
                              return (
                                <div
                                  key={act.id}
                                  onClick={() => setSelectedRosterItemId(act.id)}
                                  className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer ${
                                    isSelected
                                      ? "bg-[#22C55E]/5 border-[#22C55E]"
                                      : "bg-[#111815] border-[#232B27] hover:border-zinc-500"
                                  }`}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400">
                                      {act.category}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                                      act.status === "Active" ? "bg-green-500/10 text-[#4ADE80]" :
                                      act.status === "Completed" ? "bg-zinc-500/10 text-zinc-400" : "bg-amber-500/10 text-amber-400"
                                    }`}>
                                      {act.status}
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-semibold text-[#F3F4F1] mb-1 line-clamp-1">{act.title}</h4>
                                  <div className="text-[11px] text-[#9CA3AF] flex justify-between mt-3 pt-2 border-t border-[#232B27]">
                                    <span>{act.department || "All Depts"}</span>
                                    <span className="font-mono text-[#4ADE80] font-bold">{count} Enrolled</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )
                      ) : (
                        trainings.length === 0 ? (
                          <div className="bg-[#111815] border border-[#232B27] rounded-xl p-6 text-center text-xs text-[#9CA3AF] italic">
                            No training programs found.
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                            {trainings.map((prog) => {
                              const count = trainingCompletions.filter((c) => c.trainingId === prog.id).length;
                              const isSelected = selectedRosterItemId === prog.id;
                              return (
                                <div
                                  key={prog.id}
                                  onClick={() => setSelectedRosterItemId(prog.id)}
                                  className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer ${
                                    isSelected
                                      ? "bg-[#22C55E]/5 border-[#22C55E]"
                                      : "bg-[#111815] border-[#232B27] hover:border-zinc-500"
                                  }`}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400">
                                      {prog.category}
                                    </span>
                                    {prog.mandatory && (
                                      <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-red-500/10 text-red-400 font-bold uppercase">
                                        Mandatory
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-sm font-semibold text-[#F3F4F1] mb-1 line-clamp-1">{prog.title}</h4>
                                  <div className="text-[11px] text-[#9CA3AF] flex justify-between mt-3 pt-2 border-t border-[#232B27]">
                                    <span>{prog.department || "All Depts"}</span>
                                    <span className="font-mono text-purple-400 font-bold">{count} Completed</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )
                      )}
                    </div>

                    {/* Right: Roster Detail View */}
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">
                        Registered Participants List
                      </h3>
                      {!selectedRosterItemId ? (
                        <div className="bg-[#111815] border border-[#232B27] rounded-xl p-12 text-center text-[#9CA3AF] text-sm h-[300px] flex flex-col justify-center items-center">
                          <svg className="w-12 h-12 text-[#232B27] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Select a program or activity from the left panel to inspect the employee roster list.
                        </div>
                      ) : (
                        <div className="bg-[#111815] border border-[#232B27] rounded-xl overflow-hidden animate-fade-in">
                          {rosterType === "volunteering" ? (
                            (() => {
                              const roster = participations.filter((p) => p.activityId === selectedRosterItemId);
                              const targetActivity = activities.find((a) => a.id === selectedRosterItemId);
                              if (roster.length === 0) {
                                return (
                                  <div className="p-12 text-center text-sm text-[#9CA3AF] italic">
                                    No employee has registered for "{targetActivity?.title}" yet.
                                  </div>
                                );
                              }
                              return (
                                <div>
                                  <div className="bg-[#0F1512] px-6 py-4 border-b border-[#232B27] flex justify-between items-center">
                                    <h4 className="text-sm font-semibold text-[#F3F4F1]">{targetActivity?.title} Roster</h4>
                                    <span className="text-xs font-mono text-[#9CA3AF]">
                                      Total Enrolled: <strong className="text-[#22C55E]">{roster.length}</strong>
                                    </span>
                                  </div>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                      <thead>
                                        <tr className="bg-[#0B0F0D] border-b border-[#232B27] text-[#9CA3AF] font-mono uppercase text-[10px]">
                                          <th className="p-4">Employee</th>
                                          <th className="p-4">Department</th>
                                          <th className="p-4">Evidence link</th>
                                          <th className="p-4">Status</th>
                                          <th className="p-4 text-right">Points</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-[#232B27]">
                                        {roster.map((p) => (
                                          <tr key={p.id} className="hover:bg-[#0F1512]/50 transition-colors">
                                            <td className="p-4">
                                              <div className="font-semibold text-[#F3F4F1]">{p.employeeName}</div>
                                              <div className="text-[10px] text-[#9CA3AF] font-mono">{p.employeeId}</div>
                                            </td>
                                            <td className="p-4 text-[#9CA3AF]">{p.department}</td>
                                            <td className="p-4">
                                              {p.proof ? (
                                                <a href={p.proof} target="_blank" rel="noopener noreferrer" className="text-[#22C55E] hover:underline font-mono">
                                                  View Link
                                                </a>
                                              ) : (
                                                <span className="text-zinc-500 italic">No proof</span>
                                              )}
                                            </td>
                                            <td className="p-4">
                                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                                                p.approvalStatus === "Approved" ? "bg-[#22C55E]/10 text-[#22C55E]" :
                                                p.approvalStatus === "Rejected" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-amber-500/10 text-amber-500"
                                              }`}>
                                                {p.approvalStatus}
                                              </span>
                                            </td>
                                            <td className="p-4 font-mono font-bold text-amber-500 text-right">{p.pointsEarned} pts</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              );
                            })()
                          ) : (
                            (() => {
                              const roster = trainingCompletions.filter((c) => c.trainingId === selectedRosterItemId);
                              const targetProgram = trainings.find((t) => t.id === selectedRosterItemId);
                              if (roster.length === 0) {
                                return (
                                  <div className="p-12 text-center text-sm text-[#9CA3AF] italic">
                                    No completions logged for "{targetProgram?.title}" yet.
                                  </div>
                                );
                              }
                              return (
                                <div>
                                  <div className="bg-[#0F1512] px-6 py-4 border-b border-[#232B27] flex justify-between items-center">
                                    <h4 className="text-sm font-semibold text-[#F3F4F1]">{targetProgram?.title} Roster</h4>
                                    <span className="text-xs font-mono text-[#9CA3AF]">
                                      Total Completed: <strong className="text-purple-400">{roster.length}</strong>
                                    </span>
                                  </div>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                      <thead>
                                        <tr className="bg-[#0B0F0D] border-b border-[#232B27] text-[#9CA3AF] font-mono uppercase text-[10px]">
                                          <th className="p-4">Employee</th>
                                          <th className="p-4">Department</th>
                                          <th className="p-4">Completion Date</th>
                                          <th className="p-4">Certificate</th>
                                          <th className="p-4 text-right">Score</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-[#232B27]">
                                        {roster.map((comp) => (
                                          <tr key={comp.id} className="hover:bg-[#0F1512]/50 transition-colors">
                                            <td className="p-4">
                                              <div className="font-semibold text-[#F3F4F1]">{comp.employeeName}</div>
                                              <div className="text-[10px] text-[#9CA3AF] font-mono">{comp.employeeId}</div>
                                            </td>
                                            <td className="p-4 text-[#9CA3AF]">{comp.department}</td>
                                            <td className="p-4 text-[#9CA3AF]">
                                              {comp.completionDate ? new Date(comp.completionDate).toLocaleDateString() : "-"}
                                            </td>
                                            <td className="p-4">
                                              {comp.certificateUrl ? (
                                                <a href={comp.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-[#22C55E] hover:underline font-mono">
                                                  View PDF
                                                </a>
                                              ) : (
                                                <span className="text-zinc-500 italic">No cert</span>
                                              )}
                                            </td>
                                            <td className="p-4 font-mono font-bold text-purple-400 text-right">
                                              {comp.score != null ? `${comp.score}%` : "N/A"}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              );
                            })()
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals Dialog Section */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#111815] border border-[#232B27] rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-[#F3F4F1]">
                  {activeModal === "activity" && `Create CSR Activity (Step ${formStep}/2)`}
                  {activeModal === "register" && "Register Employee for Activity"}
                  {activeModal === "review" && "Review Participation Proof"}
                  {activeModal === "diversity" && "Record Diversity Metric"}
                  {activeModal === "training" && "Create Training Program"}
                  {activeModal === "completion" && "Record Training Completion"}
                </h3>
                {activeModal === "activity" && (
                  <p className="text-xs text-[#9CA3AF]">
                    {formStep === 1 ? "Provide basic title and description parameters." : "Define scheduled capacity dates and location details."}
                  </p>
                )}
              </div>
              <button
                onClick={() => { setActiveModal(null); setValidationErrors({}); }}
                className="text-[#9CA3AF] hover:text-[#F3F4F1] text-2xl transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Modal forms */}
            {activeModal === "activity" && (
              <form onSubmit={handleCreateActivity} className="space-y-4">
                {formStep === 1 ? (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tree Planting Campaign"
                        value={activityForm.title}
                        onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                        className={`w-full px-3 py-2 bg-[#0B0F0D] border rounded-lg text-sm text-[#F3F4F1] focus:ring-1 focus:ring-[#22C55E] ${validationErrors.title ? 'border-red-500' : 'border-[#232B27]'}`}
                      />
                      {validationErrors.title && <span className="text-[11px] text-red-400 mt-1 block">{validationErrors.title}</span>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Description</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="e.g. Volunteer to help plant trees in local municipal parks."
                        value={activityForm.description}
                        onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                        className={`w-full px-3 py-2 bg-[#0B0F0D] border rounded-lg text-sm text-[#F3F4F1] focus:ring-1 focus:ring-[#22C55E] ${validationErrors.description ? 'border-red-500' : 'border-[#232B27]'}`}
                      />
                      {validationErrors.description && <span className="text-[11px] text-red-400 mt-1 block">{validationErrors.description}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Category</label>
                        <select
                          value={activityForm.category}
                          onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                        >
                          <option value="Environment">Environment</option>
                          <option value="Community">Community</option>
                          <option value="Education">Education</option>
                          <option value="Health">Health</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Target Department</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Operations"
                          value={activityForm.department}
                          onChange={(e) => setActivityForm({ ...activityForm, department: e.target.value })}
                          className={`w-full px-3 py-2 bg-[#0B0F0D] border rounded-lg text-sm text-[#F3F4F1] ${validationErrors.department ? 'border-red-500' : 'border-[#232B27]'}`}
                        />
                        {validationErrors.department && <span className="text-[11px] text-red-400 mt-1 block">{validationErrors.department}</span>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Organizer</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Liam Chen"
                        value={activityForm.organizer}
                        onChange={(e) => setActivityForm({ ...activityForm, organizer: e.target.value })}
                        className={`w-full px-3 py-2 bg-[#0B0F0D] border rounded-lg text-sm text-[#F3F4F1] ${validationErrors.organizer ? 'border-red-500' : 'border-[#232B27]'}`}
                      />
                      {validationErrors.organizer && <span className="text-[11px] text-red-400 mt-1 block">{validationErrors.organizer}</span>}
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full py-2.5 rounded-lg bg-[#22C55E] text-[#0B0F0D] font-bold text-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] mt-4"
                    >
                      Next Step
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Location</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sector 4 Park"
                          value={activityForm.location}
                          onChange={(e) => setActivityForm({ ...activityForm, location: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Date</label>
                        <input
                          type="date"
                          required
                          value={activityForm.date}
                          onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Duration (Hours)</label>
                        <input
                          type="number"
                          required
                          step="0.5"
                          placeholder="e.g. 3.5"
                          value={activityForm.durationHours}
                          onChange={(e) => setActivityForm({ ...activityForm, durationHours: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Max Capacity</label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 20"
                          value={activityForm.maxParticipants}
                          onChange={(e) => setActivityForm({ ...activityForm, maxParticipants: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Status</label>
                      <select
                        value={activityForm.status}
                        onChange={(e) => setActivityForm({ ...activityForm, status: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                      >
                        <option value="Draft">Draft (Hidden from registrations)</option>
                        <option value="Active">Active (Open to registrations)</option>
                      </select>
                    </div>

                    <div className="flex gap-4 mt-6">
                      <button
                        type="button"
                        onClick={() => setFormStep(1)}
                        className="flex-1 py-2.5 rounded-lg border border-[#232B27] text-zinc-400 font-bold text-sm transition-all duration-150 hover:bg-[#0F1512]"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting !== null}
                        className="flex-1 py-2.5 rounded-lg bg-[#22C55E] text-[#0B0F0D] font-bold text-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] hover:opacity-90 disabled:opacity-50"
                      >
                        {isSubmitting === "activity" ? (
                          <>
                            {renderLoadingSpinner()}
                            Creating...
                          </>
                        ) : (
                          "Create CSR Activity"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}

            {activeModal === "register" && (
              <form onSubmit={handleRegisterParticipation} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Select Active CSR Activity</label>
                  <select
                    required
                    value={registerForm.activityId}
                    onChange={(e) => setRegisterForm({ ...registerForm, activityId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                  >
                    <option value="">-- Choose Activity --</option>
                    {activities
                      .filter((a) => a.status === "Active")
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.title} ({a.category} - {a.department})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Employee Name</label>
                    <input
                      type="text"
                      required
                      value={registerForm.employeeName}
                      onChange={(e) => setRegisterForm({ ...registerForm, employeeName: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Employee ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. EMP-009"
                      value={registerForm.employeeId}
                      onChange={(e) => setRegisterForm({ ...registerForm, employeeId: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Department</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engineering"
                    value={registerForm.department}
                    onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                  />
                </div>
                
                {/* Drag and Drop dropzone */}
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-2 flex items-center justify-between">
                    <span>Evidence Attachment (Proof URL)</span>
                    <span className="text-[10px] text-amber-500 lowercase">mandatory for approval</span>
                  </label>
                  
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, "proof")}
                    onClick={() => triggerMockInputClick("proof")}
                    className={`w-full py-6 px-4 bg-[#0B0F0D] border border-dashed rounded-lg text-center cursor-pointer transition-all duration-150 ${
                      isDragging ? "border-[#22C55E] bg-[#22C55E]/5" : "border-[#232B27] hover:border-zinc-500"
                    }`}
                  >
                    <svg className="w-8 h-8 text-zinc-500 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                    </svg>
                    <span className="text-xs text-[#9CA3AF] block font-medium">
                      {draggedFile ? `Selected: ${draggedFile}` : "Drag & drop evidence file here, or click to attach simulated proof"}
                    </span>
                    <span className="text-[10px] text-zinc-500 mt-1 block">Supports PNG, JPG, PDF up to 5MB</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting !== null}
                  className="w-full py-2.5 rounded-lg bg-[#22C55E] text-[#0B0F0D] font-bold text-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] hover:opacity-90 disabled:opacity-50 mt-4"
                >
                  {isSubmitting === "register" ? (
                    <>
                      {renderLoadingSpinner()}
                      Registering...
                    </>
                  ) : (
                    "Register Employee"
                  )}
                </button>
              </form>
            )}

            {activeModal === "review" && (
              <form onSubmit={handleReviewParticipation} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Decision</label>
                    <select
                      value={reviewForm.decision}
                      onChange={(e) => setReviewForm({ ...reviewForm, decision: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                    >
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Reviewed By</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Liam Chen"
                      value={reviewForm.reviewedBy}
                      onChange={(e) => setReviewForm({ ...reviewForm, reviewedBy: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                    />
                  </div>
                </div>

                {reviewForm.decision === "Approved" ? (
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Award Points</label>
                    <input
                      type="number"
                      required
                      value={reviewForm.pointsEarned}
                      onChange={(e) => setReviewForm({ ...reviewForm, pointsEarned: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Rejection Reason</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Specify why the proof evidence was rejected."
                      value={reviewForm.reason}
                      onChange={(e) => setReviewForm({ ...reviewForm, reason: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting !== null}
                  className="w-full py-2.5 rounded-lg bg-[#22C55E] text-[#0B0F0D] font-bold text-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] hover:opacity-90 disabled:opacity-50 mt-4"
                >
                  {isSubmitting === "review" ? (
                    <>
                      {renderLoadingSpinner()}
                      Submitting Review...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </form>
            )}

            {activeModal === "diversity" && (
              <form onSubmit={handleCreateDiversity} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Department</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Operations"
                      value={diversityForm.department}
                      onChange={(e) => setDiversityForm({ ...diversityForm, department: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Category</label>
                    <select
                      value={diversityForm.category}
                      onChange={(e) => setDiversityForm({ ...diversityForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                    >
                      <option value="Gender">Gender</option>
                      <option value="Ethnicity">Ethnicity</option>
                      <option value="Age Group">Age Group</option>
                      <option value="Disability">Disability</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Female, White, 25-34"
                    value={diversityForm.label}
                    onChange={(e) => setDiversityForm({ ...diversityForm, label: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Value (Count)</label>
                    <input
                      type="number"
                      required
                      value={diversityForm.value}
                      onChange={(e) => setDiversityForm({ ...diversityForm, value: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Total in Department</label>
                    <input
                      type="number"
                      required
                      value={diversityForm.total}
                      onChange={(e) => setDiversityForm({ ...diversityForm, total: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Reporting Period</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Q2 2025"
                      value={diversityForm.period}
                      onChange={(e) => setDiversityForm({ ...diversityForm, period: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Year</label>
                    <input
                      type="number"
                      required
                      value={diversityForm.year}
                      onChange={(e) => setDiversityForm({ ...diversityForm, year: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting !== null}
                  className="w-full py-2.5 rounded-lg bg-[#22C55E] text-[#0B0F0D] font-bold text-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] hover:opacity-90 disabled:opacity-50 mt-4"
                >
                  {isSubmitting === "diversity" ? (
                    <>
                      {renderLoadingSpinner()}
                      Saving...
                    </>
                  ) : (
                    "Save Diversity Metric"
                  )}
                </button>
              </form>
            )}

            {activeModal === "training" && (
              <form onSubmit={handleCreateTraining} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={trainingForm.title}
                    onChange={(e) => setTrainingForm({ ...trainingForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Description</label>
                  <textarea
                    required
                    rows={2}
                    value={trainingForm.description}
                    onChange={(e) => setTrainingForm({ ...trainingForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Category</label>
                    <select
                      value={trainingForm.category}
                      onChange={(e) => setTrainingForm({ ...trainingForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                    >
                      <option value="ESG Awareness">ESG Awareness</option>
                      <option value="Safety">Safety</option>
                      <option value="Compliance">Compliance</option>
                      <option value="DEI">DEI</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Department</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. All, Operations"
                      value={trainingForm.department}
                      onChange={(e) => setTrainingForm({ ...trainingForm, department: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Trainer</label>
                    <input
                      type="text"
                      required
                      value={trainingForm.trainer}
                      onChange={(e) => setTrainingForm({ ...trainingForm, trainer: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Duration (Hours)</label>
                    <input
                      type="number"
                      required
                      value={trainingForm.durationHours}
                      onChange={(e) => setTrainingForm({ ...trainingForm, durationHours: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={trainingForm.startDate}
                      onChange={(e) => setTrainingForm({ ...trainingForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={trainingForm.endDate}
                      onChange={(e) => setTrainingForm({ ...trainingForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Max Capacity</label>
                    <input
                      type="number"
                      required
                      value={trainingForm.maxCapacity}
                      onChange={(e) => setTrainingForm({ ...trainingForm, maxCapacity: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      id="mandatory"
                      checked={trainingForm.mandatory}
                      onChange={(e) => setTrainingForm({ ...trainingForm, mandatory: e.target.checked })}
                      className="w-4 h-4 rounded text-[#22C55E] focus:ring-[#22C55E] bg-[#0B0F0D] border-[#232B27]"
                    />
                    <label htmlFor="mandatory" className="text-sm font-semibold text-[#9CA3AF]">Mandatory Program</label>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting !== null}
                  className="w-full py-2.5 rounded-lg bg-[#22C55E] text-[#0B0F0D] font-bold text-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] hover:opacity-90 disabled:opacity-50 mt-4"
                >
                  {isSubmitting === "training" ? (
                    <>
                      {renderLoadingSpinner()}
                      Creating...
                    </>
                  ) : (
                    "Create Program"
                  )}
                </button>
              </form>
            )}

            {activeModal === "completion" && (
              <form onSubmit={handleCreateCompletion} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Select Training Program</label>
                  <select
                    required
                    value={completionForm.trainingId}
                    onChange={(e) => setCompletionForm({ ...completionForm, trainingId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                  >
                    <option value="">-- Choose Training --</option>
                    {trainings.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Employee Name</label>
                    <input
                      type="text"
                      required
                      value={completionForm.employeeName}
                      onChange={(e) => setCompletionForm({ ...completionForm, employeeName: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Employee ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. EMP-001"
                      value={completionForm.employeeId}
                      onChange={(e) => setCompletionForm({ ...completionForm, employeeId: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Department</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Procurement"
                      value={completionForm.department}
                      onChange={(e) => setCompletionForm({ ...completionForm, department: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Completion Score (%)</label>
                    <input
                      type="number"
                      placeholder="e.g. 90"
                      value={completionForm.score}
                      onChange={(e) => setCompletionForm({ ...completionForm, score: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Status</label>
                    <select
                      value={completionForm.status}
                      onChange={(e) => setCompletionForm({ ...completionForm, status: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0B0F0D] border border-[#232B27] rounded-lg text-sm text-[#F3F4F1]"
                    >
                      <option value="Completed">Completed</option>
                      <option value="Failed">Failed</option>
                      <option value="In Progress">In Progress</option>
                    </select>
                  </div>
                  
                  {/* Drag and Drop dropzone for training completion certificate */}
                  <div>
                    <label className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Certificate Attachment</label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, "certificate")}
                      onClick={() => triggerMockInputClick("certificate")}
                      className={`w-full py-4 px-3 bg-[#0B0F0D] border border-dashed rounded-lg text-center cursor-pointer transition-all duration-150 ${
                        isDragging ? "border-[#22C55E] bg-[#22C55E]/5" : "border-[#232B27] hover:border-zinc-500"
                      }`}
                    >
                      <span className="text-[11px] text-[#9CA3AF] block">
                        {draggedFile ? `Attached: ${draggedFile}` : "Drag PDF or click to attach mock certificate"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting !== null}
                  className="w-full py-2.5 rounded-lg bg-[#22C55E] text-[#0B0F0D] font-bold text-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] hover:opacity-90 disabled:opacity-50 mt-4"
                >
                  {isSubmitting === "completion" ? (
                    <>
                      {renderLoadingSpinner()}
                      Recording...
                    </>
                  ) : (
                    "Record Completion"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
