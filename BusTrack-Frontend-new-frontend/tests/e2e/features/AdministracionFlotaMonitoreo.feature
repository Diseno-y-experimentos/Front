
Característica: Administración de Flota y Monitoreo
  Como usuario de empresa en BusTrack
  Quiero administrar buses y supervisar su estado operativo
  Para controlar la flota y responder ante incidencias

  Escenario: Agregar un bus nuevo a la flota
    Dado que el administrador completa correctamente el formulario de "Agregar bus".
    Cuando presiona el botón "Guardar".
    Entonces el bus debe aparecer en la tabla de flota con un ID generado automáticamente.

  Escenario: Cancelar la edición de datos de un bus
    Dado que el administrador está modificando la información de un bus.
    Cuando presiona el botón "Cancelar" sin guardar.
    Entonces el sistema debe cerrar el formulario y mantener los datos originales del bus.

  Escenario: Acceso al monitoreo en tiempo real para empresas
    Dado que el usuario ha iniciado sesión con perfil de empresa.
    Cuando abre el módulo de "Monitoreo".
    Entonces el sistema debe cargar el mapa con la ubicación y el estado de los buses.

  Escenario: Reintento por fallo de conexión en monitoreo
    Dado que ocurre un error de comunicación con el servidor.
    Cuando la empresa intenta cargar el mapa de flota.
    Entonces se debe visualizar el aviso "Error de conexión" con la opción de "Reintentar".

  Escenario: Registro de alerta de incidente
    Dado que se envía un POST al endpoint /api/companies/{companyId}/alerts con datos de un incidente.
    Cuando el servidor procesa la solicitud.
    Entonces la API debe retornar un código de estado 201 y registrar el evento.

