import {
    bucketSize,
    checkInterval,
    wakeFrequency,
    sleepFrequency,
} from './config';

const toneLength: number = 4;

interface AudioDataSender {
    audioContext: AudioContext | null;
    oscillator: OscillatorNode | null;
    textToSend: string;
    wakeFrequency: number;
    sleepFrequency: number;
}

class AudioDataSender {
    constructor() {
        this.audioContext = null;
        this.oscillator = null;
        this.textToSend = '';
        this.wakeFrequency = wakeFrequency;
        this.sleepFrequency = sleepFrequency;
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
        this.playTone(this.wakeFrequency);

        const textArray = this.textToSend.split('');
        let currentIndex = 0;

        const playNextTone = () => {
            if (currentIndex < textArray.length) {
                const char = textArray[currentIndex];
                const frequency = this.charToFrequency(char);

                if (frequency) {
                    this.playTone(frequency);
                }

                currentIndex++;
                setTimeout(playNextTone, checkInterval * toneLength);
            } else {
                this.playTone(this.sleepFrequency);
                this.stopSending();
            }
        };

        playNextTone();
    }

    playTone(frequency: number) {
        if (!this.audioContext) return;

        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = 'sine';
        this.oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        this.oscillator.connect(this.audioContext.destination);
        this.oscillator.start();
        this.oscillator.stop(this.audioContext.currentTime + (checkInterval / 1000) * toneLength);
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
        const charCode = char.charCodeAt(0);
        const frequency = 440 + (charCode - 32) * bucketSize;

        return frequency;
    }
}

export default AudioDataSender;
