'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Clock } from 'lucide-react';

interface TimePickerModalProps {
  value: string; // HH:MM 24h
  label: string;
  onConfirm: (time: string) => void;
  onClose: () => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export default function TimePickerModal({ value, label, onConfirm, onClose }: TimePickerModalProps) {
  const [hour, setHour] = useState(() => parseInt(value.split(':')[0]));
  const [minute, setMinute] = useState(() => {
    const m = parseInt(value.split(':')[1]);
    return MINUTES.includes(m) ? m : 0;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [clockMode, setClockMode] = useState<'hour' | 'minute'>('hour');
  const clockRef = useRef<HTMLDivElement>(null);

  const getAngle = useCallback((e: MouseEvent | TouchEvent) => {
    if (!clockRef.current) return 0;
    const rect = clockRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const angle = Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI) + 90;
    return (angle + 360) % 360;
  }, []);

  const handleClockInteraction = useCallback((e: MouseEvent | TouchEvent) => {
    const angle = getAngle(e);
    if (clockMode === 'hour') {
      const h = Math.round(angle / 30) % 12;
      const newHour = (hour >= 12 ? 12 : 0) + h;
      setHour(newHour === 12 && hour < 12 ? 0 : newHour);
    } else {
      const m = Math.round(angle / 6) % 60;
      const snapped = MINUTES.reduce((prev, curr) => Math.abs(curr - m) < Math.abs(prev - m) ? curr : prev);
      setMinute(snapped);
    }
  }, [clockMode, hour, getAngle]);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => { if (isDragging) handleClockInteraction(e); };
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging, handleClockInteraction]);

  const handleClockDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    handleClockInteraction(e.nativeEvent);
  };

  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const handAngle = clockMode === 'hour' ? (displayHour % 12) * 30 : minute * 6;

  const handleConfirm = () => {
    const h = String(hour).padStart(2, '0');
    const m = String(minute).padStart(2, '0');
    onConfirm(`${h}:${m}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-3xl shadow-card border border-border p-6 w-full max-w-sm animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            <h3 className="text-base font-bold text-foreground">{label}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors duration-150">
            <X size={18} />
          </button>
        </div>

        {/* Time display */}
        <div className="flex items-center justify-center gap-1 mb-6">
          <button
            onClick={() => setClockMode('hour')}
            className={`text-4xl font-bold font-tabular px-3 py-1 rounded-xl transition-all duration-150 ${clockMode === 'hour' ? 'bg-primary text-white' : 'text-foreground hover:bg-secondary'}`}
          >
            {String(displayHour).padStart(2, '0')}
          </button>
          <span className="text-4xl font-bold text-muted-foreground">:</span>
          <button
            onClick={() => setClockMode('minute')}
            className={`text-4xl font-bold font-tabular px-3 py-1 rounded-xl transition-all duration-150 ${clockMode === 'minute' ? 'bg-primary text-white' : 'text-foreground hover:bg-secondary'}`}
          >
            {String(minute).padStart(2, '0')}
          </button>
          <div className="flex flex-col gap-1 ml-2">
            <button
              onClick={() => setHour(hour < 12 ? hour : hour - 12)}
              className={`text-sm font-bold px-2 py-0.5 rounded-lg transition-all duration-150 ${ampm === 'AM' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-secondary'}`}
            >
              AM
            </button>
            <button
              onClick={() => setHour(hour >= 12 ? hour : hour + 12)}
              className={`text-sm font-bold px-2 py-0.5 rounded-lg transition-all duration-150 ${ampm === 'PM' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-secondary'}`}
            >
              PM
            </button>
          </div>
        </div>

        {/* Analog clock */}
        <div className="flex justify-center mb-6">
          <div
            ref={clockRef}
            onMouseDown={handleClockDown}
            onTouchStart={handleClockDown}
            className="relative w-48 h-48 rounded-full bg-secondary border-2 border-border cursor-pointer select-none"
            style={{ touchAction: 'none' }}
          >
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-primary -translate-x-1/2 -translate-y-1/2 z-10" />

            {/* Hand */}
            <div
              className="absolute top-1/2 left-1/2 w-1 rounded-full bg-primary origin-bottom z-5 transition-transform duration-100"
              style={{
                height: '40%',
                transform: `translateX(-50%) rotate(${handAngle}deg)`,
                transformOrigin: '50% 100%',
                marginTop: '-40%',
              }}
            />

            {/* Hour markers */}
            {clockMode === 'hour'
              ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h, i) => {
                  const angle = i * 30 - 90;
                  const rad = (angle * Math.PI) / 180;
                  const r = 42;
                  const x = 50 + r * Math.cos(rad);
                  const y = 50 + r * Math.sin(rad);
                  const isActive = displayHour % 12 === h % 12;
                  return (
                    <button
                      key={`hr-${h}`}
                      onClick={() => {
                        const newH = ampm === 'PM' ? (h === 12 ? 12 : h + 12) : h === 12 ? 0 : h;
                        setHour(newH);
                        setClockMode('minute');
                      }}
                      className={`absolute text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ${isActive ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-primary/20'}`}
                      style={{ left: `${x}%`, top: `${y}%` }}
                    >
                      {h}
                    </button>
                  );
                })
              : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m, i) => {
                  const angle = i * 30 - 90;
                  const rad = (angle * Math.PI) / 180;
                  const r = 42;
                  const x = 50 + r * Math.cos(rad);
                  const y = 50 + r * Math.sin(rad);
                  const isActive = minute === m;
                  return (
                    <button
                      key={`min-${m}`}
                      onClick={() => setMinute(m)}
                      className={`absolute text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ${isActive ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-primary/20'}`}
                      style={{ left: `${x}%`, top: `${y}%` }}
                    >
                      {String(m).padStart(2, '0')}
                    </button>
                  );
                })}
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-1.5 mb-4 justify-center">
          {['08:00','09:00','10:00','12:00','14:00','16:00','18:00','20:00'].map((t) => (
            <button
              key={`preset-${t}`}
              onClick={() => {
                const [h, m] = t.split(':').map(Number);
                setHour(h);
                setMinute(m);
              }}
              className="text-xs font-medium px-2.5 py-1 rounded-lg bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-150"
            >
              {t}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary transition-all duration-150"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-soft hover:opacity-90 active:scale-95 transition-all duration-150"
          >
            Set Time
          </button>
        </div>
      </div>
    </div>
  );
}