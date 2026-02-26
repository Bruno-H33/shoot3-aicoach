import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Lock, Star, Zap, Brain, Shield, ShieldCheck } from "lucide-react";
import previewReport from "@/assets/preview-report-sniper.png";
import previewTracking from "@/assets/preview-tracking.jpg";

interface SniperEliteModalProps {
  open: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  loading?: boolean;
}

const SniperEliteModal = ({ open, onClose, onSubscribe, loading }: SniperEliteModalProps) => {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-md mx-auto border-primary/30 p-0 overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{
          background: "linear-gradient(180deg, rgba(15,6,1,0.99) 0%, rgba(30,12,2,0.97) 50%, rgba(10,4,1,0.99) 100%)",
          boxShadow: "0 0 0 1px hsl(var(--primary) / 0.4), 0 0 40px hsl(var(--primary) / 0.15)",
        }}
      >
        <div className="px-6 pt-6 pb-2">
          {/* Header */}
          <DialogHeader className="space-y-3 mb-4">
            <div className="flex items-center justify-center gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <DialogTitle className="font-sport text-2xl text-foreground tracking-wider text-center">
              PROGRAMME SNIPER ELITE
            </DialogTitle>
            {/* Testimonial */}
            <DialogDescription asChild>
              <div className="text-center space-y-1.5 pt-1">
                <p className="font-body text-[11px] italic text-foreground/60 leading-relaxed px-2">
                  "J'ai gagné 25% de réussite à 3 points et corrigé mon coude en 4 semaines."
                </p>
                <p className="font-body text-[10px] text-primary/70 font-semibold tracking-wide">
                  — Nathan, 18 ans
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>

          {/* Promise */}
          <p className="font-body text-sm text-foreground/90 leading-relaxed text-center mb-5">
            Ne laisse plus ton tir au hasard. En <span className="text-primary font-semibold">90 jours</span>, transforme ta mécanique, augmente ta vitesse de déclenchement et débloque ton{" "}
            <span className="text-primary font-semibold">Shoot3 ID Certifié</span> pour les recruteurs.
          </p>

          {/* Program details */}
          <div className="space-y-3 mb-5">
            {[
              { icon: Zap, month: "Mois 1", label: "Biomécanique & Vitesse de réaction" },
              { icon: Brain, month: "Mois 2", label: "Prise de décision sous fatigue" },
              { icon: Shield, month: "Mois 3", label: "Résistance à la pression & Certification" },
            ].map(({ icon: Icon, month, label }) => (
              <div
                key={month}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "hsl(var(--primary) / 0.08)", border: "1px solid hsl(var(--primary) / 0.15)" }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "hsl(var(--primary) / 0.2)" }}>
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="font-sport text-xs text-primary tracking-wider">{month}</span>
                  <p className="font-body text-xs text-foreground/80">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Visual Preview */}
          <div className="mb-5">
            <p className="font-body text-[10px] text-muted-foreground tracking-widest uppercase mb-2.5">
              Ce que tu vas recevoir :
            </p>
            <div className="flex gap-3">
              <div className="flex-1 rounded-xl overflow-hidden border border-white/10">
                <img src={previewReport} alt="Aperçu du rapport PDF hebdomadaire" className="w-full h-24 object-cover" />
                <p className="font-body text-[9px] text-muted-foreground text-center py-1.5 bg-black/40">Plan de semaine</p>
              </div>
              <div className="flex-1 rounded-xl overflow-hidden border border-white/10">
                <img src={previewTracking} alt="Aperçu du tracking IA biomécanique" className="w-full h-24 object-cover" />
                <p className="font-body text-[9px] text-muted-foreground text-center py-1.5 bg-black/40">Tracking IA</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA + Reassurance */}
        <div className="px-6 pb-6 space-y-2.5">
          <button
            onClick={onSubscribe}
            disabled={loading}
            className="btn-primary w-full text-base py-3.5 font-sport tracking-wider disabled:opacity-50"
          >
            {loading ? "CHARGEMENT..." : "ACCÉDER AU BOOTCAMP — 49.99€"}
          </button>

          <div className="flex items-center justify-center gap-2">
            <Lock className="w-3 h-3 text-muted-foreground" />
            <span className="font-body text-[10px] text-muted-foreground">
              Paiement unique et 100% sécurisé via Stripe
            </span>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-muted-foreground/60" />
            <span className="font-body text-[9px] text-muted-foreground/60 leading-tight">
              Garantie de progression : Satisfait ou remboursé sous 14 jours si ta mécanique ne s'améliore pas.
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SniperEliteModal;
