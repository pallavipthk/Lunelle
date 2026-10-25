import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, Square } from 'lucide-react';

interface TextToSpeechPlayerProps {
  textToRead: string;
  lang?: string;
  label?: string;
}

export const TextToSpeechPlayer: React.FC<TextToSpeechPlayerProps> = ({
  textToRead,
  lang = 'en-IN',
  label = 'Read aloud'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isSupported || !textToRead) return null;

  const handlePlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = lang;
    utterance.rate = 0.95; // Slightly calmer, articulate pacing

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-pale-sage/50 border border-botanical-green/30 text-deep-sage text-xs">
      {!isPlaying && !isPaused ? (
        <button
          onClick={handlePlay}
          className="flex items-center gap-1 hover:text-text-primary transition-colors"
          title="Listen to this explanation"
        >
          <Volume2 className="w-3.5 h-3.5 text-deep-sage" />
          <span>{label}</span>
        </button>
      ) : (
        <div className="flex items-center gap-1.5">
          {isPlaying ? (
            <button onClick={handlePause} className="p-1 hover:text-text-primary" title="Pause">
              <Pause className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button onClick={handlePlay} className="p-1 hover:text-text-primary" title="Resume">
              <Play className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={handleStop} className="p-1 hover:text-text-primary" title="Stop">
            <Square className="w-3 h-3" />
          </button>
          <span className="text-[10px] text-text-secondary font-medium">Playing...</span>
        </div>
      )}
    </div>
  );
};
