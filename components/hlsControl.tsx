// components/VideoControl.tsx
"use client"; // Marcar como componente cliente

import { useState, ChangeEvent } from "react";
import HlsPlayer from "@/components/hlsPlayer";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const VideoControl = () => {
  const [videoUrl, setVideoUrl] = useState("https://ztnr.rtve.es/ztnr/1688877.m3u8");
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
