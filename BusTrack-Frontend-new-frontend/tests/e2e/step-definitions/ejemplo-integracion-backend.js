/* global Given, When, Then, cy */

Given('que el frontend solicita la lista de favoritos mediante un GET al endpoint de favoritos del usuario.', () => {
  cy.intercept('GET', '/api/users/*/favorites', {
    statusCode: 200,
    body: [
      {
        id: 1,
        origin: 'Origen A',
        destination: 'Destino B',
        isFavorite: true,
      },
    ],
  }).as('getFavorites');
});

When('la aplicación carga la sección de favoritos.', () => {
  cy.visit('/');
  cy.wait('@getFavorites');
});

Then('la respuesta debe tener estado 200.', () => {
  cy.get('@getFavorites').its('response.statusCode').should('eq', 200);
});

Given('que se envía un POST al endpoint de alertas de empresa con datos de un incidente.', () => {
  cy.intercept('POST', '/api/companies/*/alerts', {
    statusCode: 201,
    body: {
      message: 'Alerta registrada correctamente',
    },
  }).as('postAlert');
});

When('la aplicación registra la alerta desde la interfaz corporativa.', () => {
  cy.request({
    method: 'POST',
    url: '/api/companies/10/alerts',
    body: {
      type: 'incidente',
      description: 'Unidad detenida en vía principal',
    },
  });
});

Then('la respuesta debe tener estado 201.', () => {
  cy.wait('@postAlert').its('response.statusCode').should('eq', 201);
});

