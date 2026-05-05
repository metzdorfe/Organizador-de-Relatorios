const form = document.getElementById('definirSenhaForm');
const inputSenha = document.getElementById('novaSenha');
const inputConfirmar = document.getElementById('confirmarSenha');
const btnDefinirSenha = document.getElementById('btnDefinirSenha');
const senhaMsg = document.getElementById('senhaMsg');
const forcaIndicador = document.getElementById('forcaIndicador');
const forcaTexto = document.getElementById('forcaTexto');

const olhoAberto = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
const olhoFechado = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';

const mostrarMensagem = (texto, tipo = 'erro') => {
  senhaMsg.textContent = texto;
  senhaMsg.classList.toggle('sucesso', tipo === 'sucesso');
  senhaMsg.classList.add('visivel');
};

const limparMensagem = () => {
  senhaMsg.textContent = '';
  senhaMsg.classList.remove('visivel', 'sucesso');
};

const marcarCampo = (input, invalido) => {
  input.closest('.campo')?.classList.toggle('erro', invalido);
};

const calcularForca = (senha) => {
  let pontos = 0;

  if (senha.length >= 6) pontos += 1;
  if (senha.length >= 10) pontos += 1;
  if (/[A-Z]/.test(senha) && /[a-z]/.test(senha)) pontos += 1;
  if (/\d/.test(senha)) pontos += 1;
  if (/[^A-Za-z0-9]/.test(senha)) pontos += 1;

  return Math.min(pontos, 4);
};

const atualizarForca = () => {
  const senha = inputSenha.value;
  const forca = calcularForca(senha);
  const estados = [
    { classe: 'vazia', texto: 'Use pelo menos 6 caracteres.' },
    { classe: 'fraca', texto: 'Senha fraca.' },
    { classe: 'media', texto: 'Senha média.' },
    { classe: 'boa', texto: 'Senha boa.' },
    { classe: 'forte', texto: 'Senha forte.' },
  ];
  const estado = estados[forca];

  forcaIndicador.className = estado.classe;
  forcaTexto.textContent = estado.texto;
};

document.querySelectorAll('.toggle-senha').forEach((botao) => {
  botao.addEventListener('click', () => {
    const input = document.getElementById(botao.dataset.target);
    const mostrar = input.type === 'password';

    input.type = mostrar ? 'text' : 'password';
    botao.innerHTML = mostrar ? olhoFechado : olhoAberto;
    botao.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
    input.focus();
  });
});

const params = new URLSearchParams(window.location.search);
const erro = params.get('erro');

if (erro) {
  mostrarMensagem(erro);
  window.history.replaceState({}, document.title, window.location.pathname);
}

[inputSenha, inputConfirmar].forEach((input) => {
  input.addEventListener('input', () => {
    marcarCampo(input, false);
    if (senhaMsg.classList.contains('visivel')) {
      limparMensagem();
    }
  });
});

inputSenha.addEventListener('input', atualizarForca);
atualizarForca();

form.addEventListener('submit', (event) => {
  const senha = inputSenha.value;
  const confirmar = inputConfirmar.value;
  const senhaInvalida = !senha || senha.length < 6;
  const confirmarInvalida = !confirmar || senha !== confirmar;

  marcarCampo(inputSenha, senhaInvalida);
  marcarCampo(inputConfirmar, confirmarInvalida);

  if (senhaInvalida) {
    event.preventDefault();
    mostrarMensagem('A senha deve ter pelo menos 6 caracteres.');
    return;
  }

  if (confirmarInvalida) {
    event.preventDefault();
    mostrarMensagem('As senhas não coincidem.');
    return;
  }

  btnDefinirSenha.classList.add('carregando');
  btnDefinirSenha.disabled = true;
  btnDefinirSenha.textContent = 'Salvando...';
});
