# language: es
Característica: Zaketines - Nivel medio
  Como visitante de la web de C.E.I. Zaketines
  Quiero navegar entre las secciones y comprobar su contenido
  Para asegurarme de que la información del centro es correcta

  Antecedentes:
    Dado que estoy en la portada de Zaketines

  Esquema del escenario: El menú navega a la sección correcta
    Cuando hago clic en "<enlace>" del menú principal
    Entonces la URL contiene "<url>"
    Y veo un encabezado que contiene "<texto>"

    Ejemplos:
      | enlace        | url                 | texto                                    |
      | Matriculacion | page=matriculacion  | Plazo de solicitudes de nueva admisión   |
      | Objetivos     | page=objetivos      | ofrecerte                                |

  Escenario: El enlace Contacto navega a la sección con los datos de contacto
    Cuando hago clic en "Contacto" del menú principal
    Entonces la URL contiene "page=contacto"
    Y veo el texto "Venga a vistarnos"
    Y veo el texto "Avenida Emilio Lemos, 37, A/B, 41020 Sevilla"

  Escenario: La sección de Instalaciones muestra la galería de imágenes
    Cuando voy a la sección "instalaciones"
    Entonces la página muestra al menos una imagen

  Escenario: La página de Contacto muestra el teléfono, el email y el enlace de reserva de cita
    Cuando voy a la sección "contacto"
    Entonces el enlace "611 937 130" apunta a "tel:611937130"
    Y el enlace "954 070 101" apunta a "tel:954070101"
    Y el enlace "e.i.zaketines@gmail.com" apunta a "mailto:e.i.zaketines@gmail.com"
    Y el enlace "https://forms.gle/DcowLvhBiZGvYnWb7" apunta a "https://forms.gle/DcowLvhBiZGvYnWb7"

  Escenario: Los enlaces a redes sociales apuntan a las cuentas oficiales
    Entonces el enlace a "WhatsApp" contiene "phone=+34611937130"
    Y el enlace a "Facebook" contiene "facebook.com/CEI-Zaketines"
    Y el enlace a "Instagram" contiene "instagram.com/e.i.zaketines"
    Y el enlace a "TikTok" contiene "tiktok.com/@cei.zaketines"

  Escenario: El botón RESERVA TU CITA enlaza al formulario de Google correcto
    Entonces el botón "RESERVA TU CITA" apunta a "https://docs.google.com/forms/d/1mxZisi7SXCZg_oDw5tB2QA_5Z6ic5-V8lJYvqSstoCg"
