# Acoustic Wave Propagation Simulator

This project simulates the propagation of acoustic waves in a 2D space. No concept here is exclusive to Java, and thus, this project can be adapted to any programming language - I'm using ==Java== because I'm most familiar with the ==Swing== library.

<img src="./projects/wave-sim/Screenshot 2026-04-03 013838.png">

## The Plan

- Creating a simulation of sound waves
- Using that simulation to create an Impulse Response (IR)
- Applying that sound to simulate a space

## Simulating waves

When a wave reflects, the shape of its front gets deformed in a complex way. That creates the need for a wave representation that simplifies the simulation.

From the Huygens principle, we know that each wave front can be represented as a load of spherical waves. These spherical waves are very close to each other and they deconstructively interfere in most areas.

If we examine a reflecting wave, we can see that at a local scale, there's always a dominant direction of propagation - the direction that's perpendicular to the front. We can model that direction as a ray. By using many rays, we can create an approximation of the wavefront.

In this implementation, I'm representing each ray as a point - a local energy/wave packet of sorts. Each point travels with the speed of sound and reflects from the surroundings. If we draw a line between each point, we get a close approximation of the actual wave front.

## The Simulation

Each wave can be represented as N different points - packets. Each packet $i$ has coordinates $\vec{r_i}$ and velocity $\vec{v_i}$:

```math
\vec{r_i}(t) = \vec{r_{i,0}}+ \vec{v_i}(t-t_i),
```

where $r_{i,0}$ is the initial position (a.k.a. the source), and $t_i$ - the moment of time when the signal was emitted.

```math
|{\vec{v_i}}| = c_{sound}
```

However, a critical flaw in the current model is that reflections aren't accounted for.

<div class="two-columns">
    <div class="left-column">
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center">
            Upon reflection, we need to change the direction the packet is traveling in. To do that, we can alter its velocity while still keeping the sample magnitude.

            The change in velocity upon reflection:

            ```math
            \vec{v_i'} = \vec{v_i} - 2(\vec{v_i}\cdot\vec{n})\vec{n}
            ```

            The amplitude of the packet gets reduced with each reflection. To make the model more realistic, higher frequency sounds dissipate faster than lower frequency ones.
        </div>
    </div>
    <div class="right-column">
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center">
            <img src="./projects/wave-sim/reflection.svg" style="width: 50%">
        </div>
    </div>
</div>

In this project, the space consists only of rectangles, simplifying the reflections quite a lot.

What about calculating the amplitude of each wave packet? It should decrease with the distance, depeneding on the frequency. This is the way the simulation models it:

```math
a_i = \dfrac{A_i}{s_i}
```

$A_i$ is the amplitude of the signal, and $s_i$ is the distance travelled by each point.

How do we get that distance? A naive approach would be to simply add a `distanceTravelled` property to each `WavePacket` object. However, floating point errors would accumulate with this approach.

There's a neat trick to get the distance travelled without introducing any additional properties. We can simply use the time travelled. Every packet travels with the speed of sound, and every packet was emitted at $t=0$. Because of that, it doesn't matter what trajectory the packet has taken - the moment we observe it, we know that:

```math
s_i = t_ic_{sound}
```

In reality, the amplitude of each wave packet should be dependent on its frequency too. To do that, we can introduce an $\alpha$ term:

```math
\alpha = k f_i^2
```

$k$ has a value of $10^{-8}$.
The altered equation:

```math
a_i = \dfrac{A_i}{s_i}e^{-\alpha s_i}
```

Thus, each packet contributes $W_i(t)$ to the final signal:

```math
W_i(t) = a_i cos(\omega_it+\phi_i) w_i(t)
```

In order to capture an Impulse Response (IR), we can emit a single impulse as the signal. For simplicity's sake, we can treat the impulse as being completely instantenous. As waves travel through space, their phase shifts. That's because signals have a duration for which they pass through the microphone area.

However, in the case of a single instantenous impulse, only the initial detection matters. That means the equation describing $W_i(t)$ can be further simplified:

```math
W_i(t) = a_i
```

## Recording the Produced Sound
    
There's a giant problem with the simulation so far. We can't hear it.

A simple approach would be to simply create a ==.WAV== file using every wave packet. However, this means that every packet would contribute no matter where in the space - and that's not realistic.

In real life, we would record sound by placing a microphone. How about we do the same here? We can add a term that decreases with the square of the distance to simulate how the microphone can pick up only on its surroundings:

```math
W_i(t) = a_iw_i(t)
```

The coefficient $w_i(t)$ models how much the microphone picks up:

```math
w_i(t) = e^{-\dfrac{|{\vec{L}-\vec{r_i(t)}}^2|}{\sigma^2}}
```

## Stereo

To get stereo output, we can simply use the direction the sound comes from.

In order to do that, let's define a vector that defines the "right ear" of the microphone (the "left ear" is in the opposite direction):

