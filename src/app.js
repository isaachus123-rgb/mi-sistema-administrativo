const fallbackMessage = 'Bienvenido';
const heading = document.querySelector('#welcome-message');

async function loadWelcomeMessage() {
  const { supabaseUrl, supabasePublishableKey } = window.APP_CONFIG ?? {};

  if (!supabaseUrl || !supabasePublishableKey) {
    heading.textContent = fallbackMessage;
    return;
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/welcome_messages?select=message&active=eq.true&order=created_at.desc&limit=1`,
      {
        headers: {
          apikey: supabasePublishableKey,
          Authorization: `Bearer ${supabasePublishableKey}`,
        },
      },
    );

    if (!response.ok) throw new Error(`Supabase respondió ${response.status}`);
    const [record] = await response.json();
    heading.textContent = record?.message?.trim() || fallbackMessage;
  } catch (error) {
    console.warn('No fue posible cargar el mensaje remoto.', error);
    heading.textContent = fallbackMessage;
  }
}

loadWelcomeMessage();
