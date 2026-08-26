create table inscricoes (
  id            bigint generated always as identity primary key,
  criado_em     timestamptz default now(),

  -- Atleta
  nome          text not null,
  data_nasc     date not null,
  num_bi        text not null,
  num_contrib   text not null,
  clube         text,

  -- Autorizações
  auth_imagens     text not null,
  auth_publicidade text not null,

  -- Encarregado
  enc_nome      text not null,
  enc_tlm       text not null,
  enc_email     text not null
);

-- Só inserts anónimos permitidos (sem leitura pública)
alter table inscricoes enable row level security;

create policy "insert_publico"
  on inscricoes for insert
  to anon
  with check (true);
