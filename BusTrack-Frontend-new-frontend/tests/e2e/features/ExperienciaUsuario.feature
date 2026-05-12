
Característica: Experiencia del Usuario
  Como usuario de BusTrack
  Quiero registrarme, administrar mi perfil y elegir mi rol de acceso
  Para utilizar la plataforma conforme a mis necesidades

  Escenario: Registro exitoso de un nuevo pasajero
    Dado que el usuario completa todos los campos del formulario de registro.
    Cuando presiona el botón "Registrarse".
    Entonces el sistema debe crear la cuenta y permitir el acceso a la plataforma.

  Escenario: Bloqueo de registro por campos vacíos
    Dado que el usuario deja campos obligatorios sin llenar.
    Cuando intenta registrarse.
    Entonces debe aparecer el mensaje de alerta: "Complete todos los campos".

  Escenario: Edición de perfil con datos válidos
    Dado que el pasajero modifica su nombre o teléfono en la sección de perfil.
    Cuando guarda los cambios.
    Entonces la información del perfil debe actualizarse correctamente.

  Escenario: Validación de formato de correo electrónico
    Dado que el usuario ingresa un correo con formato incorrecto (ej. sin el @).
    Cuando intenta guardar los cambios de perfil.
    Entonces el sistema debe mostrar el mensaje: "Correo no válido".

  Escenario: Elección de rol de usuario en el acceso
    Dado que el usuario se encuentra en la pantalla de bienvenida.
    Cuando selecciona el tipo de usuario "Empresa" y continúa.
    Entonces el sistema debe mostrar el módulo de acceso corporativo.

  Escenario: Botón de continuar deshabilitado sin selección de rol
    Dado que el usuario no ha seleccionado ninguna opción de ingreso.
    Cuando observa la pantalla de acceso.
    Entonces el botón "Continuar" debe permanecer deshabilitado.

