import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiPause, FiDownload, FiTrash2 } from 'react-icons/fi';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function VoiceNotePlayer({ fileUrl, fileName, msgId, onDelete, myMessage }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [waveform, setWaveform] = useState([]);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const progressRef = useRef(null);

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const generateWaveform = useCallback(async () => {
    try {
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
      }
      setLoading(false);
    } catch {}
  }, [fileUrl]);

  useEffect(() => {
    generateWaveform();
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [generateWaveform]);

  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !waveform.length) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth * dpr;
    const h = canvas.clientHeight * dpr;
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);

    const totalBars = waveform.length;
    const barWidth = (w - 10) / totalBars;
    const mid = h / 2;

    const progress = duration > 0 ? currentTime / duration : 0;
    const playhead = Math.floor(progress * totalBars);

    waveform.forEach((val, i) => {
      const x = 5 + i * barWidth;
      const barH = Math.max(val * h * 0.8, 2);
      ctx.fillStyle = i < playhead && playing ? 'rgba(139,92,246,0.9)' : i < playhead ? 'rgba(139,92,246,0.7)' : 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.roundRect(x, mid - barH / 2, Math.max(barWidth - 1, 2), barH, 2);
      ctx.fill();
    });
  }, [waveform, currentTime, duration, playing]);

  const decodeAudio = useCallback(async () => {
    try {
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);
      const samples = 60;
      const blockSize = Math.floor(channelData.length / samples);
      const wave = [];
      for (let i = 0; i < samples; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[i * blockSize + j] || 0);
        }
        wave.push(sum / blockSize);
      }
      const max = Math.max(...wave);
      setWaveform(wave.map(v => max > 0 ? v / max : 0));
      audioCtx.close();
    } catch {}
  }, [fileUrl]);

  useEffect(() => { decodeAudio(); }, [decodeAudio]);
  useEffect(() => { drawWaveform(); }, [drawWaveform]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    } else {
      audio.play().then(() => {
        setPlaying(true);
        const update = () => {
          setCurrentTime(audio.currentTime);
          animationRef.current = requestAnimationFrame(update);
        };
        animationRef.current = requestAnimationFrame(update);
      }).catch(() => {});
    }
  };

  const handleLoaded = () => {
    if (audioRef.current) setDuration(audioRef.current.duration || 0);
  };

  const handleEnded = () => {
    setPlaying(false);
    setCurrentTime(0);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  const handleProgressClick = (e) => {
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect || !audioRef.current || !duration) return;
    const pct = (e.clientX - rect.left) / rect.width;
    const time = Math.max(0, Math.min(pct * duration, duration));
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const r = await fetch(fileUrl);
      const b = await r.blob();
      const u = URL.createObjectURL(b);
      const a = document.createElement('a');
      a.href = u;
      a.download = fileName || 'voice-note.wav';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(u), 1000);
    } catch {}
  };

  const speedOptions = [1];
  const [speedIdx, setSpeedIdx] = useState(0);

  return (
    <div className="flex items-center gap-2 min-w-[220px] max-w-full">
      <audio ref={audioRef} onLoadedMetadata={handleLoaded} onEnded={handleEnded} preload="auto" />
      <motion.button onClick={togglePlay} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        className="w-8 h-8 md:w-9 md:h-9 rounded-full gradient-bg flex items-center justify-center shrink-0 shadow-lg shadow-primary/30"
      >
        {playing ? <FiPause size={13} /> : <FiPlay size={13} className="ml-0.5" />}
      </motion.button>
      <div className="flex-1 min-w-0 space-y-1">
        <div ref={progressRef} className="h-8 md:h-9 rounded-lg bg-black/20 overflow-hidden cursor-pointer relative" onClick={handleProgressClick}>
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
        <div className="flex items-center justify-between px-0.5">
          <p className="text-[10px] text-white/50 font-mono">{formatTime(currentTime)}</p>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              const audio = audioRef.current;
              if (!audio || !duration) return;
              const speeds = [1, 1.5, 2];
              const next = (speedIdx + 1) % speeds.length;
              setSpeedIdx(next);
              audio.playbackRate = speeds[next];
            }}
            className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
          >
            {[1, 1.5, 2][speedIdx]}x
          </motion.button>
          <p className="text-[10px] text-white/50 font-mono">{formatTime(duration)}</p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <button onClick={handleDownload} className="w-6 h-6 md:w-7 md:h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"><FiDownload size={11} /></button>
        {onDelete && (
          <button onClick={() => onDelete(msgId)} className="w-6 h-6 md:w-7 md:h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"><FiTrash2 size={11} /></button>
        )}
      </div>
    </div>
  );
}
