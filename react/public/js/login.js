const form = document.getElementById('loginForm');
const btnLogar = document.getElementById('btnLogar');
const erroMsg = document.getElementById('erroMsg');
const inputUsuario = document.getElementById('usuario');
const inputSenha = document.getElementById('senha');
const toggleBtn = document.getElementById('toggleSenha');
const iconeOlho = document.getElementById('iconeOlho');

const usuarioPermitido = /^[A-Za-z0-9_.]+$/;
const olhoAberto = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
const olhoFechado = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';

let senhaVisivel = false;

const mostrarMensagem = (texto, tipo = 'erro') => {
  erroMsg.textContent = texto;
  erroMsg.classList.toggle('sucesso', tipo === 'sucesso');
  erroMsg.classList.add('visivel');
};

const limparMensagem = () => {
  erroMsg.textContent = '';
  erroMsg.classList.remove('visivel', 'sucesso');
};

const marcarCampo = (input, invalido) => {
  input.closest('.campo')?.classList.toggle('erro', invalido);
};

toggleBtn.addEventListener('click', () => {
  senhaVisivel = !senhaVisivel;
  inputSenha.type = senhaVisivel ? 'text' : 'password';
  iconeOlho.innerHTML = senhaVisivel ? olhoFechado : olhoAberto;
  toggleBtn.setAttribute('aria-label', senhaVisivel ? 'Ocultar senha' : 'Mostrar senha');
});

inputUsuario.addEventListener('input', () => {
  const valorLimpo = inputUsuario.value.replace(/[^A-Za-z0-9_.]/g, '');

  if (inputUsuario.value !== valorLimpo) {
    inputUsuario.value = valorLimpo;
    mostrarMensagem('Use apenas letras, números, _ e . no usuário.');
  }
});

const params = new URLSearchParams(window.location.search);
const erro = params.get('erro');
const senhaDefinida = params.get('senha') === 'definida';

if (erro) {
  mostrarMensagem(erro);
}

if (senhaDefinida) {
  mostrarMensagem('Senha definida com sucesso. Faça o login.', 'sucesso');
}

if (erro || senhaDefinida) {
  window.history.replaceState({}, document.title, window.location.pathname);
}

[inputUsuario, inputSenha].forEach((input) => {
  input.addEventListener('input', () => {
    marcarCampo(input, false);
    if (erroMsg.classList.contains('visivel') && !erroMsg.classList.contains('sucesso')) {
      limparMensagem();
    }
  });
});

form.addEventListener('submit', (event) => {
  const usuario = inputUsuario.value.trim();
  const senha = inputSenha.value;
  const usuarioInvalido = !usuario || !usuarioPermitido.test(usuario);
  const senhaInvalida = !senha || senha.length < 6;

  marcarCampo(inputUsuario, usuarioInvalido);
  marcarCampo(inputSenha, senhaInvalida);

  if (usuarioInvalido || senhaInvalida) {
    event.preventDefault();
    mostrarMensagem('Use apenas letras, números, _ e . no usuário. A senha deve ter pelo menos 6 caracteres.');
    return;
  }

  inputUsuario.value = usuario;
  btnLogar.classList.add('carregando');
  btnLogar.disabled = true;
  btnLogar.textContent = 'Entrando...';
});
