import { aerodynamicForces, glidePerformance, stallSpeed } from "./dynamics.js";

const number = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });
const value = (id) => document.querySelector(`#${id}`).value;
const output = (id, calculate) => {
  const element = document.querySelector(`#${id}`);
  try { element.value = calculate(); element.classList.remove("error"); }
  catch (error) { element.value = error.message; element.classList.add("error"); }
};

document.querySelector('[data-calculate="forces"]').addEventListener("click", () => output("forces-result", () => {
  const result = aerodynamicForces({ speed:value("speed"), density:value("density"), area:value("area"), liftCoefficient:value("cl"), dragCoefficient:value("cd") });
  return `Lift ${number.format(result.lift / 1000)} kN · Drag ${number.format(result.drag / 1000)} kN`;
}));

document.querySelector('[data-calculate="stall"]').addEventListener("click", () => output("stall-result", () => {
  const result = stallSpeed({ mass:value("mass"), density:value("stall-density"), area:value("stall-area"), maxLiftCoefficient:value("clmax") });
  return `${number.format(result.speed)} m/s · ${number.format(result.kmh)} km/h`;
}));

document.querySelector('[data-calculate="glide"]').addEventListener("click", () => output("glide-result", () => {
  const result = glidePerformance(value("glide-cl"), value("glide-cd"));
  return `L/D ${number.format(result.ratio)} · ${number.format(result.angleDegrees)}°`;
}));
