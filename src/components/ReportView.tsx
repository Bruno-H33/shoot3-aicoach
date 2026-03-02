import { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";
import { ArrowLeft, Target, Dumbbell, Calendar, Flame, ChevronDown, ChevronUp, Camera, Download, CheckCircle, Crown, Zap, Users, Shield, Award, Check } from "lucide-react";
import AnnotatedFrame from "@/components/AnnotatedFrame";
import ScoreCard from "@/components/ScoreCard";
import { supabase } from "@/integrations/supabase/client";
import { loadLandmarker } from "@/hooks/usePoseLandmarker";

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
  frame_index?: number;
}

interface DayPlan {
  day: string;
  focus: string;
  exercises: string[];
}

interface Report {
  tir_valide?: boolean;
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
  const [bestFrameUrl, setBestFrameUrl] = useState<string | undefined>(undefined);
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
          const paths = analysisData.frames_urls as string[];
          // Generate signed URLs for private bucket access
          const signedUrls: string[] = [];
          for (const p of paths) {
            // If it's already a full URL (legacy public), use as-is; otherwise create signed URL
            if (p.startsWith("http")) {
              signedUrls.push(p);
            } else {
              const { data: signedData } = await supabase.storage
                .from("analysis-frames")
                .createSignedUrl(p, 3600); // 1 hour expiry
              if (signedData?.signedUrl) signedUrls.push(signedData.signedUrl);
            }
          }
          setFramesUrls(signedUrls);
        }

        const { data, error: fnError } = await supabase.functions.invoke("generate-report", {
          body: {
            analysisId,
            user_position: localStorage.getItem("s3_user_position") || "",
            user_goal: localStorage.getItem("s3_user_goal") || "",
          },
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

  // Find the apex frame (follow-through: wrists at highest Y position)
  useEffect(() => {
    if (framesUrls.length === 0) return;
    let cancelled = false;

    const findApexFrame = async () => {
      try {
        const landmarker = await loadLandmarker();
        let bestUrl = framesUrls[0];
        let lowestWristY = Infinity; // lower Y = higher on screen

        for (const url of framesUrls) {
          try {
            const img = new Image();
            img.crossOrigin = "anonymous";
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = () => reject();
              img.src = url;
            });
            const result = landmarker.detect(img);
            if (result.landmarks && result.landmarks.length > 0) {
              const lms = result.landmarks[0];
              // Wrist landmarks: 15 (left), 16 (right)
              const leftWrist = lms[15];
              const rightWrist = lms[16];
              const minY = Math.min(
                (leftWrist?.visibility ?? 0) > 0.3 ? leftWrist.y : Infinity,
                (rightWrist?.visibility ?? 0) > 0.3 ? rightWrist.y : Infinity
              );
              if (minY < lowestWristY) {
                lowestWristY = minY;
                bestUrl = url;
              }
            }
          } catch {
            // Skip this frame
          }
        }

        if (!cancelled) setBestFrameUrl(bestUrl);
      } catch {
        if (!cancelled) setBestFrameUrl(framesUrls[0]);
      }
    };

    findApexFrame();
    return () => { cancelled = true; };
  }, [framesUrls]);

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

  if (report.tir_valide === false) {
    return (
      <div className="mobile-container flex flex-col bg-background min-h-dvh items-center justify-center px-8 text-center">
        <p className="font-sport text-2xl text-foreground mb-4">ACTION NON RECONNUE</p>
        <p className="font-body text-sm text-muted-foreground mb-6">L'IA n'a pas détecté de tir de basketball valide dans ta vidéo. Veuillez refilmer ton tir debout, face au panier, avec le ballon visible.</p>
        <button onClick={onBack} className="btn-primary">REFILMER MON TIR</button>
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
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  try {
                    const content = document.querySelector('.mobile-container') as HTMLElement;
                    if (!content) throw new Error("No content");

                    const prevExpanded = expandedDiag;
                    content.classList.add('pdf-export-mode');
                    setExpandedDiag(-1);
                    await new Promise(r => setTimeout(r, 300));

                    const pdfBlob: Blob = await html2pdf()
                      .set({
                        margin: [5, 5, 5, 5],
                        filename: `bilan-shoot3-${report.player_name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
                        image: { type: 'jpeg', quality: 0.85 },
                        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#0a0a0a', ignoreElements: (el: Element) => el.hasAttribute('data-html2canvas-ignore') },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
                      })
                      .from(content)
                      .outputPdf('blob');

                    content.classList.remove('pdf-export-mode');
                    setExpandedDiag(prevExpanded);

                    // Force download
                    const url = URL.createObjectURL(pdfBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `bilan-shoot3-${report.player_name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  } catch (e: any) {
                    const cont = document.querySelector('.mobile-container');
                    if (cont) cont.classList.remove('pdf-export-mode');
                    setExpandedDiag(0);
                    if (e?.name !== 'AbortError') console.error("PDF download error:", e);
                  }
                }}
                className="flex items-center gap-2 border border-white/20 text-foreground px-3 py-2 rounded-xl font-body text-xs font-semibold tracking-wider active:scale-95 transition-all hover:bg-white/5"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={async () => {
                  try {
                    const content = document.querySelector('.mobile-container') as HTMLElement;
                    if (!content) throw new Error("No content");

                    // Expand all diagnosis sections for PDF
                    const prevExpanded = expandedDiag;
                    
                    
                    // Add print-friendly class
                    content.classList.add('pdf-export-mode');
                    // Force expand all diagnoses by setting state and waiting for render
                    setExpandedDiag(-1); // trigger to expand all via a special value
                    await new Promise(r => setTimeout(r, 300));

                    const pdfBlob: Blob = await html2pdf()
                      .set({
                        margin: [5, 5, 5, 5],
                        filename: `bilan-shoot3-${report.player_name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
                        image: { type: 'jpeg', quality: 0.85 },
                        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#0a0a0a', ignoreElements: (el: Element) => el.hasAttribute('data-html2canvas-ignore') },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
                      })
                      .from(content)
                      .outputPdf('blob');

                    // Restore state
                    content.classList.remove('pdf-export-mode');
                    setExpandedDiag(prevExpanded);
                    const file = new File([pdfBlob], `bilan-shoot3-${report.player_name.toLowerCase().replace(/\s+/g, '-')}.pdf`, { type: 'application/pdf' });

                    const shareData: ShareData = {
                      title: `Bilan Shoot3 - ${report.player_name}`,
                      text: "🚨 L'IA a analysé la mécanique de mon shoot ! Regarde mes défauts dans le PDF. Teste ton propre tir sur https://shoot3-aicoach.lovable.app 🏀",
                      files: [file],
                    };

                    if (navigator.canShare && navigator.canShare(shareData)) {
                      await navigator.share(shareData);
                    } else if (navigator.share) {
                      // Fallback: share without file
                      await navigator.share({ title: shareData.title, text: shareData.text, url: "https://shoot3-aicoach.lovable.app" });
                    } else {
                      // No share API: fallback to download
                      window.print();
                    }
                  } catch (e: any) {
                    // Restore state on error
                    const cont = document.querySelector('.mobile-container');
                    if (cont) cont.classList.remove('pdf-export-mode');
                    setExpandedDiag(0);
                    if (e.name !== 'AbortError') {
                      console.error("Share error:", e);
                      window.print();
                    }
                  }
                }}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-xl font-body text-xs font-semibold tracking-wider active:scale-95 transition-all"
                style={{ boxShadow: "0 0 12px rgba(255,77,0,0.3)" }}
              >
                <span>📲</span>
                Partager
              </button>
              <ScoreCard
                playerName={report.player_name}
                score={report.score}
                scoreLabel={report.score_label}
                bestFrameUrl={bestFrameUrl}
              />
            </div>
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
                  data-diag-index={i}
                  onClick={() => setExpandedDiag(expandedDiag === i ? null : i)}
                  className="w-full text-left rounded-2xl p-4 border border-white/10 transition-all break-inside-avoid"
                  style={{ background: "rgba(10,10,10,0.9)", pageBreakInside: "avoid" }}
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
                  {(expandedDiag === i || expandedDiag === -1) && (
                    <div className="mt-4 space-y-3 animate-fade-in-up">
                      {/* Frame — always shown if available */}
                      {d.frame_index !== undefined && framesUrls[d.frame_index] && (
                        <div className="rounded-xl overflow-hidden border border-primary/30 mb-3">
                          <AnnotatedFrame
                            imageUrl={framesUrls[d.frame_index]}
                            className="w-full h-auto"
                          />
                        </div>
                      )}
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

        {/* CTA Monetization Section — excluded from PDF */}
        {(() => {
          const userGoal = localStorage.getItem("s3_user_goal") || "progresser";

          const handleCheckout = async (plan: "team" | "elite") => {
            const priceMap = { team: "pass_team", elite: "sniper_elite" };
            try {
              const { data, error: fnErr } = await supabase.functions.invoke("create-checkout", {
                body: { plan: priceMap[plan] },
              });
              if (fnErr) throw fnErr;
              if (data?.url) window.location.href = data.url;
            } catch (e) {
              console.error("Checkout error:", e);
            }
          };

          return (
            <div className="px-5 mb-10" data-html2canvas-ignore="true">
              {/* Section Title */}
              <div className="text-center mb-8 pt-4">
                <h2 className="font-sport text-2xl text-foreground uppercase tracking-wider mb-2">
                  Prêt à atteindre ton objectif de {userGoal} ?
                </h2>
                <p className="font-body text-sm text-muted-foreground">
                  Choisis ton plan d'entraînement pour corriger ces défauts dès aujourd'hui.
                </p>
              </div>

              {/* Offer Cards */}
              <div className="space-y-4">
                {/* Card A: Pass Team */}
                <div
                  className="rounded-2xl p-5 border border-white/10 transition-all active:scale-[0.98]"
                  style={{ background: "rgba(10,10,10,0.9)" }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-5 h-5 text-blue-400" />
                    <h3 className="font-sport text-xl text-foreground tracking-wider">PASS TEAM</h3>
                  </div>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="font-sport text-3xl text-foreground">19.99€</span>
                    <span className="font-body text-sm text-muted-foreground">/ mois</span>
                    <span className="font-body text-xs text-muted-foreground ml-1">(sans engagement)</span>
                  </div>
                  <div className="space-y-2.5 mb-5">
                    {[
                      "1 Analyse IA par semaine",
                      "Challenges & Classements (Ligue)",
                      "Communauté active (Vestiaire)",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span className="font-body text-sm text-foreground/80">{item}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleCheckout("team")}
                    className="w-full py-3 rounded-xl border border-white/20 font-sport text-sm text-foreground tracking-widest uppercase hover:bg-white/5 active:scale-95 transition-all"
                  >
                    Rejoindre la Team
                  </button>
                </div>

                {/* Card B: Sniper Elite */}
                <div
                  className="rounded-2xl p-5 border border-primary/40 relative overflow-hidden transition-all active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(160deg, rgba(45,18,4,0.95), rgba(10,10,10,0.95))",
                    boxShadow: "0 0 25px rgba(255,77,0,0.15), 0 0 50px rgba(255,77,0,0.05)",
                  }}
                >
                  {/* Recommended Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-1 bg-primary/20 border border-primary/40 rounded-full px-2.5 py-1">
                      <Award className="w-3 h-3 text-primary" />
                      <span className="font-body text-[10px] text-primary font-bold tracking-wider uppercase">Recommandé par l'IA</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="w-5 h-5 text-primary" />
                    <h3 className="font-sport text-xl text-primary tracking-wider">SNIPER ELITE</h3>
                  </div>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="font-sport text-3xl text-foreground">49.99€</span>
                    <span className="font-body text-sm text-muted-foreground">paiement unique</span>
                  </div>
                  <div className="space-y-2.5 mb-5">
                    {[
                      "Bootcamp sur-mesure de 90 jours",
                      "12 Check-ups Biomécaniques IA",
                      "Obtention du Shoot3 ID Certifié",
                      "Inclus : Tous les avantages Pass Team",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="font-body text-sm text-foreground/80">{item}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleCheckout("elite")}
                    className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-sport text-sm tracking-widest uppercase active:scale-95 transition-all animate-pulse hover:animate-none"
                    style={{ boxShadow: "0 0 20px rgba(255,77,0,0.4)" }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4" />
                      Démarrer mon Programme Elite
                    </div>
                  </button>
                </div>
              </div>

              {/* Trust badge */}
              <div className="flex items-center justify-center gap-2 mt-6">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="font-body text-xs text-muted-foreground">Paiement 100% sécurisé.</span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default ReportView;
