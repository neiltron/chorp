import {
    bucketSize,
    checkInterval,
    wakeFrequency,
    sleepFrequency,
    startFrequency,
    frequencyToAsciiMap,
    findClosestFrequency,
} from './config';

const fftSize: number = 2048;
const toneLength: number = .1;

interface AudioDataReceiver {

}

class AudioDataReceiver {
    wakeFrequency: number;
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
        this.wakeFrequency = wakeFrequency;
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
        const signal: {
            lastCharacter: string;
            repeatCharacters: number;
            resetTimeout: ReturnType<typeof setTimeout> | null;
        } = {
            lastCharacter: '',
            repeatCharacters: 0,
            resetTimeout: null
        };
        console.log('count – signal')
        const processAudio = () => {
            if (!this.isReceiving) return;

            const currentTime = Date.now();
            if (currentTime - this.lastCheckTime! > this.checkInterval) {
                this.analyser?.getByteFrequencyData(this.dataArray);
                const frequency = this.findFrequency();

                // console.log(frequency, this.wakeFrequency);

                if (frequency && Math.abs(this.wakeFrequency - frequency) <= 5) {
                    console.log('wake');
                    this.isSynchronized = true;
                } else if (frequency && Math.abs(this.sleepFrequency - frequency) <= 5) {
                    console.log('sleep');
                    this.isReceiving = false;
                    this.isSynchronized = false;
                    // this.onReceiveStatusCallback!(this.isReceiving);
                    this.onReceivedCallback!(this.receivedText);
                }

                if (frequency != null) {
                    const char = this.frequencyToChar(frequency);

                    if (char != null) {
                        // console.log(char, frequency, this.receivedText);
                    }

                    if (char != null) {
                        if (signal.lastCharacter === char) {
                            signal.repeatCharacters += 1;
                        } else {
                            console.log('count - reset')
                            signal.repeatCharacters = 0;
                        }

                        signal.lastCharacter = char;

                        console.log('count', signal.repeatCharacters, char)

                        if (signal.repeatCharacters === 3) {
                            this.receivedText = char;
                            this.onReceivedCallback!(this.receivedText);

                            clearTimeout(signal.resetTimeout!);
                            signal.resetTimeout = setTimeout(() => {
                                signal.repeatCharacters = 0;
                            }, toneLength * 2 * 1000);
                        }
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
        // const charCode = Math.ceil((frequency - startFrequency) / bucketSize) + 32;

        const closestFrequency = findClosestFrequency(frequency);

        if (closestFrequency === 415.30) {
            return;
        }

        const char = frequencyToAsciiMap[closestFrequency]

        console.log(closestFrequency, char);

        return char;

        // if (charCode > 0) {
        //     console.log('charcode', charCode, frequency);
        // }

        // if (charCode >= 32 && charCode <= 126) {
        //     return String.fromCharCode(charCode);
        // }

        return null;
    }

    stopReceiving() {
        this.isReceiving = false;

        if (this.onReceiveStatusCallback != null) {
            this.onReceiveStatusCallback!(this.isReceiving);
        }
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
