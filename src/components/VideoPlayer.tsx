import { Play } from "lucide-react";
import { useState } from "react";

interface VideoPlayerProps {
  videoUrl?: string;
  thumbnailUrl?: string;
}

const VideoPlayer = ({ videoUrl, thumbnailUrl }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Placeholder video - replace with actual demo video URL
  const demoVideoUrl = videoUrl || "https://player.vimeo.com/video/placeholder";

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden card-elevated border border-border/50 bg-card">
      {!isPlaying && thumbnailUrl ? (
        <div 
          className="absolute inset-0 cursor-pointer group"
          onClick={() => setIsPlaying(true)}
        >
          <img 
            src={thumbnailUrl} 
            alt="Video thumbnail" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/40 group-hover:bg-background/30 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center animate-pulse-glow group-hover:scale-110 transition-transform">
              <Play className="w-8 h-8 text-primary-foreground ml-1" />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-secondary">
          <div className="text-center p-8">
            <Play className="w-16 h-16 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              Video embed will appear here
            </p>
            <p className="text-sm text-muted-foreground/60 mt-2">
              Replace with your Vimeo or YouTube embed
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
