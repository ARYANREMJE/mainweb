import { useEffect, useRef } from 'react';

interface GaugeChartProps {
  value: number;
  max: number;
  threshold: number;
  isExceedingThreshold: boolean;
}

export default function GaugeChart({ value, max, threshold, isExceedingThreshold }: GaugeChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const percentage = value / max;
    const thresholdPercentage = threshold / max;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background arc
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 45, Math.PI, 2 * Math.PI);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#e5e7eb';
    ctx.stroke();
    
    // Determine color based on threshold
    let color = '#10b981'; // Default green
    if (isExceedingThreshold) {
      color = value > threshold * 1.1 ? '#ef4444' : '#f59e0b';
    }
    
    // Draw value arc
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 45, Math.PI, Math.PI + percentage * Math.PI);
    ctx.lineWidth = 10;
    ctx.strokeStyle = color;
    ctx.stroke();
    
    // Draw threshold marker
    ctx.beginPath();
    const thresholdAngle = Math.PI + thresholdPercentage * Math.PI;
    const thresholdX = canvas.width / 2 + 45 * Math.cos(thresholdAngle);
    const thresholdY = canvas.height / 2 + 45 * Math.sin(thresholdAngle);
    
    ctx.arc(thresholdX, thresholdY, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    
    // Draw center text
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(percentage * 100)}%`, canvas.width / 2, canvas.height / 2);
  }, [value, max, threshold, isExceedingThreshold]);
  
  return <canvas ref={canvasRef} width={120} height={120} />;
}
