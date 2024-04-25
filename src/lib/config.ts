export const startFrequency: number = 360;
export const checkInterval: number = 1;
export const wakeFrequency: number = 1050;
export const sleepFrequency: number = 440
export const toneLength: number = .1;

const notes = [
    261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392, 415.3, 440, 466.16, 493.88,
    523.25, 554.37, 587.33, 622.25, 659.26, 698.46, 739.99, 783.99,
    830.61, 880.00, 932.33, 987.77, 1046.50, 1108.73, 1174.66, 1244.51, 1318.51, 1396.91,
    1479.98, 1567.98, 1661.22, 1760.00, 1864.66, 1975.53, 2093.00, 2217.46, 2349.32, 2489.02,
    2637.02, 2793.83, 2959.96, 3135.96, 3322.44, 3520.00, 3729.31, 3951.07, 4186.01, 4434.92,
    4698.63, 4978.03, 5274.04, 5587.65, 5919.91, 6271.93, 6644.88, 7040.00, 7458.62, 7902.13
];

export const asciiToFrequencyMap: { [key: string]: number } = {}
export const frequencyToAsciiMap: { [key: number]: string } = {}

const asciiCodes = [
    0, 46, 63, 10, 32,
    ...Array.from({length: 26}, (_, i) => i + 97), // a-z
    ...Array.from({length: 10}, (_, i) => i + 48), // 0-9
];

asciiCodes.forEach((code, index) => {
    const noteIndex = index % notes.length;
    const frequency = notes[noteIndex];
    const char = String.fromCharCode(code);
    console.log(char, noteIndex)
    asciiToFrequencyMap[char] = frequency;
    frequencyToAsciiMap[frequency] = char
});

export function findClosestFrequency(target: number) {
    let start = 0;
    let end = notes.length - 1;

    while (start < end) {
        const mid = Math.floor((start + end) / 2);

        if (notes[mid] === target) {
            return notes[mid];
        }

        if (target < notes[mid]) {
            end = mid;
        } else {
            start = mid + 1;
        }
    }

    // Check if start or end is closer to the target
    if (start === 0) return notes[0];
    if (start === notes.length) return notes[notes.length - 1];

    const noteFrequency = (Math.abs(notes[start] - target) < Math.abs(notes[start - 1] - target)) ? notes[start] : notes[start - 1];
    const distance = Math.abs(target - noteFrequency);
    const confidence = (1 - (distance / 25)) * 100;

    console.log(confidence);

    return noteFrequency;
}