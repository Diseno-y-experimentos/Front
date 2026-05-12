
Característica: Gestión de Rutas y Horarios
  Como pasajero de BusTrack
  Quiero gestionar rutas frecuentes y consultar información asociada
  Para acceder con rapidez a mis recorridos más utilizados

  Escenario: Guardar una ruta favorita exitosamente
    Dado que el pasajero ha seleccionado una ruta entre "Origen A" y "Destino B".
    Cuando presiona el botón "Guardar como favorita".
    Entonces el sistema debe registrar la ruta en la lista de favoritos del usuario.
    Y mostrar una confirmación: "Ruta guardada exitosamente".

  Escenario: Error al guardar una ruta ya existente
    Dado que el pasajero ya tiene guardada la ruta "Origen A - Destino B".
    Cuando intenta guardarla nuevamente.
    Entonces el sistema debe mostrar un mensaje de advertencia: "Esta ruta ya está guardada".

  Escenario: Visualizar ruta en Google Maps con datos válidos
    Dado que el pasajero ingresa un origen y destino reales.
    Cuando presiona el botón "Ver en Google Maps".
    Entonces la aplicación debe abrir la interfaz de Google Maps con el recorrido trazado.

  Escenario: Sugerencias de Google Maps ante direcciones ambiguas
    Dado que el pasajero ingresa una dirección que no es exacta.
    Cuando presiona "Ver en Google Maps".
    Entonces la aplicación debe abrir Google Maps y mostrar una lista de sugerencias de ubicación.

  Escenario: Listar rutas favoritas desde la API
    Dado que el frontend solicita la lista de favoritos mediante un GET al endpoint /api/users/{userId}/favorites.
    Cuando el servidor responde con éxito.
    Entonces la aplicación debe mostrar todas las rutas guardadas en la interfaz del pasajero.
