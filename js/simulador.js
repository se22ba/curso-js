
const FRIGORIAS_POR_METRO = 100;
const FRIGORIAS_POR_PERSONA = 100;
const EXTRA_SOL = 500;

let simulaciones = [];

function obtenerDatosUsuario() {
  console.clear();
  console.log("***SIMULADOR DE FRIGORÍAS***");

  let metros = parseFloat(prompt("Ingrese los metros cuadrados del ambiente:"));
  while (isNaN(metros) || metros <= 0) {
    console.log("Valor inválido para metros cuadrados.");
    metros = parseFloat(prompt("Ingrese un número mayor a 0 para los metros cuadrados:"));
  }

  let personas = parseInt(prompt("Ingrese la cantidad de personas que usan el ambiente:"));
  while (isNaN(personas) || personas <= 0) {
    console.log("Valor inválido para cantidad de personas.");
    personas = parseInt(prompt("Ingrese una cantidad válida de personas:"));
  }

  console.log("¿El ambiente recibe luz solar directa durante el día?");
  console.log("1: Sí");
  console.log("2: No");
  let solInput = prompt("Ingrese 1 para Sí o 2 para No:");
  while (solInput !== "1" && solInput !== "2") {
    console.log("Opción inválida.");
    solInput = prompt("Ingrese 1 para Sí o 2 para No:");
  }

  let sol = solInput === "1";

  return { metros, personas, sol };
}

function calcularFrigorias({ metros, personas, sol }) {
  let frigoriasBase = metros * FRIGORIAS_POR_METRO;
  let frigoriasExtra = personas * FRIGORIAS_POR_PERSONA;
  let total = frigoriasBase + frigoriasExtra;

  if (sol) {
    total += EXTRA_SOL;
  }

  return total;
}

function mostrarResultado(datos, frigorias) {
  console.log("\n=== RESULTADO DEL CÁLCULO ===");
  console.log("Metros cuadrados:", datos.metros);
  console.log("Personas:", datos.personas);
  console.log("Luz solar directa:", datos.sol ? "Sí" : "No");
  console.log("Frigorías estimadas necesarias:", frigorias + " fg");
}

function iniciarSimulador() {
  let continuar = true;

  while (continuar) {
    const datos = obtenerDatosUsuario();
    const frigorias = calcularFrigorias(datos);
    mostrarResultado(datos, frigorias);
    simulaciones.push({ ...datos, frigorias });

    let continuarInput = prompt("¿Desea realizar otra simulación? (s/n):").toLowerCase();
    while (continuarInput !== "s" && continuarInput !== "n") {
      console.log("Ingrese 's' para sí o 'n' para no.");
      continuarInput = prompt("¿Desea realizar otra simulación? (s/n):").toLowerCase();
    }

    continuar = continuarInput === "s";
  }

  console.log("\n=== SIMULACIONES REALIZADAS ===");
  console.table(simulaciones);
}

