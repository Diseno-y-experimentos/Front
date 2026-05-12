# language: es
Característica: Landing Page
  Como visitante del sistema BusTrack
  Quiero conocer la solución, sus beneficios y la identidad institucional
  Para evaluar el alcance de la plataforma antes de registrarme

  Escenario: Visualización de información de la solución
    Dado que un visitante accede a la página de inicio (Home).
    Cuando navega hasta la sección "What Does BusTrack Offer?".
    Entonces debe visualizar un resumen claro de las funcionalidades de la aplicación.

  Escenario: Verificación de beneficios clave
    Dado que el visitante revisa la sección "Benefits of Using BusTrack".
    Cuando la página carga los elementos visuales.
    Entonces debe poder leer al menos tres beneficios principales del sistema.

  Escenario: Consulta de Misión y Visión corporativa
    Dado que el visitante ingresa a la sección "About Us".
    Cuando la sección se despliega.
    Entonces deben aparecer los párrafos correspondientes a la misión y visión de BusTrack.

  Escenario: Falla de carga de contenido por falta de internet
    Dado que el dispositivo del visitante pierde la conexión a la red.
    Cuando intenta cargar el Home de la aplicación.
    Entonces el sistema no debe mostrar el texto descriptivo de la solución.

