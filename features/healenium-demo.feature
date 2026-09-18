# language: es
# Excluido de la suite normal (ver tags: 'not @healing-demo' en wdio.shared.conf.ts).
# Solo se ejecuta con `npm run healenium:demo`, que lo lanza dos veces contra
# la MISMA página en dos versiones: antes y después de un rediseño. El
# localizador del test no cambia nunca — es la página la que cambia, que es
# justo el caso que Healenium sabe reparar.
@healing-demo
Característica: Demo de auto-sanación con Healenium
  Como ingeniero de automatización
  Quiero que Healenium repare un localizador que la web ha dejado obsoleto
  Para que los tests sobrevivan a rediseños sin mantenimiento manual

  Escenario: El botón del simulador se sigue encontrando después de un rediseño
    Dado que abro la página de la demo de sanación
    Cuando hago clic en el botón del simulador con el localizador de siempre
    Entonces se muestra el resultado del simulador
