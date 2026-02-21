import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const COOKIE_KEY = "s3_cookie_consent";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  };

  const handleRefuse = () => {
    localStorage.setItem(COOKIE_KEY, "refused");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] flex justify-center p-4">
      <div
        className="w-full max-w-[430px] rounded-2xl border border-white/10 p-5 backdrop-blur-xl"
        style={{ background: "rgba(10,10,10,0.95)" }}
      >
        <p className="font-body text-sm text-foreground/80 leading-relaxed mb-1">
          🍪 Nous utilisons des cookies essentiels pour le bon fonctionnement de l'app.
        </p>
        <p className="font-body text-xs text-muted-foreground mb-4">
          Consultez notre{" "}
          <Link to="/privacy" className="text-primary underline">
            politique de confidentialité
          </Link>{" "}
          pour en savoir plus.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            className="flex-1 font-sport text-xs tracking-widest py-2.5 rounded-xl transition-all active:scale-95"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
          >
            ACCEPTER
          </button>
          <button
            onClick={handleRefuse}
            className="flex-1 font-sport text-xs tracking-widest py-2.5 rounded-xl border border-white/20 text-foreground transition-all active:scale-95 hover:bg-white/5"
          >
            REFUSER
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
