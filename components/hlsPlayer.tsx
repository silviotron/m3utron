"use client";

import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current
          ?.play()
          .then(() => {
            // Se asegura de que el volumen esté configurado después de la reproducción
            videoRef.current!.currentTime = videoRef.current!.duration - 4;
            videoRef.current!.muted = false;
            videoRef.current!.volume = 0.2;
          })
          .catch((error) => {
            console.error("Error al reproducir el video:", error);
          });
      });

      return () => {
        hls.destroy();
      };
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      controls
      muted
      poster={poster}
      className="w-full  aspect-video max-h-[calc(100vh-4rem)] bg-black"
    />
  );
};

export default VideoPlayer;
