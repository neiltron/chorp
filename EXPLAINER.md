# CHORP: Audio Modem via FFT

CHORP transmits text between devices using audio frequencies—one device plays tones through speakers, another listens via microphone and decodes them back to text.

## How It Works

**Encoding:** Each character maps to a specific frequency from a 60-note bank spanning 261 Hz to 7902 Hz (7 octaves). Characters are played sequentially as 100ms sine wave tones.

**Decoding:** The receiver runs a 2048-point FFT on the microphone input, finds the dominant frequency bin, and maps it back to the nearest known tone using binary search. A character only registers when the same frequency is detected twice consecutively (debouncing against noise).

## The Frequency Map

42 characters are supported: a-z, 0-9, space, period, question mark, newline, and null. Each is assigned a unique frequency from the chromatic scale.

## Signal Path

```
Sender: text → character → frequency lookup → oscillator → speaker

Receiver: microphone → FFT → peak detection → frequency match → character
```

## Limitations

- ~10 chars/second (100ms per tone)
- No error correction
- Susceptible to ambient noise
- Half-duplex (send or receive, not both)
