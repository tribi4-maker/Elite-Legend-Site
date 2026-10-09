-- Tabela de novidades (geridas a partir de publicacoes.html)
create table novidades (
  id         bigint generated always as identity primary key,
  titulo     text not null,
  texto      text not null,
  tag        text not null default 'Novidades',
  mes_ano    text not null,
  imagem_url text not null,
  ativo      boolean not null default true,
  criado_em  timestamptz not null default now()
);

alter table novidades enable row level security;

-- Leitura pública (site) só das novidades ativas
create policy "leitura_publica_novidades"
  on novidades for select
  to anon
  using (ativo = true);

-- Backoffice: acesso total para utilizadores autenticados
create policy "admin_novidades"
  on novidades for all
  to authenticated
  using (true)
  with check (true);

-- Bucket de imagens das novidades (upload feito em publicacoes.html)
insert into storage.buckets (id, name, public)
values ('novidades', 'novidades', true)
on conflict (id) do nothing;

create policy "leitura_publica_novidades_imagens"
  on storage.objects for select
  to public
  using (bucket_id = 'novidades');

create policy "admin_upload_novidades_imagens"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'novidades');

create policy "admin_update_novidades_imagens"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'novidades');

create policy "admin_delete_novidades_imagens"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'novidades');

-- Dados iniciais: as novidades atualmente publicadas no site (texto com
-- **assim** para negrito, uma linha por parágrafo)
insert into novidades (titulo, texto, tag, mes_ano, imagem_url, criado_em) values
('Melhor Marcador do Torneio',
'O nosso craque **Afonso Pinto**, foi o melhor marcador do torneio.
Um excelente prémio individual, fruto do trabalho da equipa!
Parabéns **Afonso Pinto**, que seja o primeiro de muitos!',
'Resultados', 'Outubro 2026', 'images/torneios/afonso pinto perafita 26.webp', now() - interval '0 days'),

('4.º Lugar no Torneio Taça Ética',
'Terminado o Torneio em Perafita escalão Sub-11, quarto lugar da nossa equipa de Sub-10.
Uma classificação que sabe a pouco, mas que nos dá esperança e confiança para um futuro melhor!
🥇 AFS Fut Sad
🥈 FC Porto Feminino
🥉 São Félix da Marinha
🏅 Elite Legend Academy',
'Resultados', 'Outubro 2026', 'images/torneios/taca_etica_resultado1.webp', now() - interval '1 days'),

('Torneio Taça Ética — Sub 10',
'Os nossos Sub 10 realizam no sábado, dia 03 de outubro, mais um torneio, que conta com equipas como o FC Porto, Leixões, AFS Sad, entre outras...
Boa sorte campeões!',
'Torneios', 'Outubro 2026', 'images/torneios/Taca_etica.webp', now() - interval '2 days'),

('Rescaldo: Elite Legend Academy 7-8 Sporting Clube de Braga',
'Jogo com muitos golos, e incerteza até ao final do encontro!
Um início menos bom da nossa equipa, mas com uma grande resposta de qualidade e caráter na segunda parte!
Excelente treino para ambas as equipas!
Obrigado ao SC Braga pela disponibilidade.',
'Resultados', 'Setembro 2026', 'images/torneios/vsBRAGA-26.09.26.webp', now() - interval '3 days'),

('Campeões da Norte Cup — Sub 9',
'Estreia oficial dos nossos Sub 9 em Torneios!
Depois de uma fase de apuramento de grande nível, sem qualquer golo sofrido, os nossos craques venceram na final o SC Braga por 2x0.
Além do êxito coletivo, trouxemos também para casa todos os prémios individuais.
**Melhor Marcador** — Guilherme Maia
**Melhor Jogador** — Salvador Gonçalves
**Melhor Guarda-redes** — Miguel Nascimento',
'Torneios', 'Setembro 2026', 'images/torneios/NorteCUP Campeoes.webp', now() - interval '4 days'),

('O palco está montado.',
'É com muito orgulho que anunciamos que o **Complexo Desportivo de Vilar de Nantes** será a casa da Elite Legend Academy!
É neste relvado, com estas condições de excelência, que vamos potenciar os melhores talentos da região e preparar a nossa equipa para enfrentar os gigantes nos grandes torneios.
O projeto Elite Legend Academy está a ganhar forma e estamos quase prontos para dar o apito inicial.',
'Instalações', 'Julho 2026', 'images/campo.webp', now() - interval '5 days');
