# language: es
Característica: Zaketines - Nivel fácil
  Como visitante de la web de C.E.I. Zaketines
  Quiero comprobar los elementos básicos de la portada
  Para asegurarme de que la web carga correctamente

  Antecedentes:
    Dado que estoy en la portada de Zaketines

  Escenario: La página principal carga con el título correcto
    Entonces el título de la página es "C.E.I. ZAKETINES"

  Escenario: La meta descripción identifica el centro y su ubicación
    Entonces la meta descripción contiene "Centro de Educación Infantil ZAKETINES"

  Escenario: El menú principal muestra los enlaces de navegación
    Entonces el menú principal muestra los enlaces "Inicio, Matriculacion, Objetivos, Instalaciones, Contacto"

  Escenario: El botón de reserva de cita es visible en la portada
    Entonces el botón "RESERVA TU CITA" es visible

  Escenario: El aviso de copyright aparece en el pie de página
    Entonces el pie de página muestra el aviso de copyright del año actual
