interface GradientOverlayProps {
  from?: string;
  via?: string;
}

export default function GradientOverlay({
  from = "from-black/60",
  via = "via-black/10",
}: GradientOverlayProps) {
  return <div className={`absolute inset-0 bg-gradient-to-t ${from} ${via} to-transparent`} />;
}
