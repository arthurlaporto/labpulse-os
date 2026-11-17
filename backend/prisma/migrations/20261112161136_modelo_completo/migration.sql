-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('EXTERNO', 'INTERNO_UFF', 'RESPONSAVEL_EQUIPAMENTO', 'COORDENADOR_LABORATORIO', 'ADMINISTRADOR');

-- CreateEnum
CREATE TYPE "StatusOperacional" AS ENUM ('DISPONIVEL', 'EM_USO', 'COM_RESTRICOES', 'INOPERANTE', 'SUBSTITUIDO');

-- CreateEnum
CREATE TYPE "FinalidadeUso" AS ENUM ('PESQUISA', 'ENSINO', 'EXTENSAO', 'SERVICO_EXTERNO');

-- CreateEnum
CREATE TYPE "StatusRegistroUso" AS ENUM ('SOLICITADO', 'APROVADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'RECUSADO');

-- CreateEnum
CREATE TYPE "StatusAprovacao" AS ENUM ('PENDENTE', 'APROVADA', 'RECUSADA');

-- CreateEnum
CREATE TYPE "TipoManutencao" AS ENUM ('CORRETIVA', 'PREVENTIVA', 'PREDITIVA');

-- CreateEnum
CREATE TYPE "StatusManutencao" AS ENUM ('ABERTA', 'ENCERRADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "Universidade" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "sigla" TEXT NOT NULL,
    "ehUff" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Universidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campus" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "localizacao" TEXT,
    "universidadeId" INTEGER NOT NULL,

    CONSTRAINT "Campus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Laboratorio" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "localizacao" TEXT NOT NULL,
    "campusId" INTEGER NOT NULL,
    "coordenadorId" INTEGER,

    CONSTRAINT "Laboratorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "matriculaCpf" TEXT NOT NULL,
    "tipoUsuario" "TipoUsuario" NOT NULL,
    "vinculoInstitucional" TEXT NOT NULL,
    "ehUff" BOOLEAN NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipamento" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "fabricante" TEXT,
    "modelo" TEXT,
    "numeroSerie" TEXT,
    "dataAquisicao" TIMESTAMP(3),
    "fotoUrl" TEXT NOT NULL,
    "statusOperacionalidade" "StatusOperacional" NOT NULL DEFAULT 'DISPONIVEL',
    "percentualDesempenho" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "vidaUtilEstimadaHoras" INTEGER,
    "horasUsoAcumuladas" INTEGER NOT NULL DEFAULT 0,
    "laboratorioId" INTEGER NOT NULL,
    "responsavelId" INTEGER NOT NULL,

    CONSTRAINT "Equipamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjetoPesquisa" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "codigoProjeto" TEXT NOT NULL,
    "professorResponsavelId" INTEGER NOT NULL,

    CONSTRAINT "ProjetoPesquisa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroUso" (
    "id" SERIAL NOT NULL,
    "numeroRegistro" TEXT NOT NULL,
    "dataSolicitacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "finalidadeUso" "FinalidadeUso" NOT NULL,
    "status" "StatusRegistroUso" NOT NULL DEFAULT 'SOLICITADO',
    "amostraDescricao" TEXT,
    "oQueFoiMedido" TEXT,
    "arquivosResultadoUrl" TEXT,
    "intercorrencias" TEXT,
    "usuarioId" INTEGER NOT NULL,
    "equipamentoId" INTEGER NOT NULL,
    "projetoId" INTEGER,

    CONSTRAINT "RegistroUso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manutencao" (
    "id" SERIAL NOT NULL,
    "numeroOs" TEXT NOT NULL,
    "tipo" "TipoManutencao" NOT NULL,
    "status" "StatusManutencao" NOT NULL DEFAULT 'ABERTA',
    "dataSolicitacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataEncerramento" TIMESTAMP(3),
    "descricao" TEXT NOT NULL,
    "notaAvaliacao" INTEGER,
    "observacoes" TEXT,
    "equipamentoId" INTEGER NOT NULL,
    "solicitanteId" INTEGER NOT NULL,

    CONSTRAINT "Manutencao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecomendacaoEquipamento" (
    "id" SERIAL NOT NULL,
    "nomeEquipamento" TEXT NOT NULL,
    "especificacoesTecnicas" TEXT,
    "justificativa" TEXT NOT NULL,
    "fotoReferenciaUrl" TEXT,
    "statusAprovacao" "StatusAprovacao" NOT NULL DEFAULT 'PENDENTE',
    "dataSolicitacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "solicitanteId" INTEGER NOT NULL,
    "laboratorioId" INTEGER NOT NULL,

    CONSTRAINT "RecomendacaoEquipamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ProjetoPesquisa_codigoProjeto_key" ON "ProjetoPesquisa"("codigoProjeto");

-- CreateIndex
CREATE UNIQUE INDEX "RegistroUso_numeroRegistro_key" ON "RegistroUso"("numeroRegistro");

-- CreateIndex
CREATE UNIQUE INDEX "Manutencao_numeroOs_key" ON "Manutencao"("numeroOs");

-- AddForeignKey
ALTER TABLE "Campus" ADD CONSTRAINT "Campus_universidadeId_fkey" FOREIGN KEY ("universidadeId") REFERENCES "Universidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Laboratorio" ADD CONSTRAINT "Laboratorio_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Laboratorio" ADD CONSTRAINT "Laboratorio_coordenadorId_fkey" FOREIGN KEY ("coordenadorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipamento" ADD CONSTRAINT "Equipamento_laboratorioId_fkey" FOREIGN KEY ("laboratorioId") REFERENCES "Laboratorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipamento" ADD CONSTRAINT "Equipamento_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjetoPesquisa" ADD CONSTRAINT "ProjetoPesquisa_professorResponsavelId_fkey" FOREIGN KEY ("professorResponsavelId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroUso" ADD CONSTRAINT "RegistroUso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroUso" ADD CONSTRAINT "RegistroUso_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroUso" ADD CONSTRAINT "RegistroUso_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "ProjetoPesquisa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manutencao" ADD CONSTRAINT "Manutencao_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manutencao" ADD CONSTRAINT "Manutencao_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecomendacaoEquipamento" ADD CONSTRAINT "RecomendacaoEquipamento_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecomendacaoEquipamento" ADD CONSTRAINT "RecomendacaoEquipamento_laboratorioId_fkey" FOREIGN KEY ("laboratorioId") REFERENCES "Laboratorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
