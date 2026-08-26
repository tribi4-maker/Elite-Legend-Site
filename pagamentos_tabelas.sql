-- Tabela de preços
create table precos (
  id        bigint generated always as identity primary key,
  nome      text not null,
  valor     numeric(8,2) not null,
  ativo     boolean default true,
  criado_em timestamptz default now()
);

-- Preço inicial
insert into precos (nome, valor) values ('Mensalidade Normal', 45.00);

-- Tabela de mensalidades
create table mensalidades (
  id             bigint generated always as identity primary key,
  atleta_id      bigint not null references inscricoes(id) on delete cascade,
  mes            integer not null check (mes between 1 and 12),
  ano            integer not null,
  preco_id       bigint references precos(id),
  valor_cobrado  numeric(8,2) not null,
  status         text not null default 'pendente',
  data_pagamento date,
  notas          text,
  criado_em      timestamptz default now(),
  unique(atleta_id, mes, ano)
);

-- RLS
alter table precos enable row level security;
alter table mensalidades enable row level security;

create policy "admin_precos"      on precos      for all to authenticated using (true) with check (true);
create policy "admin_mensalidades" on mensalidades for all to authenticated using (true) with check (true);

-- Mensalidade padrão por atleta (usada para pré-preencher o registo mensal)
alter table inscricoes add column preco_padrao_id bigint references precos(id);

-- Início de atividade do atleta (meses antes desta data não são cobrados)
alter table inscricoes drop column if exists inicio_atividade_mes;
alter table inscricoes drop column if exists inicio_atividade_ano;
alter table inscricoes add column if not exists inicio_atividade date;
