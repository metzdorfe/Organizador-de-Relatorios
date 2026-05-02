const form       = document.getElementById('loginForm');
const btnLogar   = document.getElementById('btnLogar');
const erroMsg    = document.getElementById('erroMsg');
const inputSenha = document.getElementById('senha');
const toggleBtn  = document.getElementById('toggleSenha');
const iconeOlho  = document.getElementById('iconeOlho');

/* ── MOSTRAR / OCULTAR SENHA ── */
const olhoAberto  = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
const olhoFechado = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';

let senhaVisivel = false;

toggleBtn.addEventListener('click', () => {
  senhaVisivel = !senhaVisivel;
  inputSenha.type     = senhaVisivel ? 'text' : 'password';
  iconeOlho.innerHTML = senhaVisivel ? olhoFechado : olhoAberto;
  toggleBtn.setAttribute('aria-label', senhaVisivel ? 'Ocultar senha' : 'Mostrar senha');
});

/* submit */
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  erroMsg.classList.remove('visivel');

  const usuario = document.getElementById('usuario').value.trim();
  const senha   = inputSenha.value;

  if (!usuario || !senha) return;

  btnLogar.classList.add('carregando');
  btnLogar.textContent = 'Entrando…';

  try {
    const response = await fetch('http://localhost:3001/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, senha })
    });

    const dados = await response.json();

    if (!response.ok) {
      // erro de credencial
      erroMsg.textContent = dados.mensagem;
      erroMsg.classList.add('visivel');
      return;
    }

    if (dados.primeiroacesso) {
      // redireciona para tela de definir senha
      sessionStorage.setItem('controle', dados.controle);
      window.location.href = 'definirSenha.html';
      return;
    }

    // login com sucesso — salva o token e redireciona
    localStorage.setItem('token', dados.token);
    localStorage.setItem('usuario', JSON.stringify(dados.usuario));
    window.location.href = '../src/pages/dashboard.html';

  } catch (err) {
    erroMsg.textContent = 'Não foi possível conectar ao servidor.';
    erroMsg.classList.add('visivel');
  } finally {
    btnLogar.classList.remove('carregando');
    btnLogar.textContent = 'Entrar';
  }
});