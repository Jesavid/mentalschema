document.addEventListener('DOMContentLoaded', () => {
  const addElementBtn = document.getElementById('addElementBtn');
  const elementsContainer = document.getElementById('elementsContainer');
  const importJsonFile = document.getElementById('importJsonFile');

  let elementsData = []; // Aquí almacenamos los datos de los elementos y relaciones
  let arrows = []; // Aquí almacenamos las flechas para actualizarlas posteriormente
  let isThrottling = false; // Bandera para controlar el delay de actualización

  // Evento para crear el primer elemento cuando se presiona el botón
  addElementBtn.addEventListener('click', () => {
    const newElement = createElement();
    elementsContainer.appendChild(newElement);
  });

  // Evento para importar un archivo JSON
  document.getElementById('importJson').addEventListener('click', () => {
      importJsonFile.click();
  });

  // Función para importar los datos desde el archivo JSON
  importJsonFile.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file && file.type === 'application/json') {
          const reader = new FileReader();
          reader.onload = function(e) {
              try {
                  const jsonData = JSON.parse(e.target.result);
                  loadElementsFromJson(jsonData);
              } catch (err) {
                  alert('Error al procesar el archivo JSON');
              }
          };
          reader.readAsText(file);
      }
  });





  // Función para cargar los elementos desde el JSON importado
  function loadElementsFromJson(data) {
      elementsData = []; // Limpiar los datos existentes
      arrows = []; // Limpiar las flechas existentes
      elementsContainer.innerHTML = ''; // Limpiar el contenedor de elementos

      // Iterar sobre los elementos en el JSON
      data.elements.forEach((elementData) => {
          const element = createElement(elementData.level, null);
          element.querySelector('.content').innerText = elementData.content;

          // Recrear las flechas basadas en las conexiones
          elementData.connections.forEach((connection) => {
              const targetElement = elementsData.find(e => e.id === connection.targetId);
              if (targetElement) {
                  createArrow(element, targetElement.element, connection.position, element.id);
              }
          });

          elementsContainer.appendChild(element);
      });
  }

  // Función para crear un nuevo elemento
  function createElement(level = 1, parent = null) {
      const element = document.createElement('div');
      const elementId = `element-${Date.now()}`;

      element.classList.add('element', `level${level}`);
      element.style.position = 'absolute';
      element.style.left = '50%';
      element.style.top = '50%';
      element.style.transform = 'translate(-50%, -50%)';
      element.setAttribute('data-id', elementId);  // Asignar un ID único al elemento

      // Crear contenido editable para el elemento
      const content = document.createElement('div');
      content.classList.add('content');
      content.setAttribute('contenteditable', 'true');
      content.innerText = `Elemento Nivel ${level}`;
      element.appendChild(content);

      // Crear los botones para agregar elementos
      createAddButtons(element, level, elementId);

      // Habilitar movimiento del elemento
      enableElementMovement(element, elementId);

      // Registrar el nuevo elemento en los datos
      elementsData.push({
          id: elementId,
          content: `Elemento Nivel ${level}`,
          level: level,
          connections: [] // Inicia sin conexiones
      });

      return element;
  }

  // Función para crear los botones de agregar en los bordes del elemento
  function createAddButtons(element, level, elementId) {
      ['top', 'bottom', 'left', 'right'].forEach((position) => {
          const addBtn = document.createElement('button');
          addBtn.classList.add('add-btn', position);
          addBtn.innerHTML = '➕';

          // Evento para crear un nuevo elemento
          addBtn.addEventListener('click', (event) => {
              event.stopPropagation();

              const newLevel = level === 3 ? 3 : level + 1;
              const newElement = createElement(newLevel, element);

              // Ajustar la posición del nuevo elemento basado en el borde clickeado
              const rect = element.getBoundingClientRect();
              let newElementX, newElementY;

              if (position === 'top') {
                  newElementY = rect.top - 300;
                  newElementX = rect.left + rect.width / 2 - newElement.offsetWidth / 2;
              } else if (position === 'bottom') {
                  newElementY = rect.top + rect.height + 300;
                  newElementX = rect.left + rect.width / 2 - newElement.offsetWidth / 2;
              } else if (position === 'left') {
                  newElementY = rect.top + rect.height / 2 - newElement.offsetHeight / 2;
                  newElementX = rect.left - 300;
              } else if (position === 'right') {
                  newElementY = rect.top + rect.height / 2 - newElement.offsetHeight / 2;
                  newElementX = rect.left + rect.width + 300;
              }

              newElement.style.left = `${newElementX}px`;
              newElement.style.top = `${newElementY}px`;

              elementsContainer.appendChild(newElement);

              // Crear flecha entre los elementos
              createArrow(element, newElement, position, elementId);
          });

          element.appendChild(addBtn);

          // Mostrar los botones solo cuando el cursor se acerca
          element.addEventListener('mouseenter', () => {
              addBtn.style.opacity = 1;
          });

          element.addEventListener('mouseleave', () => {
              addBtn.style.opacity = 0;
          });
      });
  }

  // Función para crear flechas entre los elementos
  function createArrow(fromElement, toElement, position, fromElementId) {
      const fromRect = fromElement.getBoundingClientRect();
      const toRect = toElement.getBoundingClientRect();

      let startX, startY, endX, endY;

      // Ajuste de las coordenadas de la flecha según la posición
      switch (position) {
          case 'top':
              startX = fromRect.left + fromRect.width / 2;
              startY = fromRect.top;
              break;
          case 'bottom':
              startX = fromRect.left + fromRect.width / 2;
              startY = fromRect.top + fromRect.height;
              break;
          case 'left':
              startX = fromRect.left;
              startY = fromRect.top + fromRect.height / 2;
              break;
          case 'right':
              startX = fromRect.left + fromRect.width;
              startY = fromRect.top + fromRect.height / 2;
              break;
      }

      endX = toRect.left + toRect.width / 2;
      endY = toRect.top + toRect.height / 2;

      const dx = endX - startX;
      const dy = endY - startY;
      const length = Math.sqrt(dx * dx + dy * dy);

      // Crear la línea de la flecha
      const arrow = document.createElement('div');
      arrow.classList.add('connection-arrow');
      arrow.style.position = 'absolute';
      arrow.style.width = `${length}px`;
      arrow.style.height = '2px'; // Ajuste para visibilidad
      arrow.style.backgroundColor = 'black'; // Color de la flecha
      arrow.style.transformOrigin = '0 50%'; // Hacer que la rotación sea desde el inicio de la flecha
      arrow.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
      arrow.style.left = `${startX}px`;
      arrow.style.top = `${startY}px`;

      // Crear la punta de la flecha
      const arrowhead = document.createElement('div');
      arrowhead.classList.add('arrowhead');
      arrowhead.style.position = 'absolute';
      arrowhead.style.width = '0';
      arrowhead.style.height = '0';
      arrowhead.style.borderLeft = '5px solid transparent';
      arrowhead.style.borderRight = '5px solid transparent';
      arrowhead.style.borderTop = '10px solid black';
      arrowhead.style.left = `${endX - 5}px`;
      arrowhead.style.top = `${endY - 5}px`;

      elementsContainer.appendChild(arrow);
      elementsContainer.appendChild(arrowhead);

      // Registrar la relación en los datos
      const fromElementData = elementsData.find((e) => e.id === fromElementId);
      const toElementId = toElement.getAttribute('data-id');
      fromElementData.connections.push({ targetId: toElementId, position });

      // Guardar la flecha
      arrows.push({ arrow, arrowhead, fromElement, toElement });
  }

  // Función para habilitar el movimiento de los elementos
  function enableElementMovement(element, elementId) {
      let isDragging = false;
      let offsetX = 0;
      let offsetY = 0;

      element.addEventListener('mousedown', (e) => {
          isDragging = true;
          const rect = element.getBoundingClientRect();
          offsetX = e.clientX - rect.left;
          offsetY = e.clientY - rect.top;

          // Prevenir que el clic se propague hacia otros elementos
          e.preventDefault();

          const onMouseMove = (e) => {
              if (isDragging) {
                  const newX = e.clientX - offsetX;
                  const newY = e.clientY - offsetY;
                  element.style.left = `${newX}px`;
                  element.style.top = `${newY}px`;

                  // Solo actualizamos las flechas si no estamos en un estado de "throttle"
                  if (!isThrottling) {
                      isThrottling = true;
                      setTimeout(() => {
                          updateArrows();
                          isThrottling = false;
                      }, 10); // Actualizamos las flechas después de 100ms
                  }
              }
          };

          const onMouseUp = () => {
              isDragging = false;
              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
          };

          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
      });
  }

  // Función para actualizar las flechas
  function updateArrows() {
      // Actualizar solo las flechas que están relacionadas con el elemento movido
      arrows.forEach(({ arrow, arrowhead, fromElement, toElement }) => {
          const fromRect = fromElement.getBoundingClientRect();
          const toRect = toElement.getBoundingClientRect();

          let startX, startY, endX, endY;

          const position = elementsData.find((e) => e.id === fromElement.getAttribute('data-id')).connections.find((c) => c.targetId === toElement.getAttribute('data-id')).position;

          switch (position) {
              case 'top':
                  startX = fromRect.left + fromRect.width / 2;
                  startY = fromRect.top;
                  break;
              case 'bottom':
                  startX = fromRect.left + fromRect.width / 2;
                  startY = fromRect.top + fromRect.height;
                  break;
              case 'left':
                  startX = fromRect.left;
                  startY = fromRect.top + fromRect.height / 2;
                  break;
              case 'right':
                  startX = fromRect.left + fromRect.width;
                  startY = fromRect.top + fromRect.height / 2;
                  break;
          }

          endX = toRect.left + toRect.width / 2;
          endY = toRect.top + toRect.height / 2;

          const dx = endX - startX;
          const dy = endY - startY;
          const length = Math.sqrt(dx * dx + dy * dy);

          // Actualizar la posición de la flecha
          arrow.style.width = `${length}px`;
          arrow.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
          arrow.style.left = `${startX}px`;
          arrow.style.top = `${startY}px`;

          // Actualizar la punta de la flecha
          arrowhead.style.left = `${endX - 5}px`;
          arrowhead.style.top = `${endY - 5}px`;
      });
  }
});
