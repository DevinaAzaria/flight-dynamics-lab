# Flight Dynamics Lab

An interactive student laboratory for understanding the forces and decisions behind flight.

> **Ringkasan Indonesia:** Flight Dynamics Lab adalah laboratorium interaktif untuk mempelajari lift, drag, stall speed, dan glide ratio melalui model aerodinamika sederhana yang transparan dan dapat diuji.

**Author:** Devina Azaria  
**Status:** v0.2 — in progress  
**Focus:** aerodynamics, physics, scientific computing, and aerospace engineering

## Live laboratory

**GitHub Pages:** https://devinaazaria.github.io/flight-dynamics-lab/

Deployment is automated from the `main` branch. Every deployment runs the scientific model tests before publishing the static laboratory.

## Why this project exists

Flight is a useful bridge between classroom physics and engineering decisions. This project turns a few core aerodynamic relationships into small experiments so that changing speed, wing area, air density, mass, or aerodynamic coefficients produces an explainable result.

The laboratory complements [`astronomy-lab`](https://github.com/DevinaAzaria/astronomy-lab) and supports Devina's longer-term interest in mechanical and aerospace engineering.

## Experiments in v0.1

1. **Aerodynamic forces** — calculates lift and drag from dynamic pressure and coefficients.
2. **Stall speed** — estimates the minimum speed at which lift balances aircraft weight.
3. **Glide performance** — converts lift-to-drag ratio into an approximate glide angle.\n4. **Performance envelope preview** — sweeps airspeed to visualize dynamic pressure and lift/drag trends.

## Scientific assumptions

- Airflow is represented by the standard lift/drag equations.
- The aircraft is treated as steady and level for the lift calculation.
- Stall speed uses a maximum lift coefficient and standard gravity.
- Glide angle uses the simplified relation `tan(γ) = D/L`.
- Real aircraft have compressibility, turbulence, Reynolds-number, trim, and three-dimensional effects that are outside v0.1.

## Run locally

```bash
npm start
```

Open `http://localhost:4174`.

## Test

```bash
npm test
```

## Portfolio authorship

Each future release should include Devina's own notes on the question, equation, assumptions, manual verification, and limitations. Technical review may be provided through DevinaHQ, while authorship should remain accurately documented.

## Roadmap

See [`ROADMAP.md`](ROADMAP.md).

## License

MIT
