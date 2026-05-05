BEGIN;

-- Estrutura real atual do banco.
-- A tabela existente informada pelo projeto e tusuarios.
-- Este script cria a tabela no mesmo formato e aplica apenas o ajuste
-- necessario para o login atual: a coluna senha.

CREATE TABLE IF NOT EXISTS tusuarios (
  controle SERIAL PRIMARY KEY,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  nome VARCHAR(50) NOT NULL,
  programador BOOLEAN DEFAULT false,
  nivel INT NOT NULL,
  datahoracadastro DATE DEFAULT CURRENT_DATE,
  ativo BOOLEAN DEFAULT true,
  dataemissao DATE
);

ALTER TABLE tusuarios
  ADD COLUMN IF NOT EXISTS controle SERIAL,
  ADD COLUMN IF NOT EXISTS usuario VARCHAR(50),
  ADD COLUMN IF NOT EXISTS nome VARCHAR(50),
  ADD COLUMN IF NOT EXISTS programador BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS nivel INT,
  ADD COLUMN IF NOT EXISTS datahoracadastro DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS dataemissao DATE;

-- Coluna necessaria para o fluxo de login/primeiro acesso.
-- Pode receber senha temporaria em texto puro no primeiro acesso.
-- Depois do primeiro login, o sistema salva hash bcrypt nesta coluna.
ALTER TABLE tusuarios
  ADD COLUMN IF NOT EXISTS senha VARCHAR(255);

UPDATE tusuarios SET programador = false WHERE programador IS NULL;
UPDATE tusuarios SET ativo = true WHERE ativo IS NULL;
UPDATE tusuarios SET datahoracadastro = CURRENT_DATE WHERE datahoracadastro IS NULL;

ALTER TABLE tusuarios
  ALTER COLUMN usuario SET NOT NULL,
  ALTER COLUMN nome SET NOT NULL,
  ALTER COLUMN nivel SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'tusuarios'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE tusuarios
      ADD CONSTRAINT tusuarios_pkey PRIMARY KEY (controle);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tusuarios_usuario_formato_chk'
  ) THEN
    ALTER TABLE tusuarios
      ADD CONSTRAINT tusuarios_usuario_formato_chk
      CHECK (usuario ~ '^[A-Za-z0-9_.]+$');
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tusuarios_usuario
  ON tusuarios (usuario);

CREATE INDEX IF NOT EXISTS idx_tusuarios_ativo
  ON tusuarios (ativo);

CREATE INDEX IF NOT EXISTS idx_tusuarios_programador
  ON tusuarios (programador);

CREATE INDEX IF NOT EXISTS idx_tusuarios_nivel
  ON tusuarios (nivel);

-- Usuario inicial opcional para primeiro acesso.
-- Ajuste nivel/programador conforme sua regra:
--   nivel: numero usado pelo sistema
--   programador: true para programador, false para tecnico
--
-- INSERT INTO tusuarios (usuario, nome, programador, nivel, ativo, senha)
-- VALUES ('admin', 'Administrador', true, 1, true, '123456')
-- ON CONFLICT (usuario) DO NOTHING;

COMMIT;
