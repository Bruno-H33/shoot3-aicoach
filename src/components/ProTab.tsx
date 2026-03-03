import { useState } from "react";
import { LogOut, Trash2, Shield, Target, Users, Zap, CircleCheck as CheckCircle2, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFreeTrial } from "@/hooks/useFreeTrial";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import SniperEliteModal from "@/components/SniperEliteModal";
import PassTeamModal from "@/components/PassTeamModal";
import { motion } from "framer-motion";

const PRICES = {
  rapport: "price_1T345HRKXHvnBBog0jfr2XdU",
  sniper: "price_1T347IRKXHvnBBog16QQGxBo",
  team: "price_1T3irvRKXHvnBBogPa9edglS",
};

interface ProTabProps {
  userName: string;
}

const ProTab = ({ userName }: ProTabProps) => {
  const { signOut } = useAuth();
  const { isActive: trialActive, daysRemaining } = useFreeTrial();
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [sniperModalOpen, setSniperModalOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const handleOfferClick = async (priceId: string) => {
    setCheckoutLoading(priceId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de créer la session de paiement",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="px-5 pb-4 space-y-6 animate-fade-in-up"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* User Profile Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-4 py-2">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, hsl(18 80% 30%), hsl(18 100% 45%))" }}
        >
          <span className="font-sport text-2xl text-foreground">{userName.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <h2 className="font-sport text-2xl text-foreground tracking-wider">{userName.toUpperCase()}</h2>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-body text-xs text-muted-foreground tracking-widest uppercase">
              {trialActive ? `Essai gratuit · ${daysRemaining}J restant${daysRemaining > 1 ? "s" : ""}` : "Profil Actif"}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="border-t border-white/8" />

      {/* Section Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-4 h-4 text-primary" />
          <p className="font-body text-xs text-primary tracking-widest uppercase font-semibold">Offres Premium</p>
        </div>
        <h3 className="font-sport text-3xl text-foreground leading-tight">
          CHOISIS TON <span className="text-primary">PROGRAMME</span>
        </h3>
        <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">
          Deux parcours adaptés à ton niveau et tes objectifs. Choisis celui qui te correspond.
        </p>
      </motion.div>

      {/* HERO OFFER - Sniper Elite */}
      <motion.div
        variants={itemVariants}
        className="rounded-3xl p-6 relative overflow-hidden border-2"
        style={{
          background: "linear-gradient(135deg, rgba(30, 12, 3, 0.98), rgba(50, 20, 5, 0.95))",
          borderColor: "hsl(var(--primary) / 0.6)",
          boxShadow: "0 0 40px hsl(var(--primary) / 0.25), 0 0 80px hsl(var(--primary) / 0.1)",
        }}
      >
        {/* Badge Hero */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
          <span className="font-body text-[9px] font-bold tracking-widest bg-primary text-primary-foreground px-3 py-1 rounded-full uppercase">
            RECOMMANDÉ
          </span>
          <span className="font-body text-[9px] font-bold tracking-widest bg-green-500/20 text-green-400 border border-green-500/40 px-3 py-1 rounded-full uppercase">
            BOOTCAMP 3 MOIS
          </span>
        </div>

        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 glow-orange"
            style={{ background: "hsl(var(--primary))" }}
          >
            <Target className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h4 className="font-sport text-2xl text-foreground tracking-wider mb-1">
              PROGRAMME SNIPER ELITE
            </h4>
            <p className="font-body text-sm text-primary/90 leading-relaxed">
              Transformation complète sur 3 mois · Plan d'entraînement adaptatif
            </p>
          </div>
        </div>

        {/* Pricing */}
        <div className="rounded-2xl p-4 mb-5 border border-primary/30" style={{ background: "rgba(0, 0, 0, 0.4)" }}>
          <div className="flex items-baseline justify-between mb-1">
            <span className="font-body text-sm text-foreground/70">Bootcamp complet 3 mois</span>
            <span className="font-sport text-lg text-foreground/40 line-through">69.99€</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-sport text-base text-primary">Prix de lancement</span>
            <div className="flex items-baseline gap-1">
              <span className="font-sport text-4xl text-primary">49.99€</span>
              <span className="font-body text-sm text-muted-foreground">/3 mois</span>
            </div>
          </div>
        </div>

        {/* Main Benefits */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <p className="font-body text-xs text-primary/90 uppercase tracking-wider font-semibold">
              Ce que tu obtiens :
            </p>
          </div>
          {[
            {
              icon: <CheckCircle2 className="w-4 h-4 text-primary" />,
              title: "12 analyses biomécanique IA complètes",
              desc: "Suivi de ta progression semaine après semaine",
            },
            {
              icon: <CheckCircle2 className="w-4 h-4 text-primary" />,
              title: "Check-up hebdomadaire de progression",
              desc: "Mesure objective de tes améliorations",
            },
            {
              icon: <CheckCircle2 className="w-4 h-4 text-primary" />,
              title: "Exercices personnalisés neuro-cognitifs et mécaniques",
              desc: "Programme adaptatif basé sur tes résultats",
            },
            {
              icon: <Shield className="w-4 h-4 text-primary" />,
              title: "Shoot3 ID Certifié",
              desc: "CV sportif validé à la fin du programme",
            },
          ].map((benefit, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">{benefit.icon}</div>
              <div>
                <p className="font-body text-sm text-foreground/90 font-medium leading-tight">{benefit.title}</p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Inclus Pass Team */}
        <div className="rounded-xl p-4 mb-5 border border-primary/20" style={{ background: "rgba(0, 0, 0, 0.3)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-primary" />
            <p className="font-sport text-sm text-primary tracking-wider">+ PASS TEAM INCLUS</p>
          </div>
          <div className="space-y-2">
            {[
              "Accès au Vestiaire (groupe privé)",
              "Ligue Shoot3 (classements & challenges)",
              "Lives Pro et événements exclusifs",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                <span className="font-body text-xs text-foreground/70">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => setSniperModalOpen(true)}
          className="w-full py-4 rounded-2xl font-sport text-lg tracking-widest uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-primary-foreground"
          style={{
            background: "linear-gradient(135deg, hsl(18 90% 40%), hsl(18 100% 50%))",
            boxShadow: "0 4px 30px hsl(18 100% 50% / 0.4), 0 0 60px hsl(18 100% 50% / 0.15)",
          }}
        >
          DÉMARRER LE BOOTCAMP · 49.99€
        </button>

        <p className="text-center font-body text-xs text-muted-foreground mt-3">
          Paiement unique · Sans abonnement · Accès 3 mois
        </p>
      </motion.div>

      {/* Divider */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <span className="font-body text-xs text-muted-foreground uppercase tracking-wider">Ou</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </motion.div>

      {/* Pass Team */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl p-5 border border-blue-500/30"
        style={{ background: "rgba(10, 15, 25, 0.95)" }}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-900/40 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-sport text-xl text-foreground tracking-wider mb-1">PASS TEAM SHOOT3</h4>
            <p className="font-body text-sm text-blue-400/80">Abonnement mensuel · Sans engagement</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-4">
          <div className="flex items-baseline justify-between">
            <span className="font-body text-sm text-foreground/70">Par mois</span>
            <div className="flex items-baseline gap-1">
              <span className="font-sport text-3xl text-blue-300">19.99€</span>
              <span className="font-body text-sm text-muted-foreground">/mois</span>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-2.5 mb-5">
          {[
            {
              title: "1 analyse biomécanique par semaine",
              desc: "Suivi régulier de ta progression",
            },
            {
              title: "Le Vestiaire",
              desc: "Groupe privé d'entraide et de motivation",
            },
            {
              title: "Ligue Shoot3",
              desc: "Classements, challenges et compétitions",
            },
            {
              title: "Shoot3 ID Certifié",
              desc: "CV sportif validé après 3 mois d'activité",
            },
          ].map((benefit, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400/60 flex-shrink-0 mt-2" />
              <div>
                <p className="font-body text-sm text-foreground/80 font-medium leading-tight">{benefit.title}</p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => setTeamModalOpen(true)}
          className="w-full border-2 border-blue-500/50 text-blue-300 font-sport text-base tracking-widest py-3 rounded-xl transition-all active:scale-98 hover:border-blue-400/70 hover:bg-blue-900/20"
        >
          REJOINDRE LA LIGUE · 19.99€/MOIS
        </button>

        <p className="text-center font-body text-xs text-muted-foreground mt-3">
          Résiliable à tout moment · Facturation mensuelle
        </p>
      </motion.div>

      {/* Rapport d'Analyse */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl p-5 border border-white/10"
        style={{ background: "rgba(14, 10, 8, 0.95)" }}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-foreground/60"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-sport text-lg text-foreground tracking-wider mb-1">RAPPORT D'ANALYSE (PDF)</h4>
            <p className="font-body text-xs text-muted-foreground">Accès immédiat · Ton plan d'action personnalisé</p>
          </div>
          <div className="text-right">
            <p className="font-sport text-2xl text-foreground">9.99€</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {["Décryptage visuel frame-by-frame", "Analyse chiffrée (angles, appuis)", "Routine express ciblée"].map(
            (f, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-foreground/40 flex-shrink-0" />
                <span className="font-body text-xs text-foreground/70">{f}</span>
              </div>
            )
          )}
        </div>

        <button
          onClick={() => handleOfferClick(PRICES.rapport)}
          disabled={checkoutLoading === PRICES.rapport}
          className="w-full border border-white/20 text-foreground font-sport text-sm tracking-widest py-2.5 rounded-xl transition-all active:scale-98 hover:border-white/40 hover:bg-white/5 disabled:opacity-50"
        >
          DÉBLOQUER MON RAPPORT · 9.99€
        </button>
      </motion.div>

      {/* Account Management */}
      <motion.div variants={itemVariants} className="space-y-3 pt-4">
        <button
          onClick={async () => {
            await signOut();
            window.location.href = "/";
          }}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 px-6 border border-white/10 font-body text-sm text-muted-foreground transition-all active:scale-95 hover:border-destructive/50 hover:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 px-6 border border-destructive/30 font-body text-xs text-destructive/70 transition-all active:scale-95 hover:border-destructive hover:text-destructive">
              <Trash2 className="w-3.5 h-3.5" />
              Supprimer mon compte et mes données
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-[360px] rounded-2xl border border-destructive/30 bg-background">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-sport text-xl text-foreground">SUPPRIMER MON COMPTE</AlertDialogTitle>
              <AlertDialogDescription className="font-body text-sm text-muted-foreground leading-relaxed">
                Cette action est <strong className="text-destructive">irréversible</strong>. Toutes tes données seront
                définitivement supprimées : profil, analyses, frames vidéo, rapports.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="font-body text-sm rounded-xl">Annuler</AlertDialogCancel>
              <AlertDialogAction
                disabled={deletingAccount}
                onClick={async (e) => {
                  e.preventDefault();
                  setDeletingAccount(true);
                  try {
                    const { error } = await supabase.functions.invoke("delete-account");
                    if (error) throw error;
                    toast({ title: "Compte supprimé", description: "Toutes tes données ont été effacées." });
                    await signOut();
                    window.location.href = "/";
                  } catch (err: any) {
                    toast({
                      title: "Erreur",
                      description: err.message || "Impossible de supprimer le compte",
                      variant: "destructive",
                    });
                    setDeletingAccount(false);
                  }
                }}
                className="bg-destructive text-destructive-foreground font-sport text-xs tracking-widest rounded-xl hover:bg-destructive/90"
              >
                {deletingAccount ? "SUPPRESSION..." : "CONFIRMER LA SUPPRESSION"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <a
          href="/privacy"
          className="block text-center font-body text-xs text-muted-foreground underline hover:text-foreground transition-colors"
        >
          Politique de confidentialité
        </a>
      </motion.div>

      {/* Modals */}
      <SniperEliteModal
        open={sniperModalOpen}
        onClose={() => setSniperModalOpen(false)}
        onSubscribe={() => {
          setSniperModalOpen(false);
          handleOfferClick(PRICES.sniper);
        }}
        loading={checkoutLoading === PRICES.sniper}
      />

      <PassTeamModal
        open={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
        onSubscribe={() => {
          setTeamModalOpen(false);
          handleOfferClick(PRICES.team);
        }}
        loading={checkoutLoading === PRICES.team}
      />

      <div className="pb-2" />
    </motion.div>
  );
};

export default ProTab;
