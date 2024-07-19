// components/VideoControl.tsx
"use client"; // Marcar como componente cliente

import { useState, ChangeEvent } from "react";
import HlsPlayer from "@/components/hlsPlayer";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface VideoControlProps {
  src: string;
}

const VideoControl = ({ src }: VideoControlProps) => {
  const [videoUrl, setVideoUrl] = useState(src);
  const [currentUrl, setCurrentUrl] = useState(videoUrl);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
  };

  const handlePlayClick = () => {
    setCurrentUrl(videoUrl);
  };

  return (
    <div>
      <div className="flex flex-1 gap-2 pb-8">
        <Input type="text" value={videoUrl} onChange={handleInputChange} />
        <Button onClick={handlePlayClick}>Play</Button>
      </div>
      <HlsPlayer src={currentUrl} />
    </div>
  );
};

export default VideoControl;
