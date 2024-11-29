document.addEventListener('DOMContentLoaded', () => {
    const addElementBtn = document.getElementById('addElementBtn');
    const elementsContainer = document.getElementById('elementsContainer');
    const svgCanvas = document.getElementById('svgCanvas');
    const arrowhead = document.getElementById('arrowhead');
    
    let elementsData = [];
    
    // Crear un nuevo elemento
    addElementBtn.addEventListener('click', () => {
      const newElement = createElement();
      elementsContainer.appendChild(newElement);
    });
    
    // Función para crear un nuevo elemento
    function createElement(level = 1, parent = null) {
      const element = document.createElement('div');
      element.classList.add('element', `level${level}`);
      element.style.position = 'absolute';
      element.style.left = '50%';
      element.style.top = '50%';
      element.style.transform = 'translate(-50%, -50%)';
    
      const elementId = `element-${Date.now()}`;
      element.setAttribute('data-id', elementId);
    
      const content = document.createElement('div');
      content.classList.add('content');
      content.setAttribute('contenteditable', 'true');
      content.innerText = `Elemento Nivel ${level}`;
      element.appendChild(content);
    
      elementsData.push({ id: elementId, level, connections: [] });
    
      createAddButtons(element, level, elementId);
      enableElementMovement(element, elementId);
    
      return element;
    }
    
    // Crear los botones de agregar en los bordes del elemento
    function createAddButtons(element, level, elementId) {
      ['top', 'bottom', 'left', 'right'].forEach((position) => {
        const addBtn = document.createElement('button');
        addBtn.classList.add('add-btn', position);
        addBtn.innerHTML = '➕';
    
        addBtn.addEventListener('click', (event) => {
          event.stopPropagation();
    
          const newLevel = level === 3 ? 3 : level + 1;
          const newElement = createElement(newLevel, element);
          const rect = element.getBoundingClientRect();
    
          if (position === 'top') {
            newElement.style.top = `${rect.top - 300}px`;
          } else if (position === 'bottom') {
            newElement.style.top = `${rect.top + 300}px`;
          } else if (position === 'left') {
            newElement.style.left = `${rect.left - 300}px`;
          } else if (position === 'right') {
            newElement.style.left = `${rect.left + 300}px`;
          }
    
          elementsContainer.appendChild(newElement);
          createArrow(element, newElement, position, elementId);
        });
    
        element.appendChild(addBtn);
    
        element.addEventListener('mouseenter', () => {
          addBtn.style.opacity = 1;
        });
    
        element.addEventListener('mouseleave', () => {
          addBtn.style.opacity = 0;
        });
      });
    }
    
    // Crear flechas entre los elementos dentro del SVG
    function createArrow(fromElement, toElement, position, fromElementId) {
      const fromRect = fromElement.getBoundingClientRect();
      const toRect = toElement.getBoundingClientRect();
      
      let startX, startY, endX, endY;
      
      // Calcular las coordenadas de la flecha según la posición
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
      
      // Dibujar la línea en el SVG
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', startX);
      line.setAttribute('y1', startY);
      line.setAttribute('x2', endX);
      line.setAttribute('y2', endY);
      line.setAttribute('stroke', 'black');
      line.setAttribute('stroke-width', '2');
      
      // Crear la flecha
      const arrowheadClone = arrowhead.cloneNode(true);
      arrowheadClone.setAttribute('transform', `translate(${endX - 5}, ${endY - 5})`);
      
      svgCanvas.appendChild(line);
      svgCanvas.appendChild(arrowheadClone);
      
      // Registrar la conexión en los datos
      elementsData.find(el => el.id === fromElementId).connections.push({
        from: fromElementId,
        to: toElement.getAttribute('data-id'),
        line: line,
        arrow: arrowheadClone
      });
    }
    
    // Habilitar el movimiento del elemento
    function enableElementMovement(element, elementId) {
      let isDragging = false;
      let offsetX = 0;
      let offsetY = 0;
    
      element.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = element.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
    
        e.preventDefault();
    
        const onMouseMove = (e) => {
          if (isDragging) {
            const newX = e.clientX - offsetX;
            const newY = e.clientY - offsetY;
            element.style.left = `${newX}px`;
            element.style.top = `${newY}px`;
    
            // Actualizar las flechas
            updateArrowsPosition(elementId);
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
    
    // Actualizar las flechas cuando un elemento se mueve
    function updateArrowsPosition(elementId) {
      const element = elementsContainer.querySelector(`[data-id="${elementId}"]`);
      const elementRect = element.getBoundingClientRect();
    
      // Actualizar las flechas asociadas al elemento
      const elementData = elementsData.find(el => el.id === elementId);
      elementData.connections.forEach(connection => {
        const line = connection.line;
        const arrow = connection.arrow;
    
        // Calcular las nuevas posiciones de la flecha
        const fromRect = element.getBoundingClientRect();
        const toElement = document.querySelector(`[data-id="${connection.to}"]`);
        const toRect = toElement.getBoundingClientRect();
    
        const startX = fromRect.left + fromRect.width / 2;
        const startY = fromRect.top + fromRect.height / 2;
        const endX = toRect.left + toRect.width / 2;
        const endY = toRect.top + toRect.height / 2;
    
        // Actualizar las posiciones de la línea y la flecha
        line.setAttribute('x1', startX);
        line.setAttribute('y1', startY);
        line.setAttribute('x2', endX);
        line.setAttribute('y2', endY);
    
        arrow.setAttribute('transform', `translate(${endX - 5}, ${endY - 5})`);
      });
    }
  });
  