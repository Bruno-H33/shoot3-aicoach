import { useState, useEffect } from "react";
import { ArrowLeft, Target, Dumbbell, Calendar, Flame, ChevronDown, ChevronUp, Camera, Download, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ReportViewProps {
  analysisId: string;
  onBack: () => void;
}

interface Exercise {
  name: string;
  duration: string;
  description: string;
  target: string;
}

interface Strength {
  title: string;
  detail: string;
}

interface Diagnosis {
  title: string;
  severity: string;
  what: string;
  why: string;
  fix: string;
}

interface DayPlan {
  day: string;
  focus: string;
  exercises: string[];
}

interface Report {
  player_name: string;
  score: number;
  score_label: string;
  intro: string;
  strengths: Strength[];
  diagnosis: Diagnosis[];
  exercises: Exercise[];
  weekly_plan: { description: string; days: DayPlan[] };
  motivation: string;
}

const ReportView = ({ analysisId, onBack }: ReportViewProps) => {
  const [report, setReport] = useState<Report | null>(null);
  const [framesUrls, setFramesUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDiag, setExpandedDiag] = useState<number | null>(0);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // Fetch frames URLs from the analysis record
        const { data: analysisData } = await supabase
          .from("analyses")
          .select("frames_urls")
          .eq("id", analysisId)
          .single();
        if (analysisData?.frames_urls) {
          setFramesUrls(analysisData.frames_urls as string[]);
        }

        const { data, error: fnError } = await supabase.functions.invoke("generate-report", {
          body: { analysisId },
        });
        if (fnError) throw fnError;
        if (data?.report) setReport(data.report);
        else throw new Error("No report data");
      } catch (err: any) {
        setError(err.message || "Erreur lors de la génération");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [analysisId]);

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-primary";
    return "text-red-400";
  };

  const severityBadge = (s: string) => {
    if (s === "high") return "bg-red-500/20 text-red-400 border-red-500/30";
    if (s === "medium") return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  };

  if (loading) {
    return (
      <div className="mobile-container flex flex-col bg-background min-h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <p className="font-sport text-2xl text-foreground mb-2">GÉNÉRATION DU RAPPORT</p>
            <p className="font-body text-sm text-muted-foreground">L'IA analyse tes résultats en profondeur...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="mobile-container flex flex-col bg-background min-h-dvh items-center justify-center px-8">
        <p className="font-sport text-2xl text-foreground mb-4">ERREUR</p>
        <p className="font-body text-sm text-muted-foreground mb-6">{error || "Rapport introuvable"}</p>
        <button onClick={onBack} className="btn-primary">RETOUR</button>
      </div>
    );
  }

  return (
    <div className="mobile-container flex flex-col bg-background min-h-dvh">
      <div className="flex-1 overflow-y-auto pb-10">
        {/* Header */}
        <div className="px-5 pt-12 pb-6">
          <div className="flex items-center justify-between mb-6 no-print">
            <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground active:opacity-70">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-body text-sm">Retour</span>
            </button>
            <button
              onClick={() => {
                window.print();
              }}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-body text-xs font-semibold tracking-wider active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-body text-xs text-primary font-semibold tracking-widest uppercase">Rapport Complet</span>
          </div>
          <h1 className="font-sport text-4xl text-foreground">
            {report.player_name.toUpperCase()}
          </h1>
        </div>

        {/* Score card */}
        <div className="px-5 mb-6">
          <div
            className="rounded-2xl p-6 border border-white/10"
            style={{ background: "rgba(10,10,10,0.9)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-body text-xs text-muted-foreground tracking-widest uppercase mb-1">Score Global</p>
                <p className={`font-sport text-6xl ${scoreColor(report.score)}`}>
                  {report.score}<span className="text-2xl text-muted-foreground">/100</span>
                </p>
              </div>
              <div className="text-right">
                <span className={`font-body text-sm font-bold ${scoreColor(report.score)}`}>
                  {report.score_label}
                </span>
              </div>
            </div>
            <p className="font-body text-sm text-foreground/80 leading-relaxed">{report.intro}</p>
          </div>
        </div>

        {/* Key Frames */}
        {framesUrls.length > 0 && (
          <div className="px-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="w-4 h-4 text-primary" />
              <h2 className="font-sport text-2xl text-foreground tracking-wider">FRAMES CLÉS</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
              {framesUrls.map((url, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-28 h-40 rounded-xl overflow-hidden border border-white/10 snap-start"
                >
                  <img
                    src={url}
                    alt={`Frame ${i + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths */}
        {report.strengths && report.strengths.length > 0 && (
          <div className="px-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <h2 className="font-sport text-2xl text-foreground tracking-wider">POINTS FORTS</h2>
            </div>
            <div className="space-y-3">
              {report.strengths.map((s, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-4 border border-green-500/20"
                  style={{ background: "rgba(10,10,10,0.9)" }}
                >
                  <h3 className="font-sport text-lg text-green-400 mb-2">{s.title}</h3>
                  <p className="font-body text-sm text-foreground/80 leading-relaxed">{s.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diagnosis */}
        {report.diagnosis.length > 0 && (
          <div className="px-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-primary" />
              <h2 className="font-sport text-2xl text-foreground tracking-wider">DIAGNOSTIC</h2>
            </div>
            <div className="space-y-3">
              {report.diagnosis.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setExpandedDiag(expandedDiag === i ? null : i)}
                  className="w-full text-left rounded-2xl p-4 border border-white/10 transition-all"
                  style={{ background: "rgba(10,10,10,0.9)" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`font-body text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full border uppercase ${severityBadge(d.severity)}`}>
                        {d.severity === "high" ? "Critique" : d.severity === "medium" ? "Moyen" : "Mineur"}
                      </span>
                      <span className="font-sport text-lg text-foreground">{d.title}</span>
                    </div>
                    {expandedDiag === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  {expandedDiag === i && (
                    <div className="mt-4 space-y-3 animate-fade-in-up">
                      <div>
                        <p className="font-body text-xs text-muted-foreground tracking-widest uppercase mb-1">Ce qu'on observe</p>
                        <p className="font-body text-sm text-foreground/80">{d.what}</p>
                      </div>
                      <div>
                        <p className="font-body text-xs text-muted-foreground tracking-widest uppercase mb-1">Pourquoi c'est un problème</p>
                        <p className="font-body text-sm text-foreground/80">{d.why}</p>
                      </div>
                      <div>
                        <p className="font-body text-xs text-primary tracking-widest uppercase mb-1">Comment corriger</p>
                        <p className="font-body text-sm text-foreground">{d.fix}</p>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Exercises */}
        <div className="px-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="w-4 h-4 text-primary" />
            <h2 className="font-sport text-2xl text-foreground tracking-wider">EXERCICES CORRECTIFS</h2>
          </div>
          <div className="space-y-3">
            {report.exercises.map((ex, i) => (
              <div
                key={i}
                className="rounded-2xl p-4 border border-white/10"
                style={{ background: "rgba(10,10,10,0.9)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-sport text-lg text-foreground">{ex.name}</h3>
                  <span className="font-body text-xs text-primary border border-primary/30 px-2 py-0.5 rounded-full">{ex.duration}</span>
                </div>
                <p className="font-body text-sm text-foreground/70 leading-relaxed mb-2">{ex.description}</p>
                <p className="font-body text-[10px] text-muted-foreground tracking-widest uppercase">
                  Cible : {ex.target}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Plan */}
        <div className="px-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-primary" />
            <h2 className="font-sport text-2xl text-foreground tracking-wider">PLAN SEMAINE</h2>
          </div>
          <p className="font-body text-sm text-muted-foreground mb-4">{report.weekly_plan.description}</p>
          <div className="space-y-2">
            {report.weekly_plan.days.map((day, i) => (
              <div
                key={i}
                className="rounded-xl p-3 flex items-start gap-3 border border-white/5"
                style={{ background: day.exercises.length > 0 ? "rgba(10,10,10,0.8)" : "rgba(10,10,10,0.4)" }}
              >
                <div className="w-16 flex-shrink-0">
                  <p className="font-sport text-sm text-primary">{day.day.slice(0, 3).toUpperCase()}</p>
                </div>
                <div className="flex-1">
                  <p className="font-body text-xs text-foreground/80 font-semibold">{day.focus}</p>
                  {day.exercises.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {day.exercises.map((ex, j) => (
                        <span key={j} className="font-body text-[10px] text-muted-foreground border border-white/10 px-2 py-0.5 rounded-full">{ex}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Motivation */}
        <div className="px-5 mb-8">
          <div
            className="rounded-2xl p-6 border border-primary/30"
            style={{ background: "linear-gradient(135deg, rgba(20,8,2,0.98), rgba(45,18,4,0.95))" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-primary" />
              <h2 className="font-sport text-xl text-foreground tracking-wider">LE MOT DU COACH</h2>
            </div>
            <p className="font-body text-sm text-foreground/90 leading-relaxed italic">
              "{report.motivation}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
