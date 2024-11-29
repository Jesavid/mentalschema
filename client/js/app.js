// Elementos DOM
const addElementBtn = document.getElementById('addElementBtn');
const moveBtn = document.getElementById('moveBtn');
const importJsonBtn = document.getElementById('importJson');
const exportJsonBtn = document.getElementById('exportJson');
const exportXmlBtn = document.getElementById('exportXml');
const exportImageBtn = document.getElementById('exportImage');

// Función para agregar un elemento (de forma simplificada)
addElementBtn.addEventListener('click', function() {
  alert('Aquí se agregaría un nuevo elemento al mapa mental.');
});

// Función para cambiar entre modo mover o editar (de forma simplificada)
let isMoving = false;
moveBtn.addEventListener('click', function() {
  isMoving = !isMoving;
  if (isMoving) {
    alert('Modo de movimiento activado: puedes mover los elementos sin modificar el diagrama.');
  } else {
    alert('Modo de movimiento desactivado.');
  }
});

// Funciones para exportar/importar
importJsonBtn.addEventListener('click', function() {
  alert('Aquí se importaría un archivo JSON.');
});

exportJsonBtn.addEventListener('click', function() {
  alert('Aquí se exportaría el mapa mental en formato JSON.');
});

exportXmlBtn.addEventListener('click', function() {
  alert('Aquí se exportaría el mapa mental en formato XML.');
});

exportImageBtn.addEventListener('click', function() {
  alert('Aquí se exportaría el mapa mental como imagen.');
});
