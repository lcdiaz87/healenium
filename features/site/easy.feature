# Nivel fácil: comprobaciones estáticas de la portada.
# No hay interacción, solo se carga la página y se verifican elementos.
# Si estás empezando, este es el fichero por el que leer primero.
Feature: Zaketines homepage - basic checks
  As a visitor of the C.E.I. Zaketines website
  I want to check the essential elements of the homepage
  So that I can be sure the site loads correctly

  Background:
    Given I am on the Zaketines homepage

  Scenario: The homepage loads with the expected title
    Then the page title is "C.E.I. ZAKETINES"

  Scenario: The meta description identifies the school and its location
    Then the meta description contains "Centro de Educación Infantil ZAKETINES"

  Scenario: The main menu shows every navigation link
    Then the main menu shows the links "Inicio, Matriculacion, Objetivos, Instalaciones, Contacto"

  Scenario: The appointment booking button is visible on the homepage
    Then the button "RESERVA TU CITA" is visible

  Scenario: The copyright notice appears in the footer
    Then the footer shows the copyright notice for the current year
