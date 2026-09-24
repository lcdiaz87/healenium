# Nivel difícil: flujos con estado (modal, pestañas, cálculo dinámico) y
# recorridos completos de usuario. Aquí aparecen las "Data Tables": tablas
# que se pasan como argumento a un paso para rellenar varios campos de una vez.
Feature: Zaketines fee simulator and full user journeys
  As a visitor of the C.E.I. Zaketines website
  I want to use the fee simulator and complete end-to-end journeys
  So that I can be sure the interactive features work correctly

  Background:
    Given I am on the Zaketines homepage

  Scenario: The fee simulator (joint income) calculates the monthly total
    When I open the fee simulator
    And I fill the "Renta Conjunta" simulator with:
      | field             | value     |
      | birth year        | 2024/2025 |
      | morning club      | Si        |
      | lunch             | Si        |
      | afternoon club    | Si        |
      | income box 435    | 20000     |
      | income box 460    | 0         |
      | household members | 3         |
    And I press "Simular"
    Then the simulator result shows a monthly total in euros

  Scenario: Switching tabs toggles between joint and individual income fields
    When I open the fee simulator
    Then the "Renta Conjunta" fields are visible
    And the "Renta Individual" fields are not visible
    When I switch to the "Renta Individual" tab
    Then the "Renta Individual" fields are visible
    And the "Renta Conjunta" fields are not visible
    When I switch to the "Renta Conjunta" tab
    Then the "Renta Conjunta" fields are visible
    And the "Renta Individual" fields are not visible

  # Comprobación de estado: el modal es el mismo nodo del DOM que se oculta y
  # se vuelve a mostrar, así que conserva lo introducido. Documentar este
  # comportamiento real evita que alguien lo "arregle" por error más adelante.
  Scenario: The simulator keeps its values and result after closing and reopening
    When I open the fee simulator
    And I fill the "Renta Conjunta" simulator with:
      | field             | value     |
      | birth year        | 2024/2025 |
      | morning club      | Si        |
      | lunch             | Si        |
      | afternoon club    | Si        |
      | income box 435    | 20000     |
      | income box 460    | 0         |
      | household members | 3         |
    And I press "Simular"
    And I close the simulator with "×"
    And I open the fee simulator
    Then the "income box 435" field still holds "20.000"
    And the simulator result shows a monthly total in euros

  Scenario: Full journey from the homepage to Contacto
    When I open the fee simulator
    And I close the simulator with "Salir"
    And I click the "Matriculación 2026/2027" button on the homepage
    Then the URL contains "page=matriculacion"
    And I see a heading containing "Plazo de solicitudes de nueva admisión"
    When I click "Contacto" in the main menu
    Then the URL contains "page=contacto"
    And the link "e.i.zaketines@gmail.com" points to "mailto:e.i.zaketines@gmail.com"
