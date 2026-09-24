# Este escenario NO forma parte de la suite del sitio: vive en su propia
# carpeta y solo se ejecuta con `npm run healenium:demo` o
# `npm run healenium:playground`.
#
# La clave está en que el localizador del test NUNCA cambia. Healenium indexa
# su histórico por el propio localizador, así que solo sabe reparar un
# localizador que se ha roto porque la PÁGINA cambió debajo. Si cambiaras el
# selector en el código, Healenium vería uno nuevo sin historial y no haría nada.
#
# Por eso el mismo escenario se lanza dos veces contra dos versiones de la
# misma página: v1 (antes del rediseño) y v2 (después).
@healing
Feature: Self-healing a locator broken by a redesign
  As a test automation engineer
  I want Healenium to repair a locator that the website has made obsolete
  So that my tests survive cosmetic redesigns without manual maintenance

  Scenario: The simulator button is still found after a redesign
    Given I open the healing demo page
    When I click the simulator button using the usual locator
    Then the simulator result is shown