```math
L_{dir} = \begin{pmatrix}0 \\ 1\end{pmatrix}
```

Calculating the contributions to each channel can be done using a dot product:

```math
p_i = \dfrac{\vec{L}-\vec{r_i(t)}}{|{\vec{L}-\vec{r_i(t)}}|} \cdot \vec{L_{dir}}
```

Then, to get the final waveform, ready for storing, we have to sum up every single wave packet's contributions for every moment of time, taking into account the stereo coefficient for the incoming direction.

```math
y_{left}(t) = \sum_{i=0}^{N-1}\dfrac{1-p_i}{2}W_i(t)
```

```math
y_{right}(t) = \sum_{i=0}^{N-1}\dfrac{1+p_i}{2}W_i(t)
```

Wait. Each packet gets a single stereo coefficient - and in the extreme cases, that's either a pure L or R channel.

However, in real life, if we block our left ear, we can still hear sounds coming from the left with our right ear. How?

One thing to notice is that wearing headphones doesn't allow that to happen - we can hear the left channel only with our left ear. Why is that? When we're not wearing headphones, the sound can mix in the air and reflect around the room - and that's the key to this puzzle.

In the simulation, if we have a sound coming from the left, it will contribute to the left channel. However, the wave packet will then go on to reflect from the walls and return to the microphone, this time coming from the right and with a lower amplitude - and it will contribute to the right channel. This time delay and amplitude change is how our ears actually perceive sound.

So it's a nice confirmation that the simulation produces the same effect we can observe in reality.

## Captured IRs

These IRs are produced by creating a short impulse and recording how the surroundings "respond". They are supposed to sound like short clicks.

<div class="generic-block">
    Impulse Response #188:
    <audio controls>
        <source src="./projects/wave-sim/output_188.wav">
    </audio>

    <img src="./projects/wave-sim/output_188.png">
</div>

### Technical Details

I wrote the project in ==Java== - mostly for the conveinence of the ==Swing== graphics library.

These are the settings I used for the simulation.

- 1/100 от 1 ms ($10^{-5}s$)
- 256 kHz sample rate
- A frequency range from 100 Hz up to 10 kHz

The simulation also supports multiple sound sources (and with some tweaks, even moving microphones!).

The environment consists of rectangles currently, but you can describe any 2D surface with a normal function and use them in the simulation.

Here, you can see a comparison between the produced waveform and spectrogram:

<div class="generic-block">
    Impulse Response #146:
    <audio controls>
        <source src="./projects/wave-sim/output_146.wav">
    </audio>

    <img src="./projects/wave-sim/output_146.png">
</div>

A few additional IRs:

<div class="generic-block">
    Impulse Response #11 (a small tin can):
    <audio controls>
        <source src="./projects/wave-sim/output_11.wav">
    </audio>
</div>


<div class="generic-block">
    Impulse Response #55 (a car stereo):
    <audio controls>
        <source src="./projects/wave-sim/output_55.wav">
    </audio>
</div>

## Convolving a Signal with the IR

Simulating the propagation of a single wave is enough in order to calculate how every possible wave would propagate (that is, if we have a fixed speaker & microphone).

We've already simulated our wave, at every frequency - our IR.

The IR can be "applied" to any audio signal using convolution. The result is a recording that sounds as if coming from the same environment as the IR captured.

```math
a'(t)=a(t)*y(t)=\int_{-\infty}^{+\infty} a(t-\tau)\space y(\tau)\space d\tau
```

## Results

I know you're eager to hear it work its magic!

First, the "control" recording - me, playing guitar:

<div class="generic-block">
    Me, playing guitar (1922, colorized):
    <audio controls>
        <source src="./projects/wave-sim/control.mp3">
    </audio>
</div>

Every sound you hear has been normalized to ==-14 LUFS== in Reaper.

A car stereo IR added on top:

<div class="generic-block">
    The same guitar, played through a car stereo:
    <audio controls>
        <source src="./projects/wave-sim/guitar_car.mp3">
    </audio>

    This can be useful for checking the result of your mix. It's frustrating how every mix sounds very different on every device! And of course, the listener expects the best no matter the platform - a crappy bluetooth speaker, a hi-fi set or a car stereo. 🙃
</div>

<div class="generic-block">
    The same guitar, played through a tin can:
    <audio controls>
        <source src="./projects/wave-sim/guitar_tin_can.mp3">
    </audio>
</div>

Or, a more useful use case:

<div class="generic-block">
    The same guitar, in a concert hall:
    <audio controls>
        <source src="./projects/wave-sim/guitar_concert.mp3">
    </audio>
</div>

## Use Cases

Video games? Movie productions?

Perhaps it can be used for a lot of things and in a lot of fields; perhaps not. However, even if not particularly useful, it is still incredibly fun to play around with, hearing what sorts of weird sounds we can get.

And having fun is the point of CS, after all.