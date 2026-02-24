const BrandLogo = ({ className = "h-8" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <img src="/logo.png" alt="Personalized Page" className="h-full w-auto object-contain" />
      <span className="font-semibold text-foreground text-lg">Personalized Page</span>
    </div>
  );
};

export default BrandLogo;
