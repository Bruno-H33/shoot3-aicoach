import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Lock, Star, Users, Trophy, Zap, Tv } from "lucide-react";
import previewReport from "@/assets/preview-report-passteam.png";
import previewTracking from "@/assets/preview-tracking.jpg";

interface PassTeamModalProps {
  open: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  loading?: boolean;
}

const PassTeamModal = ({ open, onClose, onSubscribe, loading }: PassTeamModalProps) => {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-md mx-auto border-blue-500/30 p-0 overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{
          background: "linear-gradient(180deg, rgba(5,8,18,0.99) 0%, rgba(10,14,28,0.97) 50%, rgba(4,6,14,0.99) 100%)",
          boxShadow: "0 0 0 1px rgba(59,130,246,0.3), 0 0 40px rgba(59,130,246,0.1)",
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
              PASS TEAM SHOOT3
            </DialogTitle>
            {/* Testimonial */}
            <DialogDescription asChild>
              <div className="text-center space-y-1.5 pt-1">
                <p className="font-body text-[11px] italic text-foreground/60 leading-relaxed px-2">
                  "Le vestiaire m'a motivé comme jamais. En 3 semaines, j'ai plus progressé qu'en 6 mois seul."
                </p>
                <p className="font-body text-[10px] text-blue-400/70 font-semibold tracking-wide">
                  — Léo, U15 R2
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>

          {/* Promise */}
          <p className="font-body text-sm text-foreground/90 leading-relaxed text-center mb-5">
            Rejoins une communauté de shooteurs déterminés. <span className="text-blue-400 font-semibold">1 analyse par semaine</span>, des défis quotidiens, et ton{" "}
            <span className="text-blue-400 font-semibold">Shoot3 ID Certifié</span> au bout de 3 mois.
          </p>

          {/* Features */}
          <div className="space-y-3 mb-5">
            {[
              { icon: Tv, label: "1 analyse biomécanique / semaine", detail: "Suivi continu de ta progression" },
              { icon: Users, label: "Le Vestiaire (Groupe privé)", detail: "Entraide, conseils, motivation" },
              { icon: Trophy, label: "Ligue Shoot3 & Défis", detail: "Classements et challenges hebdo" },
            ].map(({ icon: Icon, label, detail }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)" }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(59,130,246,0.15)" }}>
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <span className="font-sport text-xs text-blue-400 tracking-wider">{label}</span>
                  <p className="font-body text-xs text-foreground/70">{detail}</p>
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
                <img src={previewReport} alt="Aperçu du rapport d'analyse" className="w-full h-24 object-cover" />
                <p className="font-body text-[9px] text-muted-foreground text-center py-1.5 bg-black/40">Analyse hebdo</p>
              </div>
              <div className="flex-1 rounded-xl overflow-hidden border border-white/10">
                <img src={previewTracking} alt="Aperçu du tracking IA" className="w-full h-24 object-cover" />
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
            className="w-full text-base py-3.5 font-sport tracking-wider rounded-xl transition-all active:scale-98 disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.9), rgba(37,99,235,0.9))",
              color: "white",
              boxShadow: "0 0 20px rgba(59,130,246,0.3)",
            }}
          >
            {loading ? "CHARGEMENT..." : "REJOINDRE LA LIGUE — 19.99€/MOIS"}
          </button>

          <div className="flex items-center justify-center gap-2">
            <Lock className="w-3 h-3 text-muted-foreground" />
            <span className="font-body text-[10px] text-muted-foreground">
              Paiement 100% sécurisé
            </span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Zap className="w-3 h-3 text-muted-foreground" />
            <span className="font-body text-[10px] text-muted-foreground">
              Sans engagement : annule ton abonnement en 1 clic à tout moment
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PassTeamModal;
