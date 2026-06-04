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
        title: 'GPIO, Interrupts, and PWM (MicroPython / RP2040)',
        language: 'python',
        code: `# MicroPython on Raspberry Pi Pico (RP2040)
# Demonstrates: GPIO, external interrupt, PWM, debouncing

from machine import Pin, PWM, Timer
import utime

# ── GPIO Configuration ──
LED_PIN    = Pin(25, Pin.OUT)          # Onboard LED (GP25)
STATUS_LED = Pin(15, Pin.OUT)          # External LED on GP15
BUTTON     = Pin(14, Pin.IN, Pin.PULL_UP)  # Button to GND; PULL_UP → reads 1 when open

# ── PWM for LED brightness control ──
pwm = PWM(Pin(16))                     # PWM on GP16
pwm.freq(1000)                         # 1 kHz carrier frequency

def set_brightness(percent: float):
    """Set LED brightness 0–100%."""
    duty = int(percent / 100 * 65535)  # 16-bit duty (0–65535)
    pwm.duty_u16(duty)

# ── Software debounce state ──
_last_press_ms  = 0
_DEBOUNCE_MS    = 50    # ignore edges within 50ms of last valid press
_led_state      = False

def button_isr(pin):
    """Interrupt handler — runs when button pin changes state."""
    global _last_press_ms, _led_state
    now = utime.ticks_ms()

    # Debounce: ignore if within 50ms of last valid press
    if utime.ticks_diff(now, _last_press_ms) < _DEBOUNCE_MS:
        return

    if pin.value() == 0:               # active-low: 0 = pressed
        _last_press_ms = now
        _led_state = not _led_state
        STATUS_LED.value(_led_state)
        print(f"Button pressed — LED {'ON' if _led_state else 'OFF'}")

# Register interrupt on falling AND rising edge
BUTTON.irq(trigger=Pin.IRQ_FALLING | Pin.IRQ_RISING, handler=button_isr)

# ── Timer-based LED blink ──
_blink_state = False
def blink_timer_cb(timer):
    global _blink_state
    _blink_state = not _blink_state
    LED_PIN.value(_blink_state)

blink_timer = Timer()
blink_timer.init(freq=2, mode=Timer.PERIODIC, callback=blink_timer_cb)  # 2 Hz blink

# ── Main loop: PWM breathing effect ──
print("System started — onboard LED blinks at 2Hz")
print("Press button to toggle GP15 LED")
print("GP16 LED performs breathing effect")

step = 0
direction = 1   # 1 = increasing, -1 = decreasing

while True:
    # Breathing LED: ramp brightness 0% → 100% → 0%
    set_brightness(step)
    step += direction * 2
    if step >= 100:
        direction = -1
    elif step <= 0:
        direction = 1

    utime.sleep_ms(20)   # 20ms × 100 steps = ~2s per breath cycle`,
        output: `System started — onboard LED blinks at 2Hz
Press button to toggle GP15 LED
GP16 LED performs breathing effect

[button press event]
Button pressed — LED ON
[button press 50ms later — ignored (debounce)]
[button press 500ms later]
Button pressed — LED OFF

Behavior:
- GP25 (onboard LED): blinks at 2Hz via hardware timer interrupt
- GP16 (external LED): smooth 0→100→0% brightness "breathing" in main loop
- GP15 (status LED): toggles on each valid button press
- BUTTON: interrupt-driven, 50ms software debounce`,
        explanation: 'PULL_UP makes the pin read 1 (high) when the button is open; pressing the button connects pin to GND → reads 0 (active-low logic). The ISR (interrupt service routine) runs automatically on pin edge — the CPU suspends whatever it is doing, executes the ISR, then resumes. Without debouncing, a single physical press triggers 5–20 interrupts due to contact bounce. PWM duty_u16 uses 16-bit resolution (0–65535), giving 65,536 brightness levels. The timer runs the blink callback in hardware — the main loop continues uninterrupted.',
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
        title: 'UART, SPI, I2C in MicroPython',
        language: 'python',
        code: `from machine import UART, SPI, I2C, Pin
import struct
import utime

# ════════════════════════════════════
# 1. UART — GPS module (NEO-6M at 9600 baud)
# ════════════════════════════════════
uart = UART(0, baudrate=9600, tx=Pin(0), rx=Pin(1), timeout=1000)

def read_gps_nmea():
    """Read one NMEA sentence from GPS module."""
    line = uart.readline()
    if line is None:
        return None
    try:
        sentence = line.decode('ascii').strip()
        return sentence
    except UnicodeDecodeError:
        return None

def parse_gprmc(nmea_line):
    """Parse $GPRMC sentence for lat/lon/speed."""
    if not nmea_line or not nmea_line.startswith('$GPRMC'):
        return None
    parts = nmea_line.split(',')
    if len(parts) < 7 or parts[2] != 'A':   # 'A' = valid fix
        return None
    # Convert DDMM.MMMM to decimal degrees
    lat_raw = float(parts[3])
    lat = int(lat_raw / 100) + (lat_raw % 100) / 60
    if parts[4] == 'S': lat = -lat
    lon_raw = float(parts[5])
    lon = int(lon_raw / 100) + (lon_raw % 100) / 60
    if parts[6] == 'W': lon = -lon
    return {'lat': lat, 'lon': lon}

print("=== UART GPS Demo ===")
# Simulated NMEA sentence (would come from real GPS)
sample = b'$GPRMC,123519,A,4807.038,N,01131.000,E,022.4,084.4,230394,003.1,W*6A\r\n'
uart.write(sample)
result = parse_gprmc(sample.decode().strip())
print(f"Position: {result}")

# ════════════════════════════════════
# 2. SPI — W25Q128 Flash (read device ID)
# ════════════════════════════════════
spi = SPI(0,
          baudrate=10_000_000,    # 10 MHz
          polarity=0, phase=0,    # SPI Mode 0 (CPOL=0, CPHA=0)
          sck=Pin(18), mosi=Pin(19), miso=Pin(16))
cs = Pin(17, Pin.OUT, value=1)   # CS active low

def spi_transfer(data_bytes):
    cs.value(0)                          # Assert CS (select device)
    result = bytearray(len(data_bytes))
    spi.write_readinto(bytearray(data_bytes), result)
    cs.value(1)                          # Deassert CS
    return result

# Read manufacturer/device ID (command 0x9F)
id_bytes = spi_transfer([0x9F, 0x00, 0x00, 0x00])
print(f"\n=== SPI Flash ID ===")
print(f"Manufacturer: 0x{id_bytes[1]:02X}  (0xEF = Winbond)")
print(f"Memory type:  0x{id_bytes[2]:02X}")
print(f"Capacity:     0x{id_bytes[3]:02X}  (0x18 = 128 Mbit = 16 MB)")

# ════════════════════════════════════
# 3. I2C — BME280 Temperature/Humidity/Pressure
# ════════════════════════════════════
i2c = I2C(0, scl=Pin(9), sda=Pin(8), freq=400_000)   # 400 kHz fast mode

BME280_ADDR = 0x76

# Simplified BME280 raw read (real driver handles calibration)
def bme280_read_raw():
    """Read raw ADC values from BME280 (simplified)."""
    # Force measurement mode
    i2c.writeto_mem(BME280_ADDR, 0xF4, bytes([0b00100111]))  # osrs_p=1, osrs_t=1, mode=11
    utime.sleep_ms(10)

    # Read 8 bytes: press(3) + temp(3) + hum(2)
    data = i2c.readfrom_mem(BME280_ADDR, 0xF7, 8)

    press_raw = (data[0] << 12) | (data[1] << 4) | (data[2] >> 4)
    temp_raw  = (data[3] << 12) | (data[4] << 4) | (data[5] >> 4)
    hum_raw   = (data[6] << 8)  |  data[7]

    return press_raw, temp_raw, hum_raw

# Scan I2C bus for devices
print("\n=== I2C Bus Scan ===")
devices = i2c.scan()
print(f"Devices found: {[hex(d) for d in devices]}")
# Expected: [0x76] for BME280 or [0x77] if SDO tied high

try:
    press_r, temp_r, hum_r = bme280_read_raw()
    print(f"Raw ADC values — Press: {press_r}, Temp: {temp_r}, Hum: {hum_r}")
    print("(Full driver applies calibration coefficients for physical units)")
except OSError:
    print("BME280 not found at 0x76 — check wiring and pull-up resistors")`,
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
