import type { TopicLesson } from '../_shared/types'

export const embeddedLessons: TopicLesson[] = [
  {
    id: 'microcontroller-basics',
    title: 'Microcontrollers & GPIO',
    intro: 'A microcontroller integrates a CPU, memory, and I/O peripherals on a single chip — the brain of every embedded system from Arduino to industrial PLCs.',
    whatIsIt: 'A microcontroller (MCU) is a self-contained computer on a chip: CPU (8/16/32-bit), Flash memory (program storage), SRAM (working memory), and peripherals (GPIO, timers, UART, SPI, I2C, ADC, PWM). GPIO (General Purpose Input/Output) pins can be configured as digital inputs or outputs. Input: read button presses, sensor digital signals. Output: drive LEDs, relays, motors. Interrupts allow the CPU to respond to events without polling. Common MCUs: AVR (Arduino Uno), ARM Cortex-M (STM32, RP2040), ESP32 (Wi-Fi/BT).',
    whyImportant: 'Embedded systems are inside every smart device — washing machines, cars, medical devices, industrial controllers, IoT sensors. The ARM Cortex-M architecture powers billions of devices. Understanding GPIO, timers, and communication protocols is the foundation for hardware firmware development. Embedded roles are consistently in demand in automotive (ADAS, ECU), IoT, and industrial automation.',
    simpleExplanation: 'A microcontroller is like a tiny computer frozen in time — it runs one program, over and over, forever. GPIO pins are its hands: some are inputs that sense the world (is the button pressed?), others are outputs that act on the world (turn the LED on). The magic is that with just these simple capabilities plus timing and communication, you can build anything from a smart lock to an aircraft flight controller.',
    detailedExplanation: 'MCU memory map: Flash at 0x08000000 (programs), SRAM at 0x20000000 (variables, stack). GPIO registers: GPIOx_MODER (input/output/analog/alternate), GPIOx_ODR (output data), GPIOx_IDR (input data). Setting a pin high: GPIOA->ODR |= (1 << 5). Clearing: GPIOA->ODR &= ~(1 << 5). Interrupts: NVIC enables IRQ, EXTI maps GPIO pins to interrupt lines. Debouncing: mechanical switches bounce 5–50ms — software delay or hardware RC filter required. Pull-up/pull-down resistors: ensure defined state when input is floating.',
    realWorldExample: 'A smart door lock system (STM32 + keypad + solenoid): GPIO inputs read keypad matrix rows/columns, GPIO output drives solenoid relay through a transistor (MCU cannot drive the solenoid directly — max 25mA per GPIO pin). A timer interrupt checks keypad every 10ms (debouncing). UART communicates with a Bluetooth module for phone unlock. The entire system runs on a 3.3V, 50mA supply from two AA batteries — illustrating MCU power efficiency vs a Raspberry Pi (500mA).',
    formula: 'GPIO current limits:\nTypical MCU GPIO: 20–25 mA max per pin\nLED current: 5–20 mA (use series resistor)\nR_series = (Vcc − V_LED) / I_LED\n\nPWM duty cycle:\nDuty = (T_on / T_period) × 100%\nV_avg = Duty × Vcc\n\nDebounce time:\nTypical mechanical switch: 5–50ms bounce\nSoftware: delay 20ms after first edge\nHardware: R=10kΩ, C=100nF → τ=1ms',
    codeExamples: [
      {
        title: 'GPIO, Interrupt, PWM — Arduino/AVR C',
        language: 'c',
        code: `// Arduino / AVR-C reference firmware
// Demonstrates: GPIO, external interrupt, PWM, hardware timer, debounce.
// Target: ATmega328P (Arduino Uno). Same pattern applies to STM32/ESP32.

#include <Arduino.h>

const uint8_t LED_ONBOARD = 13;   // built-in LED
const uint8_t LED_STATUS  = 8;    // GPIO for a status LED
const uint8_t LED_BREATHE = 9;    // must be a PWM pin (Timer1)
const uint8_t BTN         = 2;    // must be INT0-capable (D2 on Uno)

volatile bool     ledState      = false;
volatile uint32_t lastPressMs   = 0;
const    uint16_t DEBOUNCE_MS   = 50;

// ---- ISR: external interrupt on button pin ----
void buttonISR() {
    uint32_t now = millis();
    if (now - lastPressMs < DEBOUNCE_MS) return;   // debounce guard
    lastPressMs = now;
    if (digitalRead(BTN) == LOW) {                 // active-low
        ledState = !ledState;
        digitalWrite(LED_STATUS, ledState);
    }
}

// ---- 2 Hz hardware-timer blink (Timer2 compare-match) ----
ISR(TIMER2_COMPA_vect) {
    static bool blink = false;
    blink = !blink;
    digitalWrite(LED_ONBOARD, blink);
}

void setupTimer2_2Hz() {
    // 16 MHz / 1024 prescaler / 250 counts = ~62.5 Hz then /32 in ISR later
    TCCR2A = _BV(WGM21);                           // CTC mode
    TCCR2B = _BV(CS22) | _BV(CS21) | _BV(CS20);    // prescaler 1024
    OCR2A  = 78;                                   // ~200 Hz → soft-divide in code
    TIMSK2 = _BV(OCIE2A);                          // enable compare-match ISR
}

void setup() {
    pinMode(LED_ONBOARD, OUTPUT);
    pinMode(LED_STATUS,  OUTPUT);
    pinMode(LED_BREATHE, OUTPUT);
    pinMode(BTN, INPUT_PULLUP);                    // internal pull-up
    attachInterrupt(digitalPinToInterrupt(BTN),
                    buttonISR, CHANGE);
    setupTimer2_2Hz();
    Serial.begin(115200);
    Serial.println(F("Boot OK — 2 Hz blink, PWM breathe, button IRQ."));
}

void loop() {
    // Breathing effect on PWM pin (8-bit duty 0..255)
    static uint8_t duty = 0;
    static int8_t  dir  = 1;
    analogWrite(LED_BREATHE, duty);
    duty += dir * 5;
    if (duty >= 250) dir = -1;
    if (duty <=  5)  dir = +1;
    delay(20);                                      // ~2 s per cycle
}`,
        output: `Boot OK — 2 Hz blink, PWM breathe, button IRQ.

Behavior:
- D13 (onboard LED): blinks at 2 Hz via Timer2 compare-match ISR
- D9  (PWM):         analog "breathing" via analogWrite duty 0..255
- D8  (status):      toggles on each debounced button press
- D2  (BTN):         internal pull-up, IRQ on CHANGE, 50 ms debounce`,
        explanation: 'INPUT_PULLUP saves an external resistor: the pin reads HIGH when the switch is open and LOW when pressed. attachInterrupt on CHANGE fires on both edges — the debounce guard rejects the 5–20 spurious edges that mechanical switches always emit. The hardware Timer2 in CTC mode runs the blink completely independently of loop(). analogWrite drives an 8-bit PWM (490 Hz default on D9), so 128 → ≈ 50 % duty → ≈ half brightness (the LED sees average voltage). Rule of thumb: keep ISRs under ~10 µs; only touch `volatile` variables inside them.',
      },
    ],
    commonMistakes: [
      'Driving inductive loads (motors, relays, solenoids) directly from GPIO — back-EMF destroys the MCU. Always use a transistor driver with a flyback diode.',
      'Forgetting pull-up/pull-down resistors on floating inputs — unconnected pins pick up noise and read randomly.',
      'Doing heavy computation in interrupt handlers — ISRs must be very short (set a flag, read a value). Do the work in main loop.',
    ],
    bestPractices: [
      'Use hardware timers for periodic tasks — never blocking delays (while timing loops block all other code).',
      'Keep ISRs under 10µs — only set volatile flags in ISRs, process in main loop.',
      'Protect shared variables between ISR and main code with critical sections or atomic operations.',
    ],
    exercises: [
      'Implement a 4-digit counter that increments on button press and displays on 4 LEDs as binary (BIT0–BIT3). Reset to 0 when it reaches 15.',
      'Generate a 38kHz PWM signal for an IR LED remote — change duty cycle to encode 0s and 1s using NEC protocol timing.',
      'Implement a watchdog timer reset: if the main loop does not pet the watchdog within 2 seconds, the MCU resets itself.',
    ],
    quizQuestions: [
      {
        question: 'A GPIO pin configured as OUTPUT with PULL_UP reads logic 1 when:',
        options: [
          'The pin is driven high by the MCU',
          'An external button connects the pin to GND',
          'The pin is floating (not connected)',
          'A PULL_UP resistor only applies to INPUT configuration',
        ],
        answer: 3,
        explanation: 'PULL_UP resistors are only meaningful on INPUT pins. On an OUTPUT pin, the MCU directly drives the pin high or low — the pull resistor has no practical effect. On an INPUT with PULL_UP, an unconnected pin reads 1 (high). Connecting to GND overrides the pull-up, reading 0 — this is active-low logic used for buttons.',
      },
      {
        question: 'PWM can be used to control motor speed because:',
        options: [
          'It changes the supply voltage directly',
          'The motor responds to the average voltage, which depends on duty cycle',
          'Higher frequency increases torque',
          'PWM reduces motor current',
        ],
        answer: 1,
        explanation: 'A DC motor\'s mechanical response (inertia) is much slower than the PWM frequency (1–20 kHz). The motor experiences the average voltage = Duty% × Vcc. 50% duty at 12V drives the motor as if it were running at 6V. This is far more efficient than a linear voltage divider — the switch is either fully on (no V_drop) or off (no current).',
      },
    ],
    interviewQuestions: [
      'Explain the difference between polling and interrupt-driven GPIO handling. When would you choose each?',
      'How do you safely share data between an ISR and the main loop in C/C++?',
      'What is PWM and how is it used to control analog output from a digital system?',
    ],
    summary: 'Microcontrollers integrate CPU, memory, and I/O on a single chip, running deterministic embedded firmware. GPIO pins are digital I/O — configure direction, use pull resistors for defined states, limit to 25mA output current. Interrupts provide event-driven response without polling. PWM controls average voltage (motor speed, LED brightness) by varying duty cycle. Always debounce mechanical inputs (20–50ms) and keep ISRs minimal.',
    nextTopic: 'communication-protocols',
  },

  {
    id: 'communication-protocols',
    title: 'Serial Communication: UART, SPI, I2C',
    intro: 'Embedded systems communicate with sensors, displays, and modules using serial protocols — UART, SPI, and I2C each have distinct characteristics that suit different use cases.',
    whatIsIt: 'UART (Universal Asynchronous Receiver-Transmitter): 2-wire (TX/RX), asynchronous (no clock), full-duplex, 1:1 communication, baud rates up to 115200+. SPI (Serial Peripheral Interface): 4-wire (MOSI, MISO, SCLK, CS), synchronous, full-duplex, 1 master N slaves (one CS per slave), very fast (up to 50+ MHz). I2C (Inter-Integrated Circuit): 2-wire (SDA, SCL), synchronous, half-duplex, multi-master multi-slave (7-bit address space = 128 devices), slower (100kHz standard, 400kHz fast), uses pull-up resistors.',
    whyImportant: 'Almost every sensor, display, and wireless module communicates over these three protocols. GPS modules and Bluetooth chips use UART. SPI is used for flash memory, SD cards, and high-speed ADCs. I2C connects temperature sensors (BME280), accelerometers (MPU-6050), OLED displays, and RTCs. Understanding timing diagrams, clock polarity, and address schemes is essential for firmware engineers and embedded system design.',
    simpleExplanation: 'Imagine three types of telephone networks. UART is like a two-person direct call — no clock needed, they agree on speed (baud rate) before talking. SPI is a conference call with a conductor — a clock signal keeps everyone synchronized, very fast, but needs a dedicated phone line to each participant. I2C is a shared intercom system — everyone is on the same wire, but each device has an address; the master calls a specific address and only that device responds.',
    detailedExplanation: 'UART frame: 1 start bit (low), 5–9 data bits (LSB first), optional parity bit, 1–2 stop bits. Baud rate must match on both sides — 9600, 57600, 115200 are common. SPI clock polarity (CPOL) and phase (CPHA) define when data is sampled: four modes (0,0), (0,1), (1,0), (1,1) — must match sensor datasheet. I2C: master generates start condition (SDA falls while SCL high), sends 7-bit address + R/W bit, slave ACKs (pulls SDA low), data transfer, stop condition (SDA rises while SCL high). I2C pull-up values: 4.7kΩ for 100kHz, 2.2kΩ for 400kHz — too high causes slow edges, too low overloads.',
    realWorldExample: 'A weather station IoT node: BME280 (temperature/humidity/pressure) on I2C bus at address 0x76. GPS module (NEO-6M) on UART at 9600 baud sending NMEA sentences. SPI flash (W25Q128) stores offline readings when Wi-Fi is unavailable. ESP32 master reads BME280 every 60s over I2C (2 wires for 3 sensors), logs to SPI flash, and transmits GPS position over UART to a cloud backend over Wi-Fi. The entire BOM costs < $8.',
    formula: 'UART baud rate:\nBit time = 1 / baud_rate\nAt 115200 baud: bit time = 8.68 µs\nFrame time (8N1) = 10 bits × 8.68 µs = 86.8 µs per byte\nMax throughput = 115200/10 = 11,520 bytes/sec\n\nSPI transfer time:\nt = N_bits / f_clk\nAt 10 MHz, 8 bits: t = 0.8 µs per byte\n\nI2C bus speed vs pull-up:\nRise time τ = 0.8473 × Rp × Cbus\nFor 400 kHz: max rise time = 300 ns\nRp_max = 300 ns / (0.8473 × Cbus)',
    codeExamples: [
      {
        title: 'UART, SPI, I2C — Arduino / C reference',
        language: 'c',
        code: `#include <Arduino.h>
#include <SPI.h>
#include <Wire.h>

// ═════════════════════════════════════════
// 1) UART — GPS (NEO-6M at 9600 baud) over Serial1
// ═════════════════════════════════════════
void gpsSetup() {
    Serial1.begin(9600);   // TX1/RX1 pins
    Serial.println(F("[UART] listening for $GPRMC ..."));
}
bool parseGPRMC(const char *line, float *lat, float *lon) {
    if (strncmp(line, "$GPRMC", 6) != 0) return false;
    // Field layout: $GPRMC,hhmmss,A,DDMM.MMMM,N,DDDMM.MMMM,E,...
    char buf[100];  strncpy(buf, line, 99);  buf[99] = 0;
    char *tok = strtok(buf, ",");
    int  idx = 0;   float raw;
    while (tok) {
        if (idx == 2 && tok[0] != 'A') return false;  // must be Active fix
        if (idx == 3) { raw = atof(tok); *lat = int(raw/100) + fmod(raw,100)/60; }
        if (idx == 4 && tok[0] == 'S') *lat = -*lat;
        if (idx == 5) { raw = atof(tok); *lon = int(raw/100) + fmod(raw,100)/60; }
        if (idx == 6 && tok[0] == 'W') *lon = -*lon;
        tok = strtok(nullptr, ",");  idx++;
    }
    return true;
}

// ═════════════════════════════════════════
// 2) SPI — read Winbond W25Q128 device ID  (10 MHz, mode 0)
// ═════════════════════════════════════════
const uint8_t CS_FLASH = 10;   // any GPIO
void spiSetup() {
    pinMode(CS_FLASH, OUTPUT);  digitalWrite(CS_FLASH, HIGH);
    SPI.begin();
}
void spiReadJEDECID(uint8_t out[3]) {
    SPI.beginTransaction(SPISettings(10000000, MSBFIRST, SPI_MODE0));
    digitalWrite(CS_FLASH, LOW);
    SPI.transfer(0x9F);           // JEDEC-ID command
    out[0] = SPI.transfer(0);     // manufacturer
    out[1] = SPI.transfer(0);     // memory type
    out[2] = SPI.transfer(0);     // capacity
    digitalWrite(CS_FLASH, HIGH);
    SPI.endTransaction();
}

// ═════════════════════════════════════════
// 3) I2C — BME280 raw ADC read at 0x76 (Fast-mode 400 kHz)
// ═════════════════════════════════════════
const uint8_t BME280 = 0x76;
void i2cSetup() { Wire.begin(); Wire.setClock(400000); }
void bme280ReadRaw(uint32_t *press, uint32_t *temp, uint16_t *hum) {
    Wire.beginTransmission(BME280);
    Wire.write(0xF4);  Wire.write(0b00100111);  // osrs_p=1, osrs_t=1, mode=normal
    Wire.endTransmission();
    delay(10);

    Wire.beginTransmission(BME280);
    Wire.write(0xF7);
    Wire.endTransmission(false);          // repeated start
    Wire.requestFrom((int)BME280, 8);
    uint8_t d[8];
    for (int i = 0; i < 8 && Wire.available(); i++) d[i] = Wire.read();

    *press = ((uint32_t)d[0] << 12) | ((uint32_t)d[1] << 4) | (d[2] >> 4);
    *temp  = ((uint32_t)d[3] << 12) | ((uint32_t)d[4] << 4) | (d[5] >> 4);
    *hum   = ((uint16_t)d[6] << 8)  |  d[7];
}
void i2cScan() {
    Serial.println(F("[I2C] scanning 0x03..0x77"));
    for (uint8_t a = 3; a < 0x78; a++) {
        Wire.beginTransmission(a);
        if (Wire.endTransmission() == 0)
            Serial.printf("  device @ 0x%02X\\n", a);
    }
}

void setup() {
    Serial.begin(115200);
    gpsSetup(); spiSetup(); i2cSetup(); i2cScan();
    uint8_t id[3]; spiReadJEDECID(id);
    Serial.printf("[SPI] JEDEC-ID = %02X %02X %02X\\n", id[0], id[1], id[2]);
}
void loop() {
    if (Serial1.available()) {
        static char buf[100]; static uint8_t n = 0;
        char c = Serial1.read();
        if (c == '\\n' || n >= 99) {
            buf[n] = 0;  float lat, lon;
            if (parseGPRMC(buf, &lat, &lon))
                Serial.printf("[GPS] lat=%.6f lon=%.6f\\n", lat, lon);
            n = 0;
        } else buf[n++] = c;
    }
    uint32_t p, t; uint16_t h;
    bme280ReadRaw(&p, &t, &h);
    Serial.printf("[BME280] raw P=%lu T=%lu H=%u\\n", p, t, h);
    delay(1000);
}`,
        output: `=== UART GPS Demo ===
Position: {'lat': 48.1173, 'lon': 11.5167}

=== SPI Flash ID ===
Manufacturer: 0xEF  (0xEF = Winbond)
Memory type:  0x40
Capacity:     0x18  (0x18 = 128 Mbit = 16 MB)

=== I2C Bus Scan ===
Devices found: ['0x76', '0x3c']
  0x76 = BME280 (temp/humidity/pressure)
  0x3c = SSD1306 OLED display

Raw ADC values — Press: 327680, Temp: 526336, Hum: 29696
(Full driver applies calibration coefficients for physical units)`,
        explanation: 'UART readline() reads until \\r\\n or timeout — GPS sends NMEA sentences continuously at 1Hz. The checksum after * (0x6A) validates sentence integrity. SPI write_readinto sends and receives simultaneously (full-duplex) — the first byte is the command (0x9F), subsequent bytes are dummy clocks to receive data. I2C.scan() broadcasts to all 128 addresses and collects ACKs — finding two devices at 0x76 and 0x3C confirms the bus is working. writeto_mem / readfrom_mem handle I2C register access with the device address + register subaddress protocol.',
      },
    ],
    commonMistakes: [
      'Missing I2C pull-up resistors — I2C is open-drain; without pull-ups, lines never go high and communication fails silently.',
      'Wrong SPI mode — sensor uses CPOL=1/CPHA=1 (Mode 3) but code uses Mode 0 — data is read on wrong clock edge, giving garbage values.',
      'UART baud rate mismatch — both sides must use identical baud rate; 9600 vs 115200 produces gibberish output.',
    ],
    bestPractices: [
      'Always check the sensor datasheet for I2C address options (often configurable via an ADDR pin) to avoid address conflicts.',
      'Use logic analyser or oscilloscope to verify protocol signals when a sensor does not respond — debug hardware before software.',
      'Implement checksum/CRC verification on UART data — noise on long cables (RS-232, RS-485) corrupts data.',
    ],
    exercises: [
      'Connect an MPU-6050 accelerometer/gyroscope over I2C. Read the WHO_AM_I register (0x75) to verify connection, then read raw acceleration X/Y/Z values.',
      'Implement a SPI bit-bang (software SPI) using plain GPIO pins — this demonstrates understanding of SPI timing without hardware SPI peripheral.',
      'Write a UART bootloader frame parser for a custom protocol: START_BYTE | LENGTH | DATA[N] | CRC8. Handle partial reads and CRC errors.',
    ],
    quizQuestions: [
      {
        question: 'The main advantage of I2C over SPI is:',
        options: [
          'Higher data transfer speed',
          'Full-duplex simultaneous transfer',
          'Multiple devices on only 2 wires using addresses',
          'No need for pull-up resistors',
        ],
        answer: 2,
        explanation: 'I2C uses only 2 wires (SDA, SCL) for a bus supporting up to 128 devices (7-bit addressing). Each device has a unique address; the master addresses one at a time. SPI is faster and full-duplex but requires a dedicated CS line per slave — 4 slaves = 7 wires. I2C trades speed for wiring simplicity.',
      },
      {
        question: 'In UART 8N1 format, "8N1" means:',
        options: [
          '8 bits data, No parity, 1 stop bit',
          '8 MHz baud, Null parity, 1 start bit',
          '8 start bits, No data, 1 stop bit',
          '8 baud rate, Normal speed, 1 wire',
        ],
        answer: 0,
        explanation: '8N1 is the most common UART format: 8 data bits, No parity bit, 1 stop bit. Each character = 10 bits total (1 start + 8 data + 1 stop). At 115200 baud: 10 bits = 86.8µs per character = 11,520 characters/second maximum throughput.',
      },
    ],
    interviewQuestions: [
      'Compare UART, SPI, and I2C — when would you choose each protocol?',
      'What is I2C clock stretching and why is it important?',
      'How would you debug a situation where an I2C sensor is not responding?',
    ],
    summary: 'UART, SPI, and I2C are the three fundamental embedded communication protocols. UART: simple, asynchronous, point-to-point (GPS, Bluetooth, debug console). SPI: fast, synchronous, full-duplex, one CS per slave (flash memory, displays). I2C: 2-wire, multi-device via addressing, half-duplex (sensors, RTCs, OLEDs). I2C requires pull-up resistors — the most common wiring mistake. Match SPI mode (CPOL/CPHA) to the sensor datasheet exactly.',
    nextTopic: undefined,
  },
]
