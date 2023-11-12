import {
    bucketSize,
    checkInterval,
    wakeFrequency,
    sleepFrequency,
} from './config';

const fftSize: number = 2048;

interface AudioDataReceiver {
    
}

class AudioDataReceiver {
    wakeFrequencyy: number;
    sleepFrequency: number;
    isReceiving: boolean; 
    isSynchronized: boolean;
    audioContext: AudioContext | null;
    analyser: AnalyserNode | null;
    dataArray: Uint8Array;
    bufferLength: number | null;
    lastCheckTime: number | null;
    checkInterval: any;
    receivedText: string;
    onReceivedCallback: Function | null; 
    onReceiveStatusCallback: Function | null; 
    
    constructor() {
        this.wakeFrequencfffy = wakeFrequency;
        this.sleepFrequency = sleepFrequency;
        this.isReceiving = false;
        this.isSynchronized = false;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = new Uint8Array();
        this.bufferLength = null;
        this.lastCheckTime = 0;
        this.checkInterval = checkInterval;
        this.receivedText = '';
        this.onReceivedCallback = null;
        this.onReceiveStatusCallback = null;
    }
  
    async startReceiving(onReceivedCallback: Function, onReceiveStatusCallback: Function) {
        this.onReceivedCallback = onReceivedCallback;
        this.onReceiveStatusCallback = onReceiveStatusCallback;
     
        try {
            // get audio stream and create context
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            this.audioContext = new AudioContext();
            
            // create stream source + analyser and connect them
            const source = this.audioContext.createMediaStreamSource(audioStream);
            
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = fftSize;

            source.connect(this.analyser);

            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
            this.decodeFrequencies();
        } catch (error) {
            console.error('Error accessing the microphone', error);
            throw error;
        }
    }
  
    decodeFrequencies() {
        const processAudio = () => {
            if (!this.isReceiving) return;
  
            const currentTime = Date.now();
            if (currentTime - this.lastCheckTime! > this.checkInterval) {
            this.analyser?.getByteFrequencyData(this.dataArray);
            const frequency = this.findFrequency();

            console.log('process', frequency);
    
            if (frequency === this.wakeFrequency) {
                console.log('wake');
                this.isSynchronized = true;
            } else if (frequency === this.sleepFrequency) {
                console.log('sleep');
                this.isReceiving = false;
                this.isSynchronized = false;
                this.onReceiveStatusCallback!(this.isReceiving);
                this.onReceivedCallback!(this.receivedText);
            } else if (this.isSynchronized) {
                if (frequency != null) {
                    const char = this.frequencyToChar(frequency);
                    if (char) this.receivedText += char;
                }
            }
    
            this.lastCheckTime = currentTime;
            }
    
            if (this.isReceiving) requestAnimationFrame(processAudio);
        };
    
        this.isReceiving = true;
        this.onReceiveStatusCallback!(this.isReceiving);
        requestAnimationFrame(processAudio);
    }
  
    findFrequency() {
        let maxIndex = -1;
        let maxValue = 0;

        for (let i = 0; i < this.bufferLength!; i++) {
            if (this.dataArray[i] > maxValue && this.dataArray[i] > 128) {
                maxIndex = i;
                maxValue = this.dataArray[i];
            }
        }

        if (maxIndex !== -1) {
            const nyquist = this.audioContext!.sampleRate / 2;
            return nyquist / this.bufferLength! * maxIndex;
        }
        
        return null;
    }
  
    frequencyToChar(frequency: number) {
        const charCode = Math.round((frequency - 440) / bucketSize);

        if (charCode >= 32 && charCode <= 126) {
            return String.fromCharCode(charCode);
        }

        return null;
    }

    stopReceiving() {
        this.isReceiving = false;

        this.onReceiveStatusCallback!(this.isReceiving);
    }
  
    stopAudioContext() {
        if (this.audioContext != null) {
            this.audioContext.close();
        }

        this.isReceiving = false;
        this.isSynchronized = false;

        this.onReceiveStatusCallback!(this.isReceiving);
    }
  }
  
  export default AudioDataReceiver;
  