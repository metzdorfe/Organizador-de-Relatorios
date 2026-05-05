BEGIN;

-- Estrutura atual do projeto.
-- Neste momento o banco possui apenas a tabela tusuarios.
-- Este script cria a tabela se ela ainda nao existir e ajusta as colunas
-- necessarias para o backend atual funcionar.

CREATE TABLE IF NOT EXISTS tusuarios (
  controle BIGSERIAL PRIMARY KEY,
  usuario VARCHAR(100) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  nome VARCHAR(150) NOT NULL,
  nivel VARCHAR(30) NOT NULL DEFAULT 'tecnico',
  programador BOOLEAN NOT NULL DEFAULT false,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE tusuarios
  ADD COLUMN IF NOT EXISTS controle BIGSERIAL,
  ADD COLUMN IF NOT EXISTS usuario VARCHAR(100),
  ADD COLUMN IF NOT EXISTS senha VARCHAR(255),
  ADD COLUMN IF NOT EXISTS nome VARCHAR(150),
  ADD COLUMN IF NOT EXISTS nivel VARCHAR(30) DEFAULT 'tecnico',
  ADD COLUMN IF NOT EXISTS programador BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS criado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();

UPDATE tusuarios SET nivel = 'tecnico' WHERE nivel IS NULL;
UPDATE tusuarios SET programador = false WHERE programador IS NULL;
UPDATE tusuarios SET ativo = true WHERE ativo IS NULL;
UPDATE tusuarios SET criado_em = NOW() WHERE criado_em IS NULL;
UPDATE tusuarios SET atualizado_em = NOW() WHERE atualizado_em IS NULL;

ALTER TABLE tusuarios
  ALTER COLUMN usuario SET NOT NULL,
  ALTER COLUMN senha SET NOT NULL,
  ALTER COLUMN nome SET NOT NULL,
  ALTER COLUMN nivel SET NOT NULL,
  ALTER COLUMN programador SET NOT NULL,
  ALTER COLUMN ativo SET NOT NULL,
  ALTER COLUMN criado_em SET NOT NULL,
  ALTER COLUMN atualizado_em SET NOT NULL;

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

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tusuarios_nivel_chk'
  ) THEN
    ALTER TABLE tusuarios
      ADD CONSTRAINT tusuarios_nivel_chk
      CHECK (nivel IN ('tecnico', 'programador', 'admin'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tusuarios_usuario
  ON tusuarios (usuario);

CREATE INDEX IF NOT EXISTS idx_tusuarios_ativo
  ON tusuarios (ativo);

CREATE INDEX IF NOT EXISTS idx_tusuarios_programador
  ON tusuarios (programador);

-- Usuario inicial opcional para primeiro acesso.
-- A senha em texto puro forca o fluxo de definir senha no primeiro login.
-- Troque os dados antes de executar em producao.
--
-- INSERT INTO tusuarios (usuario, senha, nome, nivel, programador, ativo)
-- VALUES ('admin', '123456', 'Administrador', 'admin', true, true)
-- ON CONFLICT (usuario) DO NOTHING;

COMMIT;
