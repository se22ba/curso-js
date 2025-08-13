
const FRIGORIAS_POR_METRO = 100;
const FRIGORIAS_POR_PERSONA = 100;
const EXTRA_SOL = 500;
const form = document.getElementById("formSimulador");
const divResultados = document.getElementById("resultados");
const divSugerencia = document.getElementById("sugerencia");
const btnLimpiar = document.getElementById("btnLimpiar");

class Simulacion {
  constructor(metros, personas, sol) {
    this.metros = metros;
    this.personas = personas;
    this.sol = sol;
    this.frigorias = this.calcularFrigorias();
  }
  calcularFrigorias() {
    const base = this.metros * FRIGORIAS_POR_METRO;
    const extra = this.personas * FRIGORIAS_POR_PERSONA;
    let total = base + extra;
    if (this.sol) total += EXTRA_SOL;
    return total;
  }
}


let simulaciones = [];
try {
  const raw = localStorage.getItem("simulaciones");
  const parsed = raw ? JSON.parse(raw) : [];
  simulaciones = Array.isArray(parsed) ? parsed : [];
} catch {
  simulaciones = [];
}

let modelos = []; 


const guardarEnStorage = (lista) => {
  localStorage.setItem("simulaciones", JSON.stringify(lista));
};

const renderizarTabla = (data) => {
  divResultados.innerHTML = "<h2>Resultados</h2>";
  if (!Array.isArray(data) || data.length === 0) return;
  const tabla = document.createElement("table");
  const header = tabla.insertRow();
  ["#", "Metros", "Personas", "Sol directo", "Frigorías"].forEach((t) => {
    const th = document.createElement("th");
    th.textContent = t;
    header.appendChild(th);
  });
  data.forEach((sim, index) => {
    const row = tabla.insertRow();
    [
      index + 1,
      sim.metros,
      sim.personas,
      sim.sol ? "Sí" : "No",
      sim.frigorias + " fg",
    ].forEach((valor) => {
      const td = document.createElement("td");
      td.textContent = valor;
      row.appendChild(td);
    });
  });
  divResultados.appendChild(tabla);
};

const renderizarSugerencia = (frigorias) => {
  if (!Array.isArray(modelos) || modelos.length === 0) {
    divSugerencia.innerHTML = "";
    return;
  }
  
  const candidato = modelos
    .slice() // 
    .sort((a, b) => a.capacidad_fg - b.capacidad_fg)
    .find(m => Number(m.capacidad_fg) >= frigorias);

  if (!candidato) {
    divSugerencia.innerHTML = `
      <div class="card">
        <h3>Sugerencia de equipo</h3>
        <p>No hay un modelo único que cubra <strong>${frigorias} fg</strong>. Considerá:</p>
        <ul>
          <li>Usar el modelo de mayor capacidad disponible (${modelos[modelos.length - 1].capacidad_fg} fg)</li>
          <li>Dividir la carga en dos equipos.</li>
        </ul>
      </div>
    `;
    return;
  }

  divSugerencia.innerHTML = `
    <div class="card">
      <h3>Sugerencia de equipo</h3>
      <p><strong>${candidato.marca} ${candidato.modelo}</strong> (${candidato.tipo})</p>
      <p>Capacidad: <strong>${candidato.capacidad_fg} fg</strong> | Consumo estimado: ${candidato.consumo_w} W</p>
      <p>Calculadas: <strong>${frigorias} fg</strong></p>
    </div>
  `;
};

const validarEntradas = (metros, personas, solStr) => {
  const entradasInvalidas =
    !Number.isFinite(metros) ||
    !Number.isFinite(personas) ||
    metros <= 0 ||
    personas <= 0;

  const selectInvalido = solStr !== "true" && solStr !== "false";
  return { entradasInvalidas, selectInvalido };
};


form.addEventListener("submit", (e) => {
  e.preventDefault();

  const metros = Number(form.metros.value);
  const personas = Number(form.personas.value);
  const solStr = String(form.sol.value);
  const { entradasInvalidas, selectInvalido } = validarEntradas(metros, personas, solStr);

  if (entradasInvalidas || selectInvalido) {
    Swal.fire({
      icon: "error",
      title: "Datos inválidos",
      text: "Completá todos los campos con valores válidos (números > 0 y selección de sol).",
      confirmButtonText: "Entendido",
    });
    return;
  }

  const sol = solStr === "true";
  const nuevaSimulacion = new Simulacion(metros, personas, sol);
  simulaciones.push(nuevaSimulacion);
  guardarEnStorage(simulaciones);
  renderizarTabla(simulaciones);
  renderizarSugerencia(nuevaSimulacion.frigorias);

  form.reset();
  const placeholder = form.sol.querySelector('option[value=""]');
  if (placeholder) form.sol.value = "";
});

btnLimpiar?.addEventListener("click", () => {
  if (!Array.isArray(simulaciones) || simulaciones.length === 0) {
    Swal.fire({ icon: "info", title: "Nada para limpiar", timer: 1200, showConfirmButton: false });
    return;
  }
  Swal.fire({
    title: "¿Limpiar historial?",
    text: "Se borrarán todas las simulaciones guardadas.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, limpiar",
    cancelButtonText: "Cancelar",
  }).then((res) => {
    if (res.isConfirmed) {
      simulaciones = [];
      guardarEnStorage(simulaciones);
      renderizarTabla(simulaciones);
      divSugerencia.innerHTML = "";
      Swal.fire({ icon: "success", title: "Historial limpio", timer: 1000, showConfirmButton: false });
    }
  });
});


async function cargarModelos() {
  try {
    const resp = await fetch("./data/modelos.json", { cache: "no-store" });
    if (!resp.ok) throw new Error("No se pudieron cargar los modelos");
    const data = await resp.json();
    if (!Array.isArray(data)) throw new Error("Formato de datos inválido");
    modelos = data;
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error cargando modelos",
      text: "No se pudieron cargar los datos remotos. Podés seguir calculando sin sugerencias de modelo.",
      confirmButtonText: "Ok",
    });
    modelos = [];
  }
}


const btnExportCsv = document.getElementById("btnExportCsv");

const descargarCSV = (filas, nombre="historial_simulaciones.csv") => {
  const header = ["Metros","Personas","Sol","Frigorias"];
  const lines = [header.join(",")].concat(
    filas.map(s => [s.metros, s.personas, s.sol ? "Si":"No", s.frigorias].join(","))
  );
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

btnExportCsv?.addEventListener("click", () => {
  if (!simulaciones.length) {
    Swal.fire({ icon: "info", title: "No hay datos para exportar" });
    return;
  }
  descargarCSV(simulaciones);
});
(async () => {
  await cargarModelos();
  renderizarTabla(simulaciones);
})();
