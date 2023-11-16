// Accede a las credenciales como un objeto JSON
const credentials = JSON.parse(document.getElementById('credentials').textContent);

// Inicialización de la biblioteca gapi
gapi.load('client:auth2', async () => {
  await gapi.client.init({
    clientId: credentials.installed.client_id,
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
  });

  // Obtiene la instancia de autenticación
  const authInstance = gapi.auth2.getAuthInstance();

  // Obtiene el token actual
  const user = authInstance.currentUser.get();
  const oAuth2Client = user.getAuthResponse();

  // Enlaza el archivo HTML y busca el contenedor de eventos
  const eventsContainer = document.getElementById('events-container');

  // Función para autenticar y obtener eventos
  async function listUpcomingEvents() {
    try {
      // Genera el enlace de autorización
      const authUrl = authInstance.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
      });

      // Imprime el enlace en la consola y solicita al usuario que lo abra para autorizar la aplicación
      console.log('Authorize this app by visiting this URL:', authUrl);

      // Obtiene el código de autorización del usuario
      const code = prompt('Enter the code from that page here: ');

      // Intercambia el código de autorización por tokens de acceso y de actualización
      const { tokens } = await authInstance.getToken(code);
      authInstance.setCredentials(tokens);

      // Inicializa el servicio de la API de Google Calendar
      const calendar = gapi.client.calendar;

      // Obtiene los próximos 10 eventos
      const response = await calendar.events.list({
        calendarId: 'primary', // Reemplaza 'primary' con tu ID de calendario
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });

      // Muestra los eventos en el contenedor
      const events = response.result.items;
      events.forEach((event) => {
        const eventDiv = document.createElement('div');
        eventDiv.innerHTML = `<strong>${event.summary}</strong><br>${event.start.dateTime || event.start.date}<br><br>`;
        eventsContainer.appendChild(eventDiv);
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Llama a la función para listar los próximos eventos
  listUpcomingEvents();
});
