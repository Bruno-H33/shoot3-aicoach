import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col">
        <div className="flex-1 overflow-y-auto pb-10">
          <div className="px-5 pt-12 pb-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-6 active:opacity-70">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-body text-sm">Retour</span>
            </button>

            <h1 className="font-sport text-3xl text-foreground mb-2">POLITIQUE DE CONFIDENTIALITÉ</h1>
            <p className="font-body text-xs text-muted-foreground tracking-widest uppercase">Dernière mise à jour : 21 février 2026</p>
          </div>

          <div className="px-5 space-y-6">
            <Section title="1. Responsable du traitement">
              Shoot3 (ci-après « nous ») est responsable du traitement de vos données personnelles. Pour toute question relative à vos données, contactez-nous à : <strong className="text-primary">contact@shoot3.app</strong>
            </Section>

            <Section title="2. Données collectées">
              <ul className="list-disc pl-4 space-y-1">
                <li>Données d'inscription : email, nom/prénom</li>
                <li>Données de profil : poste de jeu, objectif</li>
                <li>Données vidéo : captures d'images (frames) de vos sessions d'entraînement</li>
                <li>Données d'analyse : scores, diagnostics IA, rapports générés</li>
                <li>Données de paiement : traitées par Stripe (nous ne stockons pas vos informations bancaires)</li>
              </ul>
            </Section>

            <Section title="3. Finalités du traitement">
              <ul className="list-disc pl-4 space-y-1">
                <li>Fournir notre service d'analyse IA de tir basketball</li>
                <li>Générer des rapports personnalisés et exercices correctifs</li>
                <li>Gérer votre compte et votre abonnement</li>
                <li>Améliorer nos algorithmes d'analyse</li>
              </ul>
            </Section>

            <Section title="4. Base légale">
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Consentement</strong> : pour le traitement de vos données vidéo et d'analyse</li>
                <li><strong>Exécution du contrat</strong> : pour fournir les services que vous avez achetés</li>
                <li><strong>Intérêt légitime</strong> : pour améliorer nos services</li>
              </ul>
            </Section>

            <Section title="5. Durée de conservation">
              <ul className="list-disc pl-4 space-y-1">
                <li>Données de compte : conservées tant que votre compte est actif</li>
                <li>Frames vidéo : conservées 90 jours après l'analyse</li>
                <li>Rapports d'analyse : conservés tant que votre compte est actif</li>
                <li>Après suppression du compte : toutes les données sont supprimées sous 30 jours</li>
              </ul>
            </Section>

            <Section title="6. Sous-traitants">
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Supabase</strong> (hébergement, base de données) — UE/US</li>
                <li><strong>Google Gemini</strong> (analyse IA) — US</li>
                <li><strong>Stripe</strong> (paiements) — US</li>
              </ul>
              <p className="mt-2">Des clauses contractuelles types (CCT) encadrent les transferts hors UE.</p>
            </Section>

            <Section title="7. Vos droits (RGPD)">
              Conformément au Règlement Général sur la Protection des Données, vous disposez des droits suivants :
              <ul className="list-disc pl-4 space-y-1 mt-2">
                <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
                <li><strong>Droit de rectification</strong> : corriger vos données inexactes</li>
                <li><strong>Droit à l'effacement</strong> : supprimer votre compte et toutes vos données via l'onglet Pro</li>
                <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
                <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données</li>
                <li><strong>Droit de retirer votre consentement</strong> à tout moment</li>
              </ul>
              <p className="mt-2">Pour exercer vos droits : <strong className="text-primary">contact@shoot3.app</strong></p>
            </Section>

            <Section title="8. Cookies">
              Nous utilisons des cookies strictement nécessaires au fonctionnement de l'application (authentification, préférences). Aucun cookie publicitaire ou de tracking tiers n'est utilisé sans votre consentement explicite.
            </Section>

            <Section title="9. Sécurité">
              Vos données sont protégées par chiffrement en transit (TLS) et au repos. L'accès aux données est strictement limité par des politiques de sécurité (Row Level Security). Vos frames vidéo sont stockées de manière isolée par utilisateur.
            </Section>

            <Section title="10. Réclamation">
              Vous pouvez introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) à l'adresse : <strong className="text-primary">www.cnil.fr</strong>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h2 className="font-sport text-lg text-foreground tracking-wider mb-2">{title}</h2>
    <div className="font-body text-sm text-foreground/70 leading-relaxed">{children}</div>
  </div>
);

export default Privacy;
