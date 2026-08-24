# language: es
Característica: Zaketines - Nivel difícil
  Como visitante de la web de C.E.I. Zaketines
  Quiero usar el simulador de cuota y completar recorridos completos
  Para comprobar que las funcionalidades interactivas del sitio funcionan correctamente

  Antecedentes:
    Dado que estoy en la portada de Zaketines

  Escenario: El simulador de cuota (Renta Conjunta) calcula el importe total
    Cuando abro el simulador de cuota
    Y relleno el simulador de "Renta Conjunta" con estos datos:
      | campo               | valor     |
      | año de nacimiento   | 2024/2025 |
      | aula matinal        | Si        |
      | comedor             | Si        |
      | aula de tarde       | Si        |
      | renta casilla 435   | 20000     |
      | renta casilla 460   | 0         |
      | miembros de familia | 3         |
    Y pulso "Simular"
    Entonces el resultado del simulador muestra un importe total en euros al mes

  Escenario: Cambiar de pestaña en el simulador alterna entre "Renta Conjunta" y "Renta Individual"
    Cuando abro el simulador de cuota
    Entonces los campos de "Renta Conjunta" son visibles
    Y los campos de "Renta Individual" no son visibles
    Cuando cambio a la pestaña "Renta Individual"
    Entonces los campos de "Renta Individual" son visibles
    Y los campos de "Renta Conjunta" no son visibles
    Cuando cambio a la pestaña "Renta Conjunta"
    Entonces los campos de "Renta Conjunta" son visibles
    Y los campos de "Renta Individual" no son visibles

  Escenario: El simulador conserva los valores y el resultado al cerrar y reabrir el modal
    Cuando abro el simulador de cuota
    Y relleno el simulador de "Renta Conjunta" con estos datos:
      | campo               | valor     |
      | año de nacimiento   | 2024/2025 |
      | aula matinal        | Si        |
      | comedor             | Si        |
      | aula de tarde       | Si        |
      | renta casilla 435   | 20000     |
      | renta casilla 460   | 0         |
      | miembros de familia | 3         |
    Y pulso "Simular"
    Y cierro el simulador con "×"
    Y abro el simulador de cuota
    Entonces el campo "renta casilla 435" conserva el valor "20.000"
    Y el resultado del simulador muestra un importe total en euros al mes

  Escenario: Recorrido completo desde la portada hasta Contacto
    Cuando abro el simulador de cuota
    Y cierro el simulador con "Salir"
    Y hago clic en el botón "Matriculación 2026/2027" de la portada
    Entonces la URL contiene "page=matriculacion"
    Y veo un encabezado que contiene "Plazo de solicitudes de nueva admisión"
    Cuando hago clic en "Contacto" del menú principal
    Entonces la URL contiene "page=contacto"
    Y el enlace "e.i.zaketines@gmail.com" apunta a "mailto:e.i.zaketines@gmail.com"
