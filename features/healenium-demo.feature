# language: es
# Excluido de la suite normal (ver tags: 'not @healing-demo' en wdio.shared.conf.ts).
# Solo se ejecuta a través de `npm run healenium:demo`, que lo lanza dos veces:
# una con el selector real (para que Healenium aprenda dónde está el botón) y
# otra con un selector deliberadamente roto, para comprobar que lo sana.
@healing-demo
Característica: Demo de auto-sanación con Healenium
  Como ingeniero de automatización
  Quiero que Healenium repare un selector roto en tiempo de ejecución
  Para que los tests sobrevivan a cambios superficiales del DOM sin mantenimiento manual

  Escenario: El botón del simulador de cuota se localiza aunque el selector configurado esté roto
    Dado que estoy en la portada de Zaketines
    Cuando hago clic en el botón usando el selector de la demo de sanación
    Entonces se abre el modal del simulador de cuota
