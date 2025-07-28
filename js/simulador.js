const FRIGORIAS_POR_METRO = 100;
const FRIGORIAS_POR_PERSONA = 100;
const EXTRA_SOL = 500;
const form = document.getElementById("formSimulador");
const divResultados = document.getElementById("resultados");

class Simulacion {
  constructor(metros, personas, sol) {
    this.metros = metros;
    this.personas = personas;
    this.sol = sol;
    this.frigorias = this.calcularFrigorias();
  }

  calcularFrigorias() {
    let base = this.metros * FRIGORIAS_POR_METRO;
    let extra = this.personas * FRIGORIAS_POR_PERSONA;
    let total = base + extra;
    if (this.sol) total += EXTRA_SOL;
    return total;
  }
}


let simulaciones = JSON.parse(localStorage.getItem("simulaciones")) || [];

const guardarEnStorage = (lista) => {
  localStorage.setItem("simulaciones", JSON.stringify(lista));
};

const renderizarTabla = (data) => {
  divResultados.innerHTML = "<h2>Resultados</h2>";

  if (data.length === 0) return;

  const tabla = document.createElement("table");
  const header = tabla.insertRow();
  ["#", "Metros", "Personas", "Sol directo", "Frigorías"].forEach(t => {
    const th = document.createElement("th");
    th.textContent = t;
    header.appendChild(th);
  });

  data.forEach((sim, index) => {
    const row = tabla.insertRow();
    [index + 1, sim.metros, sim.personas, sim.sol ? "Sí" : "No", sim.frigorias + " fg"]
      .forEach(valor => {
        const td = document.createElement("td");
        td.textContent = valor;
        row.appendChild(td);
      });
  });

  divResultados.appendChild(tabla);
};


form.addEventListener("submit", (e) => {
  e.preventDefault();

  const metros = parseFloat(form.metros.value);
  const personas = parseInt(form.personas.value);
  const sol = form.sol.value === "true";

  if (!metros || !personas || isNaN(metros) || isNaN(personas)) return;

  const nuevaSimulacion = new Simulacion(metros, personas, sol);
  simulaciones.push(nuevaSimulacion);
  guardarEnStorage(simulaciones);
  renderizarTabla(simulaciones);

  form.reset();
});

renderizarTabla(simulaciones);