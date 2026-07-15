import React, { useEffect, useRef } from 'react';

export default function Cursor() {
  const audioCtxRef = useRef(null);

  const playClickSound = () => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.setValueAtTime(0.08, now);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.04);
      osc1.connect(masterGain);
      osc1.start(now);
      osc1.stop(now + 0.12);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1320, now);
      osc2.frequency.exponentialRampToValueAtTime(1800, now + 0.03);
      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.04, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc2.connect(gain2);
      gain2.connect(masterGain);
      osc2.start(now);
      osc2.stop(now + 0.08);
    } catch {}
  };

  useEffect(() => {
    window.addEventListener('click', playClickSound);
    return () => window.removeEventListener('click', playClickSound);
  }, []);

  return null;
}
