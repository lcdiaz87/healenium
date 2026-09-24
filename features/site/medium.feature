# Nivel medio: navegación entre secciones y verificación de atributos.
# Aquí aparece el primer "Scenario Outline" (esquema de escenario), que
# ejecuta el mismo escenario una vez por cada fila de la tabla Examples.
Feature: Zaketines site navigation and content
  As a visitor of the C.E.I. Zaketines website
  I want to move between sections and check their content
  So that I can be sure the school information is correct

  Background:
    Given I am on the Zaketines homepage

  Scenario Outline: The main menu navigates to the right section
    When I click "<link>" in the main menu
    Then the URL contains "<url>"
    And I see a heading containing "<heading>"

    Examples:
      | link          | url                | heading                                |
      | Matriculacion | page=matriculacion | Plazo de solicitudes de nueva admisión |
      | Objetivos     | page=objetivos     | ofrecerte                              |

  # La sección de Contacto no tiene encabezado propio, por eso va aparte
  # del Scenario Outline de arriba: se comprueba por su texto visible.
  Scenario: The Contacto link opens the section with the contact details
    When I click "Contacto" in the main menu
    Then the URL contains "page=contacto"
    And I see the text "Venga a vistarnos"
    And I see the text "Avenida Emilio Lemos, 37, A/B, 41020 Sevilla"

  Scenario: The Instalaciones section shows the image gallery
    When I go to the "instalaciones" section
    Then the page shows at least one image

  Scenario: The Contacto page shows phone, email and booking link
    When I go to the "contacto" section
    Then the link "611 937 130" points to "tel:611937130"
    And the link "954 070 101" points to "tel:954070101"
    And the link "e.i.zaketines@gmail.com" points to "mailto:e.i.zaketines@gmail.com"
    And the link "https://forms.gle/DcowLvhBiZGvYnWb7" points to "https://forms.gle/DcowLvhBiZGvYnWb7"

  Scenario: Social media links point to the official accounts
    Then the "WhatsApp" link contains "phone=+34611937130"
    And the "Facebook" link contains "facebook.com/CEI-Zaketines"
    And the "Instagram" link contains "instagram.com/e.i.zaketines"
    And the "TikTok" link contains "tiktok.com/@cei.zaketines"

  Scenario: The RESERVA TU CITA button links to the right Google Form
    Then the button "RESERVA TU CITA" points to "https://docs.google.com/forms/d/1mxZisi7SXCZg_oDw5tB2QA_5Z6ic5-V8lJYvqSstoCg"
