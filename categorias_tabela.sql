-- Tabela de categorias das novidades (geridas em publicacoes.html)
create table categorias (
  id        bigint generated always as identity primary key,
  nome      text not null unique,
  criado_em timestamptz not null default now()
);

alter table categorias enable row level security;

-- Só o backoffice (autenticado) lê/cria/edita categorias
create policy "admin_categorias"
  on categorias for all
  to authenticated
  using (true)
  with check (true);

-- Categorias já usadas nas novidades existentes
insert into categorias (nome) values
  ('Torneios'),
  ('Resultados'),
  ('Jogos'),
  ('Instalações'),
  ('Parceria');
