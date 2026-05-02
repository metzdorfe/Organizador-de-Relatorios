const btnRedefinir  = document.querySelector('.cadastrarSenha');
const inputSenha    = document.getElementById('novaSenha');
const inputConfirmar = document.getElementById('confirmarSenha');

btnRedefinir.addEventListener('click', async () => {
  const senha    = inputSenha.value;
  const confirmar = inputConfirmar.value;

  // validações
  if (!senha || !confirmar) {
    alert('Preencha todos os campos.');
    return;
  }

  if (senha.length < 6) {
    alert('A senha deve ter no mínimo 6 caracteres.');
    return;
  }

  if (senha !== confirmar) {
    alert('As senhas não coincidem.');
    return;
  }

  const controle = sessionStorage.getItem('controle');

  if (!controle) {
    alert('Sessão expirada. Faça o login novamente.');
    window.location.href = 'index.html';
    return;
  }

  try {
    const response = await fetch('http://localhost:3001/api/auth/definir_senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ controle, senha })
    });

    const dados = await response.json();

    if (!response.ok) {
      alert(dados.mensagem);
      return;
    }

    // limpa a sessão e volta pro login
    sessionStorage.removeItem('controle');
    alert('Senha definida com sucesso! Faça o login.');
    window.location.href = 'index.html';

  } catch (err) {
    alert('Não foi possível conectar ao servidor.');
  }
});