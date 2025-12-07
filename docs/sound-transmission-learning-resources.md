# Sound Transmission Techniques: Learning Resources

This document covers concepts from basic principles through advanced topics, organized as a learning path for understanding audio data transmission like Chorp and dial-up modems.

---

## Table of Contents

1. [Basic Principles: Sampling & Quantization](#1-basic-principles-sampling--quantization)
2. [Frequency Shift Keying (FSK)](#2-frequency-shift-keying-fsk---what-chorp-uses)
3. [FFT & Frequency Detection](#3-fft--frequency-detection-web-audio-api)
4. [Advanced Modulation (Beyond FSK)](#4-advanced-modulation-beyond-fsk)
5. [Error Detection & Correction](#5-error-detection--correction)
6. [Acoustic Data Transmission](#6-acoustic-data-transmission)
7. [DIY Projects & Tutorials](#7-diy-projects--tutorials)
8. [Suggested Learning Path](#suggested-learning-path)
9. [Ideas for Enhancing Chorp](#ideas-for-enhancing-chorp)
10. [Advanced Implementation Topics](#advanced-implementation-topics)

---

## 1. Basic Principles: Sampling & Quantization

Before transmitting data as sound, we need to understand how analog signals become digital.

### Sampling

Converting continuous signals into discrete snapshots at regular intervals. The **Nyquist-Shannon Sampling Theorem** states you must sample at least **2x the highest frequency** to avoid aliasing (distortion from undersampling).

### Quantization

Mapping infinite amplitude values to a finite set of discrete levels. More bits = more precision but also more data. A 10-bit ADC has 1024 levels; 16-bit audio has 65,536 levels.

### Key Concepts

- **Quantization error**: The difference between actual and quantized values (max ±½ LSB)
- **Quantization noise**: Treated as additive noise in signal processing

### Resources

- [Princeton: Sampling and Quantization (PDF)](https://www.princeton.edu/~cuff/ele201/kulkarni_text/digitizn.pdf)
- [WPI: Real-Time DSP - Sampling and Quantization](https://schaumont.dyn.wpi.edu/ece4703b20/lecture1.html)
- [Makeability Lab: Quantization and Sampling](https://makeabilitylab.github.io/physcomp/signals/QuantizationAndSampling/index.html)
- [TutorialsPoint: Digital Communication - Quantization](https://www.tutorialspoint.com/digital_communication/digital_communication_quantization.htm)

---

## 2. Frequency Shift Keying (FSK) - What Chorp Uses

FSK is the core technique in Chorp and early dial-up modems.

### How It Works

- Binary data is encoded by switching between frequencies
- **Mark frequency** = logic 1 (high)
- **Space frequency** = logic 0 (low)
- Information is in frequency, not amplitude → robust against noise

### Historical Context

- **Bell 103 modem** (1962): 300 bps using AFSK
- **V.21 standard**: Originator uses 980/1180 Hz, answerer uses 1650/1850 Hz
- FSK is bandwidth-inefficient (max ~1800 bps on phone lines)

### Audio FSK (AFSK)

Chorp uses AFSK - encoding data as audible tones. This is the same principle used in:

- Ham radio packet communications
- Emergency alert systems
- Early modem standards

### Resources

- [Wikipedia: Frequency-shift keying](https://en.wikipedia.org/wiki/Frequency-shift_keying)
- [TechTarget: What is FSK?](https://www.techtarget.com/searchnetworking/definition/frequency-shift-keying)
- [TutorialsPoint: FSK Digital Communication](https://www.tutorialspoint.com/digital_communication/digital_communication_frequency_shift_keying.htm)
- [Wray Castle: Beginner's Guide to FSK](https://wraycastle.com/blogs/knowledge-base/frequency-shift-keying)
- [CS Stan: Modulation and Modems](https://www.cs.csustan.edu/~john/Classes/Previous_Semesters/CS3000_Communication_Networks/2017_02_Spring/Notes/chap10.html)

---

## 3. FFT & Frequency Detection (Web Audio API)

Chorp uses FFT to detect which frequency is being received.

### Fast Fourier Transform (FFT)

Converts time-domain audio into frequency-domain data, showing which frequencies are present and how loud they are.

### Web Audio API Implementation

```
fftSize = 2048  →  frequencyBinCount = 1024 bins
bin width = sampleRate / fftSize = 44100 / 2048 ≈ 21.5 Hz per bin
```

### Key Concepts

- **AnalyserNode**: Real-time frequency and time-domain analysis
- **getFloatFrequencyData()**: Returns dB values for each frequency bin
- **Peak detection**: Finding the dominant frequency requires interpolation between bins

### Resources

- [MDN: AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode)
- [MDN: Visualizations with Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)
- [SitePoint: Fourier Transforms with Web Audio API](https://www.sitepoint.com/using-fourier-transforms-web-audio-api/)
- [Boris Smus: Web Audio API Book - Ch 5 Analysis](https://webaudioapi.com/book/Web_Audio_API_Boris_Smus_html/ch05.html)
- [Stack Overflow: FFT Data in Web Audio](https://stackoverflow.com/questions/14789283/what-does-the-fft-data-in-the-web-audio-api-correspond-to)

---

## 4. Advanced Modulation (Beyond FSK)

Why dial-up modems evolved beyond FSK to achieve higher speeds.

### Phase Shift Keying (PSK)

- Encodes data by shifting carrier **phase**
- **BPSK**: 2 phases = 1 bit/symbol
- **QPSK**: 4 phases = 2 bits/symbol
- More bandwidth-efficient than FSK

### Quadrature Amplitude Modulation (QAM)

- Combines **amplitude AND phase** modulation
- **16-QAM**: 4 bits/symbol
- **256-QAM**: 8 bits/symbol (cable modems, Wi-Fi)
- **1024-QAM**: Used in Wi-Fi 6
- Requires clean channel (sensitive to noise)

### Trade-offs

| Technique | Bits/Symbol | Noise Resistance | Complexity |
|-----------|-------------|------------------|------------|
| FSK       | 1           | Excellent        | Simple     |
| QPSK      | 2           | Good             | Moderate   |
| 16-QAM    | 4           | Moderate         | Higher     |
| 256-QAM   | 8           | Lower            | Complex    |

### Resources

- [Wikipedia: Quadrature Amplitude Modulation](https://en.wikipedia.org/wiki/Quadrature_amplitude_modulation)
- [PySDR: Digital Modulation (Python Guide)](https://pysdr.org/content/digital_modulation.html)
- [Electronic Design: Modern Digital Modulation](https://www.electronicdesign.com/technologies/communications/article/21798737/electronic-design-understanding-modern-digital-modulation-techniques)
- [Analog Devices: Mixed Modulation Schemes](https://ez.analog.com/ez-blogs/b/engineering-mind/posts/mixed-modulation-schemes-for-digital-signals-ask-fsk-psk-qam)
- [Patsnap: QAM vs PSK vs FSK](https://eureka.patsnap.com/article/qam-vs-psk-vs-fsk-when-to-use-each-modulation-scheme)

---

## 5. Error Detection & Correction

Currently missing in Chorp - critical for reliable transmission.

### Error Types

- **Single-bit error**: One bit flipped
- **Burst error**: Multiple consecutive bits corrupted
- **Multiple-bit error**: Non-consecutive bits affected

### Detection Methods

#### Parity Bits (Simplest)

- Add 1 bit to make total 1s even/odd
- Detects single-bit errors only

#### Checksum

- Sum data words, append result
- Receiver recomputes and compares
- Better than parity but still detection-only

#### CRC (Cyclic Redundancy Check)

- Polynomial division
- Very powerful detection
- Used in Ethernet, USB, ZIP files

### Correction Methods

#### Hamming Code

- Adds redundant bits at positions 1, 2, 4, 8, 16...
- Can detect AND correct single-bit errors
- Formula: `2^r ≥ m + r + 1` (r = parity bits, m = data bits)
- Used in ECC RAM, telecommunications

#### Forward Error Correction (FEC)

- Sender adds enough redundancy to correct errors
- No retransmission needed
- Used in satellite, deep space communications

### Resources

- [ElectronicsHub: Error Correction and Detection Codes](https://www.electronicshub.org/error-correction-and-detection-codes/)
- [GeeksforGeeks: Hamming Code](https://www.geeksforgeeks.org/computer-networks/hamming-code-in-computer-network/)
- [Baeldung: Hamming Code Error Detection](https://www.baeldung.com/cs/hamming-code-error-detection-correction)
- [Longwood University: Hamming Codes (PDF)](https://www.cs.longwood.edu/courses/cmsc121/resources/f16/hamming-codes/Hamming%20codes.pdf)
- [IIT Kharagpur: Error Detection and Correction (PDF)](https://cse.iitkgp.ac.in/~ksrao/pdf/iti-18/slide-3.pdf)

---

## 6. Acoustic Data Transmission

The broader field that Chorp belongs to.

### Applications

- **Underwater modems**: Where RF doesn't work
- **Near-field communication**: Phone-to-phone via audio
- **IoT/Proximity**: Data over speaker/mic (no pairing)
- **Retro computing**: Acoustic couplers for phones

### Limitations

- ~1000 bps max with consumer hardware
- ~10 meter range typically
- Lower frequencies = longer range but less bandwidth
- Environmental noise is a major challenge

### Resources

- [Wikipedia: Acoustic Data Transmission](https://en.wikipedia.org/wiki/Acoustic_data_transmission)
- [Discovery of Sound in the Sea: Acoustic Modems](https://dosits.org/galleries/technology-gallery/communications-technology/acoustic-modem/)
- [CUE Audio: Data Over Sound](https://cueaudio.com/data-over-sound/)

---

## 7. DIY Projects & Tutorials

Hands-on resources to learn by building.

### Air-Based (Like Chorp)

- [Cornell ECE 4760: Acoustic Modem](https://people.ece.cornell.edu/land/courses/ece4760/FinalProjects/s2010/gjm76_asr96/gjm76_asr96/index.html) - Full tutorial with source code (GPL)
- [Hackaday: Acoustic Coupler for iPhone](https://hackaday.io/project/19350-an-old-fashion-acoustic-modem-for-the-iphone) - Bell 103A compatible

### Underwater Modems

- [Project Sabine: DIY Underwater Modem (<$300)](https://blog.unetstack.net/Project-Sabine-Low-cost-DIY-underwater-modem-using-COTS-components-and-Unet-audio)
- [AHOI Open-Source Acoustic Modem](https://www3.tuhh.de/acps/projects/ahoi/) - Full documentation and tutorials
- [Cal Poly: Low-Cost Underwater Modem Design (PDF)](https://digitalcommons.calpoly.edu/cgi/viewcontent.cgi?article=1247&context=eeng_fac)

---

## Suggested Learning Path

| Level | Topics | Resources |
|-------|--------|-----------|
| **1. Foundations** | Sampling, Quantization, Nyquist | Princeton PDF, Makeability Lab |
| **2. Basic Modulation** | FSK, AFSK, Mark/Space | Wikipedia FSK, TutorialsPoint |
| **3. Signal Analysis** | FFT, Frequency Bins, Peak Detection | MDN AnalyserNode, SitePoint |
| **4. Error Handling** | Parity, Checksum, Hamming | GeeksforGeeks, ElectronicsHub |
| **5. Advanced Modulation** | PSK, QAM, Constellation Diagrams | PySDR (excellent!), Wikipedia |
| **6. Hands-On** | Build acoustic modem | Cornell ECE 4760, AHOI |

---

## Ideas for Enhancing Chorp

Based on this research, potential improvements:

1. **Add start/stop sync tones** - Help receiver know when message begins/ends
2. **Implement checksum** - Detect transmission errors
3. **Add Hamming code** - Correct single-bit errors
4. **Use QPSK** - Double throughput with phase encoding
5. **Implement ACK/NAK** - Request retransmission on error
6. **Add Goertzel filters** - More efficient than FFT for detecting specific frequencies

---

## Advanced Implementation Topics

### Goertzel Algorithm

More efficient than FFT when detecting only a few specific frequencies (like DTMF tones).

**When to use**: If you only need to detect a few frequencies, Goertzel is much faster than computing a full FFT.

**Resources**:
- [Wikipedia: Goertzel Algorithm](https://en.wikipedia.org/wiki/Goertzel_algorithm)
- [Embedded.com: The Goertzel Algorithm](https://www.embedded.com/the-goertzel-algorithm/)
- [MathWorks: DFT Estimation with Goertzel](https://www.mathworks.com/help/signal/ug/dft-estimation-with-the-goertzel-algorithm.html)
- [STMicroelectronics: Goertzel Algorithm (PDF)](https://www.st.com/resource/en/design_tip/dt0089-the-goertzel-algorithm-to-compute-individual-terms-of-the-discrete-fourier-transform-dft-stmicroelectronics.pdf)
- [Texas Instruments: Modified Goertzel in DTMF Detection (PDF)](https://www.ti.com/lit/pdf/spra066)

### Symbol Synchronization & Timing Recovery

Critical for reliable decoding - the receiver must know exactly when each symbol starts.

**Key concepts**:
- **Bit sync**: Aligning to individual bit boundaries
- **Byte sync**: Aligning to character/word boundaries
- **Timing recovery circuits**: Extract timing from the signal itself

**Resources**:
- [GaussianWaves: Symbol Timing Recovery for QPSK](https://www.gaussianwaves.com/2013/11/symbol-timing-recovery-for-qpsk-digital-modulations/)
- [University of Washington: Carrier and Bit Synchronization (PDF)](http://faculty.washington.edu/jar7/EEclasses/EE506/Notes/sync_franks.pdf)
- [RIT Thesis: Symbol Synchronization Techniques](https://repository.rit.edu/theses/9433/)

### Protocol Framing: Preambles & Sync Words

How to structure data packets for reliable transmission.

**Preamble**: Known pattern (e.g., `10101010...`) for:
- Receiver gain adjustment
- Bit synchronization

**Sync Word**: Unique pattern marking start of actual data for:
- Byte/frame synchronization
- Distinguishing data from noise

**Typical structure**:
```
[Preamble: 4 bytes] [Sync Word: 4 bytes] [Length] [Payload] [Checksum]
```

**Resources**:
- [Wikipedia: Syncword](https://en.wikipedia.org/wiki/Syncword)
- [Wikibooks: Serial Programming - Forming Data Packets](https://en.wikibooks.org/wiki/Serial_Programming/Forming_Data_Packets)
- [Embedded Related: How To Handle Packets When All You Have Are Streams](https://www.embeddedrelated.com/showarticle/113.php)
- [Stack Exchange: Serial Protocol Synchronization Techniques](https://electronics.stackexchange.com/questions/186254/serial-protocol-delimiting-synchronization-techniques)

---

## Related Projects & Inspiration

- **GibberLink**: AI voice assistants switching to sound-based protocol
- **Minimodem**: Software audio FSK modem (Bell 103, RTTY, etc.)
- **NOAA DART**: Tsunami warning system using acoustic modems
- **CUE Audio**: Commercial data-over-sound platform

---

*Document created: December 2024*
*For the Chorp project: https://chorp.descend.org*
