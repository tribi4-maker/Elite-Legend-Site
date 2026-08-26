-- Tabela de pesagens e altura dos atletas
create table pesagens (
  id            bigint generated always as identity primary key,
  atleta_id     bigint not null references inscricoes(id) on delete cascade,
  data_registo  date not null,
  peso          numeric(5,2),
  altura        numeric(5,2),
  criado_em     timestamptz default now()
);

-- RLS
alter table pesagens enable row level security;

create policy "admin_pesagens" on pesagens for all to authenticated using (true) with check (true);
