<template>
  <div class="spectral-debug">
    <div class="controls">
      <div class="flex items-center space-x-2 text-white">
        <Switch
          id="debug-switch"
          :checked="isRunning"
          @update:checked="toggleRunning"
        />
        <Label for="debug-switch" class="text-white">{{ isRunning ? 'Listening' : 'Start' }}</Label>
      </div>
    </div>

    <div class="visualizations">
      <!-- Spectrogram (waterfall) -->
      <div class="viz-section">
        <h3>Spectrogram</h3>
        <canvas ref="spectrogramCanvas" width="600" height="200"></canvas>
      </div>

      <!-- Live spectrum with markers -->
      <div class="viz-section">
        <h3>Frequency Spectrum</h3>
        <canvas ref="spectrumCanvas" width="600" height="150"></canvas>
      </div>

      <!-- Stats panel -->
      <div class="stats-panel">
        <div class="stat">
          <span class="stat-label">Detected Frequency</span>
          <span class="stat-value">{{ detectedFrequency ? `${detectedFrequency.toFixed(1)} Hz` : '—' }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Matched Note</span>
          <span class="stat-value">{{ matchedFrequency ? `${matchedFrequency.toFixed(1)} Hz` : '—' }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Character</span>
          <span class="stat-value char">{{ detectedChar || '—' }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Peak Magnitude</span>
          <div class="confidence-bar">
            <div class="confidence-fill" :style="{ width: `${peakMagnitude / 255 * 100}%` }"></div>
          </div>
          <span class="stat-value-small">{{ peakMagnitude }} / 255</span>
        </div>
        <div class="stat">
          <span class="stat-label">Confidence</span>
          <div class="confidence-bar">
            <div class="confidence-fill" :class="{ good: confidence > 70, mid: confidence > 40 && confidence <= 70, low: confidence <= 40 }" :style="{ width: `${confidence}%` }"></div>
          </div>
          <span class="stat-value-small">{{ confidence.toFixed(0) }}%</span>
        </div>
      </div>
    </div>

    <!-- Frequency reference -->
    <div class="freq-reference">
      <h3>Character → Frequency Map</h3>
      <div class="freq-grid">
        <div
          v-for="(freq, char) in asciiToFrequencyMap"
          :key="char"
          class="freq-item"
          :class="{ active: detectedChar === char }"
        >
          <span class="freq-char">{{ char === '\0' ? 'NUL' : char === '\n' ? '↵' : char === ' ' ? '␣' : char }}</span>
          <span class="freq-hz">{{ freq.toFixed(0) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted } from 'vue';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  asciiToFrequencyMap,
  frequencyToAsciiMap,
  findClosestFrequency,
  notes
} from '../lib/config';

const fftSize = 2048;

const isRunning = ref(false);
const detectedFrequency = ref<number | null>(null);
const matchedFrequency = ref<number | null>(null);
const detectedChar = ref<string | null>(null);
const peakMagnitude = ref(0);
const confidence = ref(0);

const spectrogramCanvas = ref<HTMLCanvasElement | null>(null);
const spectrumCanvas = ref<HTMLCanvasElement | null>(null);

let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let dataArray: Uint8Array;
let animationId: number | null = null;
let spectrogramImageData: ImageData | null = null;

const toggleRunning = () => {
  if (isRunning.value) {
    stopAnalysis();
  } else {
    startAnalysis();
  }
};

const startAnalysis = async () => {
  try {
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
      video: false
    });

    audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(audioStream);

    analyser = audioContext.createAnalyser();
    analyser.fftSize = fftSize;
    analyser.smoothingTimeConstant = 0.3;

    source.connect(analyser);

    dataArray = new Uint8Array(analyser.frequencyBinCount);
    isRunning.value = true;

    // Initialize spectrogram
    const spectroCtx = spectrogramCanvas.value?.getContext('2d');
    if (spectroCtx && spectrogramCanvas.value) {
      spectrogramImageData = spectroCtx.createImageData(
        spectrogramCanvas.value.width,
        spectrogramCanvas.value.height
      );
    }

    processAudio();
  } catch (error) {
    console.error('Error accessing microphone:', error);
  }
};

const stopAnalysis = () => {
  isRunning.value = false;
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
};

const processAudio = () => {
  if (!isRunning.value || !analyser || !audioContext) return;

  analyser.getByteFrequencyData(dataArray);

  // Find peak frequency
  let maxIndex = -1;
  let maxValue = 0;
  const bufferLength = analyser.frequencyBinCount;

  for (let i = 0; i < bufferLength; i++) {
    if (dataArray[i] > maxValue) {
      maxIndex = i;
      maxValue = dataArray[i];
    }
  }

  peakMagnitude.value = maxValue;

  if (maxIndex !== -1 && maxValue > 128) {
    const nyquist = audioContext.sampleRate / 2;
    const freq = (nyquist / bufferLength) * maxIndex;
    detectedFrequency.value = freq;

    const closest = findClosestFrequency(freq);
    matchedFrequency.value = closest;
    detectedChar.value = frequencyToAsciiMap[closest] || null;

    // Calculate confidence based on distance from matched frequency
    const distance = Math.abs(freq - closest);
    confidence.value = Math.max(0, Math.min(100, (1 - distance / 50) * 100));
  } else {
    detectedFrequency.value = null;
    matchedFrequency.value = null;
    detectedChar.value = null;
    confidence.value = 0;
  }

  drawSpectrum();
  drawSpectrogram();

  animationId = requestAnimationFrame(processAudio);
};

const drawSpectrum = () => {
  const canvas = spectrumCanvas.value;
  if (!canvas || !analyser || !audioContext) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const bufferLength = analyser.frequencyBinCount;
  const nyquist = audioContext.sampleRate / 2;

  // Clear canvas
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(0, 0, width, height);

  // Draw frequency bars (limited to relevant range ~200-8000 Hz)
  const minFreq = 200;
  const maxFreq = 8000;
  const minBin = Math.floor((minFreq / nyquist) * bufferLength);
  const maxBin = Math.floor((maxFreq / nyquist) * bufferLength);
  const relevantBins = maxBin - minBin;

  const barWidth = width / relevantBins;

  for (let i = 0; i < relevantBins; i++) {
    const binIndex = minBin + i;
    const value = dataArray[binIndex];
    const barHeight = (value / 255) * height;

    // Color based on intensity
    const hue = 200 - (value / 255) * 60; // blue to cyan
    ctx.fillStyle = `hsl(${hue}, 70%, ${30 + (value / 255) * 40}%)`;
    ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
  }

  // Draw note frequency markers
  ctx.strokeStyle = 'rgba(255, 200, 100, 0.5)';
  ctx.lineWidth = 1;

  for (const freq of notes) {
    if (freq >= minFreq && freq <= maxFreq) {
      const x = ((freq - minFreq) / (maxFreq - minFreq)) * width;
      ctx.beginPath();
      ctx.moveTo(x, height);
      ctx.lineTo(x, height - 10);
      ctx.stroke();
    }
  }

  // Draw detected frequency marker
  if (detectedFrequency.value && detectedFrequency.value >= minFreq && detectedFrequency.value <= maxFreq) {
    const x = ((detectedFrequency.value - minFreq) / (maxFreq - minFreq)) * width;

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();

    // Label
    ctx.fillStyle = '#ef4444';
    ctx.font = '10px monospace';
    ctx.fillText(`${detectedFrequency.value.toFixed(0)} Hz`, x + 4, 12);
  }

  // Draw matched frequency marker
  if (matchedFrequency.value && matchedFrequency.value >= minFreq && matchedFrequency.value <= maxFreq) {
    const x = ((matchedFrequency.value - minFreq) / (maxFreq - minFreq)) * width;

    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
    ctx.setLineDash([]);
  }
};

const drawSpectrogram = () => {
  const canvas = spectrogramCanvas.value;
  if (!canvas || !analyser || !audioContext || !spectrogramImageData) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const bufferLength = analyser.frequencyBinCount;
  const nyquist = audioContext.sampleRate / 2;

  // Shift existing image left by 1 pixel
  const imageData = ctx.getImageData(1, 0, width - 1, height);
  ctx.putImageData(imageData, 0, 0);

  // Draw new column on the right
  const minFreq = 200;
  const maxFreq = 8000;
  const minBin = Math.floor((minFreq / nyquist) * bufferLength);
  const maxBin = Math.floor((maxFreq / nyquist) * bufferLength);

  for (let y = 0; y < height; y++) {
    // Map y position to frequency bin (inverted so low freq at bottom)
    const binIndex = minBin + Math.floor(((height - y) / height) * (maxBin - minBin));
    const value = dataArray[binIndex] || 0;

    // Color mapping (dark blue -> cyan -> yellow -> white)
    let r, g, b;
    if (value < 64) {
      r = 0;
      g = 0;
      b = value * 2;
    } else if (value < 128) {
      r = 0;
      g = (value - 64) * 4;
      b = 128;
    } else if (value < 192) {
      r = (value - 128) * 4;
      g = 255;
      b = 128 - (value - 128) * 2;
    } else {
      r = 255;
      g = 255;
      b = (value - 192) * 4;
    }

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(width - 1, y, 1, 1);
  }

  // Draw horizontal lines for note frequencies
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;

  for (const freq of notes) {
    if (freq >= minFreq && freq <= maxFreq) {
      const y = height - ((freq - minFreq) / (maxFreq - minFreq)) * height;
      ctx.beginPath();
      ctx.moveTo(width - 5, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }
};

onMounted(() => {
  // Initialize canvases with dark background
  const spectroCtx = spectrogramCanvas.value?.getContext('2d');
  const spectrumCtx = spectrumCanvas.value?.getContext('2d');

  if (spectroCtx && spectrogramCanvas.value) {
    spectroCtx.fillStyle = '#1c1917';
    spectroCtx.fillRect(0, 0, spectrogramCanvas.value.width, spectrogramCanvas.value.height);
  }

  if (spectrumCtx && spectrumCanvas.value) {
    spectrumCtx.fillStyle = '#1c1917';
    spectrumCtx.fillRect(0, 0, spectrumCanvas.value.width, spectrumCanvas.value.height);
  }
});

onBeforeUnmount(() => {
  stopAnalysis();
});
</script>

<style scoped>
.spectral-debug {
  color: #e5e5e5;
}

.controls {
  margin-bottom: 1rem;
}

.visualizations {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.viz-section {
  background: #1c1917;
  border-radius: 8px;
  padding: 1rem;
}

.viz-section h3 {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #a8a29e;
  margin-bottom: 0.5rem;
}

canvas {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  background: #1c1917;
  border-radius: 8px;
  padding: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #a8a29e;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  font-family: monospace;
}

.stat-value.char {
  font-size: 1.5rem;
  color: #22c55e;
}

.stat-value-small {
  font-size: 0.75rem;
  color: #a8a29e;
  font-family: monospace;
}

.confidence-bar {
  height: 8px;
  background: #292524;
  border-radius: 4px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background: #ef4444;
  transition: width 0.1s ease-out;
}

.confidence-fill.good {
  background: #22c55e;
}

.confidence-fill.mid {
  background: #eab308;
}

.confidence-fill.low {
  background: #ef4444;
}

.freq-reference {
  margin-top: 1rem;
  background: #1c1917;
  border-radius: 8px;
  padding: 1rem;
}

.freq-reference h3 {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #a8a29e;
  margin-bottom: 0.75rem;
}

.freq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 0.5rem;
}

.freq-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  background: #292524;
  border-radius: 4px;
  transition: all 0.1s ease-out;
}

.freq-item.active {
  background: #22c55e;
  color: #000;
}

.freq-char {
  font-size: 1rem;
  font-weight: 600;
  font-family: monospace;
}

.freq-hz {
  font-size: 0.6rem;
  color: #a8a29e;
}

.freq-item.active .freq-hz {
  color: #000;
}
</style>
