const loginMessage = document.querySelector('#form-message');

if (loginMessage) {
  const redirectAfterLogin = new MutationObserver(() => {
    const hasSession = localStorage.getItem('mi-sistema-session') || sessionStorage.getItem('mi-sistema-session');
    if (hasSession && loginMessage.classList.contains('success')) {
      window.setTimeout(() => window.location.assign('./panel.html'), 500);
      redirectAfterLogin.disconnect();
    }
  });

  redirectAfterLogin.observe(loginMessage, { attributes: true, childList: true });
}
