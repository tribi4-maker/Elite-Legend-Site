-- Tabela de logótipos de Patrocinadores (geridos em galeria-admin.html?tipo=patrocinadores)
create table patrocinadores (
  id         bigint generated always as identity primary key,
  imagem_url text not null,
  legenda    text not null default 'Patrocinador Elite Legend Academy',
  ativo      boolean not null default true,
  criado_em  timestamptz not null default now()
);

alter table patrocinadores enable row level security;

create policy "leitura_publica_patrocinadores"
  on patrocinadores for select
  to anon
  using (ativo = true);

create policy "admin_patrocinadores"
  on patrocinadores for all
  to authenticated
  using (true)
  with check (true);

insert into storage.buckets (id, name, public)
values ('patrocinadores', 'patrocinadores', true)
on conflict (id) do nothing;

create policy "leitura_publica_patrocinadores_imagens"
  on storage.objects for select
  to public
  using (bucket_id = 'patrocinadores');

create policy "admin_upload_patrocinadores_imagens"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'patrocinadores');

create policy "admin_update_patrocinadores_imagens"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'patrocinadores');

create policy "admin_delete_patrocinadores_imagens"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'patrocinadores');

-- Migra os logótipos atuais
insert into patrocinadores (imagem_url, legenda) values
('images/patrocinadores/1.webp', 'Patrocinador Elite Legend Academy'),
('images/patrocinadores/2.webp', 'Patrocinador Elite Legend Academy'),
('images/patrocinadores/4.webp', 'Patrocinador Elite Legend Academy'),
('images/patrocinadores/5.webp', 'Patrocinador Elite Legend Academy'),
('images/patrocinadores/6.webp', 'Patrocinador Elite Legend Academy'),
('images/patrocinadores/7.webp', 'Patrocinador Elite Legend Academy'),
('images/patrocinadores/8.webp', 'Patrocinador Elite Legend Academy'),
('images/patrocinadores/9.webp', 'Patrocinador Elite Legend Academy'),
('images/patrocinadores/10.webp', 'Patrocinador Elite Legend Academy'),
('images/patrocinadores/11.webp', 'Patrocinador Elite Legend Academy'),
('images/patrocinadores/12.webp', 'Patrocinador Elite Legend Academy'),
('images/patrocinadores/13.webp', 'Patrocinador Elite Legend Academy'),
('images/patrocinadores/14.webp', 'Patrocinador Elite Legend Academy'),
('images/patrocinadores/17.webp', 'Patrocinador Elite Legend Academy'),
('images/patrocinadores/18.webp', 'Patrocinador Elite Legend Academy'),
('images/patrocinadores/19.webp', 'Patrocinador Elite Legend Academy'),
('images/patrocinadores/20.webp', 'Patrocinador Elite Legend Academy'),
('images/patrocinadores/21.webp', 'Patrocinador Elite Legend Academy'),
('images/patrocinadores/22.webp', 'Patrocinador Elite Legend Academy'),
('images/patrocinadores/23.webp', 'Patrocinador Elite Legend Academy'),
('images/patrocinadores/24.webp', 'Patrocinador Elite Legend Academy');
