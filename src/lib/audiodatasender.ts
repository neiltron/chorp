import {
    asciiToFrequencyMap,
    toneLength,
    findClosestFrequency,
    frequencyToAsciiMap,
} from './config';

class AudioDataSender {
    audioContext: AudioContext | null;
    oscillator: OscillatorNode | null;
    modulator: OscillatorNode | null;
    textToSend: string;

    constructor() {
        this.audioContext = null;
        this.oscillator = null;
        this.modulator = null;
        this.textToSend = '';
    }

    async startSending(text: string) {
        this.textToSend = text;
        try {
            this.audioContext = new AudioContext();
            this.encodeAndPlayText();
        } catch (error) {
            console.error('Error starting audio sender', error);
            throw error;
        }
    }

    encodeAndPlayText() {
        const textArray = this.textToSend.split('');
        let currentIndex = 0;

        const playNextTone = () => {
            if (currentIndex < textArray.length) {
                const char = textArray[currentIndex].toLowerCase();
                const frequency = this.charToFrequency(char);

                if (frequency) {
                    this.playTone(frequency, currentIndex + 1);
                }

                currentIndex++;
                playNextTone();
            } else {
                // this.stopSending();
            }
        };

        playNextTone();
    }

    playTone(frequency: number, index: number = 0, stopAfterSending: boolean = false) {
        if (!this.audioContext) return;

        const start = (this.audioContext.currentTime) + index * toneLength;

        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = 'sine';
        this.oscillator.frequency.value = frequency;
        // this.oscillator.frequency.linearRampToValueAtTime(frequency, start + toneLength / 5)

        this.modulator = this.audioContext.createOscillator();
        this.modulator.type = 'sine';
        this.modulator.frequency.value = .05;

        const gainNode = this.audioContext.createGain();
        const modulatorGain = this.audioContext.createGain();
        modulatorGain.gain.value = 500;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = frequency;
        filter.Q.value = Math.sqrt(10); // Q value is needed for specific rolloffs


        const attackTime = 0;
        const decayTime = toneLength / 4;
        const sustainLevel = toneLength / 3;
        const releaseTime = 100;

        this.oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        this.modulator.connect(modulatorGain);
        modulatorGain.connect(this.oscillator.detune);

        gainNode.gain.cancelScheduledValues(start);
        gainNode.gain.setValueAtTime(0, start);
        gainNode.gain.linearRampToValueAtTime(.5, start + attackTime); // Attack
        // gainNode.gain.linearRampToValueAtTime(sustainLevel, start + attackTime + decayTime); // Decay
        gainNode.gain.linearRampToValueAtTime(0, start + attackTime + releaseTime);


        const end = start + toneLength;

        console.log(index, `"${this.frequencyToChar(frequency)}"`, frequency, start, end);
        this.oscillator.start(start);
        this.oscillator.stop(end);

        this.modulator.start(start);
        this.modulator.stop(end);
    }

    stopSending() {
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator.disconnect();
        }

        if (this.audioContext) {
            this.audioContext.close();
        }
    }

    charToFrequency(char: string) {
        const frequency = asciiToFrequencyMap[char];

        return frequency;
    }

    frequencyToChar(frequency: number) {
        const closestFrequency = findClosestFrequency(frequency);

        if (closestFrequency === 415.30) {
            return;
        }

        const char = frequencyToAsciiMap[closestFrequency]

        // console.log(closestFrequency, char);

        return char;
    }

}

export default AudioDataSender;
