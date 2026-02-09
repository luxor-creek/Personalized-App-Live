const BrandLogo = ({ className = "h-8" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-6 h-6 bg-primary rounded" />
      <span className="font-semibold text-foreground text-lg">Personalized Page</span>
    </div>
  );
};

export default BrandLogo;
