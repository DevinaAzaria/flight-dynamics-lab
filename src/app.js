import { aerodynamicForces, glidePerformance, performanceSweep, stallSpeed } from "./dynamics.js";

const number = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });
const value = (id) => document.querySelector(`#${id}`).value;
const output = (id, calculate) => {
  const element = document.querySelector(`#${id}`);
  try { element.value = calculate(); element.classList.remove("error"); }
  catch (error) { element.value = error.message; element.classList.add("error"); }
};

document.querySelector('[data-calculate="forces"]').addEventListener("click", () => {
  output("forces-result", () => {
    const result = aerodynamicForces({
      speed:value("speed"),
      density:value("density"),
      area:value("area"),
      liftCoefficient:value("cl"),
      dragCoefficient:value("cd")
    });
    return `Lift ${number.format(result.lift / 1000)} kN · Drag ${number.format(result.drag / 1000)} kN`;
  });
  renderEnvelope();
});

document.querySelector('[data-calculate="stall"]').addEventListener("click", () => output("stall-result", () => {
  const result = stallSpeed({
    mass:value("mass"),
    density:value("stall-density"),
    area:value("stall-area"),
    maxLiftCoefficient:value("clmax")
  });
  return `${number.format(result.speed)} m/s · ${number.format(result.kmh)} km/h`;
}));

document.querySelector('[data-calculate="glide"]').addEventListener("click", () => output("glide-result", () => {
  const result = glidePerformance(value("glide-cl"), value("glide-cd"));
  return `L/D ${number.format(result.ratio)} · ${number.format(result.angleDegrees)}°`;
}));

const svgNamespace = "http://www.w3.org/2000/svg";
const svgElement = (name, attributes = {}) => {
  const element = document.createElementNS(svgNamespace, name);
  Object.entries(attributes).forEach(([key, val]) => element.setAttribute(key, val));
  return element;
};

function renderEnvelope() {
  const chart = document.querySelector("#envelope-chart");
  const pressureChart = document.querySelector("#pressure-chart");
  const summary = document.querySelector("#envelope-summary");
  if (!chart || !pressureChart || !summary) return;

  try {
    const sweep = performanceSweep({
      minSpeed: 10,
      maxSpeed: value("envelope-max"),
      steps: 18,
      density: value("density"),
      area: value("area"),
      liftCoefficient: value("cl"),
      dragCoefficient: value("cd")
    });

    const width = 900;
    const height = 320;
    const padX = 48;
    const padY = 36;
    const plotWidth = width - padX * 2;
    const plotHeight = height - padY * 2;
    const maxForce = Math.max(...sweep.points.flatMap((point) => [point.lift, point.drag]));

    const x = (speed) => padX + ((speed - sweep.minSpeed) / (sweep.maxSpeed - sweep.minSpeed)) * plotWidth;
    const y = (force) => height - padY - (force / maxForce) * plotHeight;
    const pathFor = (field) => sweep.points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${x(point.speed).toFixed(2)} ${y(point[field]).toFixed(2)}`)
      .join(" ");

    chart.replaceChildren();

    chart.append(
      svgElement("line", { x1:padX, y1:height-padY, x2:width-padX, y2:height-padY, class:"axis" }),
      svgElement("line", { x1:padX, y1:padY, x2:padX, y2:height-padY, class:"axis" }),
      svgElement("path", { d:pathFor("lift"), class:"lift-line" }),
      svgElement("path", { d:pathFor("drag"), class:"drag-line" })
    );

    const labels = [
      { x:padX, y:height-10, text:`${number.format(sweep.minSpeed)} m/s`, anchor:"start" },
      { x:width-padX, y:height-10, text:`${number.format(sweep.maxSpeed)} m/s`, anchor:"end" },
      { x:padX+8, y:padY+14, text:`${number.format(maxForce/1000)} kN`, anchor:"start" }
    ];

    labels.forEach((item) => {
      const text = svgElement("text", { x:item.x, y:item.y, "text-anchor":item.anchor, class:"chart-label" });
      text.textContent = item.text;
      chart.append(text);
    });

    const pressureHeight = 170;
    const pressurePadY = 24;
    const maxPressure = Math.max(...sweep.points.map((point) => point.dynamicPressure));
    const pressureY = (pressure) => pressureHeight - pressurePadY - (pressure / maxPressure) * (pressureHeight - pressurePadY * 2);
    const pressurePath = sweep.points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${x(point.speed).toFixed(2)} ${pressureY(point.dynamicPressure).toFixed(2)}`)
      .join(" ");

    pressureChart.replaceChildren(
      svgElement("line", { x1:padX, y1:pressureHeight-pressurePadY, x2:width-padX, y2:pressureHeight-pressurePadY, class:"axis" }),
      svgElement("line", { x1:padX, y1:pressurePadY, x2:padX, y2:pressureHeight-pressurePadY, class:"axis" }),
      svgElement("path", { d:pressurePath, class:"pressure-line" })
    );

    const pressureLabel = svgElement("text", { x:padX+8, y:pressurePadY+14, class:"chart-label" });
    pressureLabel.textContent = `${number.format(maxPressure / 1000)} kPa`;
    pressureChart.append(pressureLabel);

    const last = sweep.points.at(-1);
    summary.value = `Pada ${number.format(last.speed)} m/s: q = ${number.format(last.dynamicPressure / 1000)} kPa · Lift = ${number.format(last.lift / 1000)} kN · Drag = ${number.format(last.drag / 1000)} kN`;
    summary.classList.remove("error");
  } catch (error) {
    chart.replaceChildren();
    pressureChart.replaceChildren();
    summary.value = error.message;
    summary.classList.add("error");
  }
}

document.querySelector('[data-calculate="envelope"]').addEventListener("click", renderEnvelope);
renderEnvelope();
