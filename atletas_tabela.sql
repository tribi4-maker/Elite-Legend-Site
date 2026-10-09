-- Tabela de fotos do Plantel (geridas em galeria-admin.html?tipo=atletas)
create table atletas (
  id         bigint generated always as identity primary key,
  imagem_url text not null,
  legenda    text not null default 'Atleta Elite Legend Academy',
  ativo      boolean not null default true,
  criado_em  timestamptz not null default now()
);

alter table atletas enable row level security;

create policy "leitura_publica_atletas"
  on atletas for select
  to anon
  using (ativo = true);

create policy "admin_atletas"
  on atletas for all
  to authenticated
  using (true)
  with check (true);

insert into storage.buckets (id, name, public)
values ('atletas', 'atletas', true)
on conflict (id) do nothing;

create policy "leitura_publica_atletas_imagens"
  on storage.objects for select
  to public
  using (bucket_id = 'atletas');

create policy "admin_upload_atletas_imagens"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'atletas');

create policy "admin_update_atletas_imagens"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'atletas');

create policy "admin_delete_atletas_imagens"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'atletas');

-- Migra as fotos atuais (1.webp..24.webp + treinadores.webp)
insert into atletas (imagem_url, legenda) values
('images/atletas/1.webp', 'Atleta Elite Legend Academy'),
('images/atletas/2.webp', 'Atleta Elite Legend Academy'),
('images/atletas/3.webp', 'Atleta Elite Legend Academy'),
('images/atletas/4.webp', 'Atleta Elite Legend Academy'),
('images/atletas/5.webp', 'Atleta Elite Legend Academy'),
('images/atletas/6.webp', 'Atleta Elite Legend Academy'),
('images/atletas/7.webp', 'Atleta Elite Legend Academy'),
('images/atletas/8.webp', 'Atleta Elite Legend Academy'),
('images/atletas/9.webp', 'Atleta Elite Legend Academy'),
('images/atletas/10.webp', 'Atleta Elite Legend Academy'),
('images/atletas/11.webp', 'Atleta Elite Legend Academy'),
('images/atletas/12.webp', 'Atleta Elite Legend Academy'),
('images/atletas/13.webp', 'Atleta Elite Legend Academy'),
('images/atletas/14.webp', 'Atleta Elite Legend Academy'),
('images/atletas/15.webp', 'Atleta Elite Legend Academy'),
('images/atletas/16.webp', 'Atleta Elite Legend Academy'),
('images/atletas/17.webp', 'Atleta Elite Legend Academy'),
('images/atletas/18.webp', 'Atleta Elite Legend Academy'),
('images/atletas/19.webp', 'Atleta Elite Legend Academy'),
('images/atletas/20.webp', 'Atleta Elite Legend Academy'),
('images/atletas/21.webp', 'Atleta Elite Legend Academy'),
('images/atletas/22.webp', 'Atleta Elite Legend Academy'),
('images/atletas/23.webp', 'Atleta Elite Legend Academy'),
('images/atletas/24.webp', 'Atleta Elite Legend Academy'),
('images/atletas/treinadores.webp', 'Treinadores Elite Legend Academy');
