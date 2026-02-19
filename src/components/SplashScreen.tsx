import basketballBg from "@/assets/basketball-bg.jpg";

interface SplashScreenProps {
  onStart: () => void;
}

const SplashScreen = ({ onStart }: SplashScreenProps) => {
  return (
    <div className="mobile-container flex flex-col items-center justify-between bg-background relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
        style={{ backgroundImage: `url(${basketballBg})` }}
      />
      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/90" />
      <div className="absolute inset-0 bg-radial-dark" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center flex-1 justify-center gap-6 pt-16">
        {/* Logo */}
        <div
          className="w-24 h-24 rounded-2xl flex items-center justify-center animate-pulse-orange"
          style={{
            background: "linear-gradient(135deg, hsl(18 80% 30%), hsl(18 100% 40%))",
          }}
        >
          <span className="font-sport text-4xl text-foreground tracking-wider">S3</span>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="font-sport text-7xl tracking-widest text-foreground text-glow-orange">
            SHOOT<span className="text-primary">3</span>
          </h1>
          <p className="font-body text-xs tracking-[0.4em] text-muted-foreground mt-2 uppercase">
            Elite AI Coach
          </p>
        </div>
      </div>

      {/* Bottom section */}
      <div className="relative z-10 w-full px-6 pb-10 flex flex-col items-center gap-4">
        <button onClick={onStart} className="btn-primary animate-fade-in-up">
          CONFIGURER MON PROFIL IA
        </button>
        <p className="font-body text-sm text-muted-foreground">
          J'ai déjà un compte.{" "}
          <span className="text-foreground underline cursor-pointer">Se connecter</span>
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
