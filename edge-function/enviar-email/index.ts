import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const d = await req.json();

    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: Deno.env.get("SMTP_USER"),
        pass: Deno.env.get("SMTP_PASS"),
      },
    });

    if (d.tipo === "aprovacao") {
      // Aprovação da pré-inscrição — só o encarregado é notificado
      await transporter.sendMail({
        from: `"Elite Legend Academy" <${Deno.env.get("SMTP_USER")}>`,
        to: d.enc_email,
        subject: `Pré-Inscrição Aprovada — ${d.nome}`,
        html: gerarEmailAprovacao(d),
      });

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // 1 — Notificação interna
    await transporter.sendMail({
      from: `"Elite Legend Academy" <${Deno.env.get("SMTP_USER")}>`,
      to: Deno.env.get("SMTP_USER"),
      subject: `Nova Pré-Inscrição — ${d.nome}`,
      html: gerarEmailInterno(d),
    });

    // 2 — Confirmação ao encarregado de educação
    await transporter.sendMail({
      from: `"Elite Legend Academy" <${Deno.env.get("SMTP_USER")}>`,
      to: d.enc_email,
      subject: `Pré-Inscrição Recebida — ${d.nome}`,
      html: gerarEmailConfirmacao(d),
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});

function gerarEmailConfirmacao(r) {
  return `<!DOCTYPE html>
<html lang="pt">
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111111;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#C9A84C,#F2D06B);padding:36px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#000;opacity:.6;">Elite Legend Academy</p>
          <h1 style="margin:8px 0 4px;font-size:26px;font-weight:900;color:#000;">Pré-Inscrição Recebida</h1>
          <p style="margin:0;font-size:13px;color:#000;opacity:.65;">Formamos Atletas. Construímos Lendas.</p>
        </td>
      </tr>

      <!-- Mensagem -->
      <tr>
        <td style="padding:36px 40px 20px;">
          <p style="margin:0 0 16px;font-size:15px;color:#e8e8e8;line-height:1.7;">
            Caro/a <strong style="color:#C9A84C;">${r.enc_nome}</strong>,
          </p>
          <p style="margin:0 0 16px;font-size:15px;color:#888;line-height:1.7;">
            Confirmamos a receção da pré-inscrição do atleta <strong style="color:#e8e8e8;">${r.nome}</strong> na <strong style="color:#e8e8e8;">Elite Legend Academy</strong>.
          </p>
          <p style="margin:0 0 32px;font-size:15px;color:#888;line-height:1.7;">
            A nossa equipa técnica irá analisar o pedido e entrará em contacto consigo brevemente com todos os detalhes relativos à admissão. Agradecemos a confiança depositada no nosso projeto.
          </p>

          <!-- Divisor -->
          <div style="width:50px;height:2px;background:linear-gradient(90deg,#C9A84C,#F2D06B);margin:0 0 28px;border-radius:2px;"></div>

          <!-- Resumo do formulário -->
          <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;border-bottom:1px solid #2a2a2a;padding-bottom:8px;">Resumo da Pré-Inscrição</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
            <tr>
              <td width="50%" style="padding:8px 0;vertical-align:top;">
                <p style="margin:0;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:1px;">Atleta</p>
                <p style="margin:3px 0 0;font-size:14px;color:#e8e8e8;font-weight:600;">${r.nome}</p>
              </td>
              <td width="50%" style="padding:8px 0;vertical-align:top;">
                <p style="margin:0;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:1px;">Data de Nascimento</p>
                <p style="margin:3px 0 0;font-size:14px;color:#e8e8e8;font-weight:600;">${r.data_nasc}</p>
              </td>
            </tr>
            <tr>
              <td width="50%" style="padding:8px 0;vertical-align:top;">
                <p style="margin:0;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:1px;">Clube Atual</p>
                <p style="margin:3px 0 0;font-size:14px;color:#e8e8e8;font-weight:600;">${r.clube || '—'}</p>
              </td>
              <td width="50%" style="padding:8px 0;vertical-align:top;">
                <p style="margin:0;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:1px;">Encarregado</p>
                <p style="margin:3px 0 0;font-size:14px;color:#e8e8e8;font-weight:600;">${r.enc_nome}</p>
              </td>
            </tr>
            <tr>
              <td width="50%" style="padding:8px 0;vertical-align:top;">
                <p style="margin:0;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:1px;">Autoriza Imagens</p>
                <p style="margin:3px 0 0;font-size:14px;color:#e8e8e8;font-weight:600;">${r.auth_imagens}</p>
              </td>
              <td width="50%" style="padding:8px 0;vertical-align:top;">
                <p style="margin:0;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:1px;">Autoriza Publicidade</p>
                <p style="margin:3px 0 0;font-size:14px;color:#e8e8e8;font-weight:600;">${r.auth_publicidade}</p>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding:8px 0;vertical-align:top;">
                <p style="margin:0;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:1px;">Aceita Política de Privacidade</p>
                <p style="margin:3px 0 0;font-size:14px;color:#e8e8e8;font-weight:600;">${r.aceita_privacidade}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#0f0f0f;padding:24px 40px;text-align:center;border-top:1px solid #2a2a2a;">
          <p style="margin:0 0 6px;font-size:12px;color:#444;font-weight:700;letter-spacing:1px;"><a href="mailto:geral@elitelegendacademy.com" style="color:#444;text-decoration:none;">geral@elitelegendacademy.com</a></p>
          <p style="margin:0;font-size:11px;color:#444;">© 2026 Elite Legend Academy · Todos os direitos reservados</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function gerarEmailAprovacao(r) {
  return `<!DOCTYPE html>
<html lang="pt">
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111111;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#C9A84C,#F2D06B);padding:40px;text-align:center;">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#000;opacity:.6;">Elite Legend Academy</p>
          <h1 style="margin:10px 0 4px;font-size:30px;font-weight:900;color:#000;">Parabéns!</h1>
          <p style="margin:0;font-size:14px;color:#000;opacity:.7;">A pré-inscrição foi aprovada</p>
        </td>
      </tr>

      <!-- Mensagem -->
      <tr>
        <td style="padding:36px 40px 20px;">
          <p style="margin:0 0 16px;font-size:15px;color:#e8e8e8;line-height:1.7;">
            Caro/a <strong style="color:#C9A84C;">${r.enc_nome}</strong>,
          </p>
          <p style="margin:0 0 16px;font-size:15px;color:#888;line-height:1.7;">
            Temos o prazer de informar que a pré-inscrição do atleta <strong style="color:#e8e8e8;">${r.nome}</strong> foi <strong style="color:#C9A84C;">aprovada</strong> pela nossa equipa técnica. Bem-vindo/a à <strong style="color:#e8e8e8;">Elite Legend Academy</strong>!
          </p>
          <p style="margin:0 0 32px;font-size:15px;color:#888;line-height:1.7;">
            Em breve entraremos em contacto consigo com todos os detalhes relativos ao início da atividade. Estamos muito satisfeitos por o/a receber no nosso projeto.
          </p>

          <!-- Divisor -->
          <div style="width:50px;height:2px;background:linear-gradient(90deg,#C9A84C,#F2D06B);margin:0 0 28px;border-radius:2px;"></div>

          <p style="margin:0;font-size:13px;color:#555;line-height:1.6;font-style:italic;">
            Formamos Atletas. Construímos Lendas.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#0f0f0f;padding:24px 40px;text-align:center;border-top:1px solid #2a2a2a;">
          <p style="margin:0 0 6px;font-size:12px;color:#444;font-weight:700;letter-spacing:1px;"><a href="mailto:geral@elitelegendacademy.com" style="color:#444;text-decoration:none;">geral@elitelegendacademy.com</a></p>
          <p style="margin:0;font-size:11px;color:#444;">© 2026 Elite Legend Academy · Todos os direitos reservados</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function gerarEmailInterno(r) {
  return `<!DOCTYPE html>
<html lang="pt">
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111111;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">
      <tr>
        <td style="background:linear-gradient(135deg,#C9A84C,#F2D06B);padding:32px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#000;opacity:.6;">Elite Legend Academy</p>
          <h1 style="margin:8px 0 0;font-size:24px;font-weight:900;color:#000;">Nova Pré-Inscrição Recebida</h1>
        </td>
      </tr>
      <tr><td style="padding:32px 40px;">

        <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;border-bottom:1px solid #2a2a2a;padding-bottom:8px;">Dados do Atleta</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
          <tr>
            <td width="50%" style="padding:8px 0;vertical-align:top;">
              <p style="margin:0;font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;">Nome</p>
              <p style="margin:3px 0 0;font-size:14px;color:#e8e8e8;font-weight:600;">${r.nome}</p>
            </td>
            <td width="50%" style="padding:8px 0;vertical-align:top;">
              <p style="margin:0;font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;">Data de Nascimento</p>
              <p style="margin:3px 0 0;font-size:14px;color:#e8e8e8;font-weight:600;">${r.data_nasc}</p>
            </td>
          </tr>
          <tr>
            <td width="50%" style="padding:8px 0;vertical-align:top;">
              <p style="margin:0;font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;">Número de BI</p>
              <p style="margin:3px 0 0;font-size:14px;color:#e8e8e8;font-weight:600;">${r.num_bi}</p>
            </td>
            <td width="50%" style="padding:8px 0;vertical-align:top;">
              <p style="margin:0;font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;">Número de Contribuinte</p>
              <p style="margin:3px 0 0;font-size:14px;color:#e8e8e8;font-weight:600;">${r.num_contrib}</p>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding:8px 0;vertical-align:top;">
              <p style="margin:0;font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;">Clube Atual</p>
              <p style="margin:3px 0 0;font-size:14px;color:#e8e8e8;font-weight:600;">${r.clube || '—'}</p>
            </td>
          </tr>
        </table>

        <p style="margin:24px 0 6px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;border-bottom:1px solid #2a2a2a;padding-bottom:8px;">Autorizações</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
          <tr>
            <td width="50%" style="padding:8px 0;vertical-align:top;">
              <p style="margin:0;font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;">Imagens e Vídeos</p>
              <p style="margin:3px 0 0;font-size:14px;color:#e8e8e8;font-weight:600;">${r.auth_imagens}</p>
            </td>
            <td width="50%" style="padding:8px 0;vertical-align:top;">
              <p style="margin:0;font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;">Publicidade nos Equipamentos</p>
              <p style="margin:3px 0 0;font-size:14px;color:#e8e8e8;font-weight:600;">${r.auth_publicidade}</p>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding:8px 0;vertical-align:top;">
              <p style="margin:0;font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;">Aceita Política de Privacidade</p>
              <p style="margin:3px 0 0;font-size:14px;color:#e8e8e8;font-weight:600;">${r.aceita_privacidade}</p>
            </td>
          </tr>
        </table>

        <p style="margin:24px 0 6px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;border-bottom:1px solid #2a2a2a;padding-bottom:8px;">Encarregado de Educação</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
          <tr>
            <td colspan="2" style="padding:8px 0;vertical-align:top;">
              <p style="margin:0;font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;">Nome</p>
              <p style="margin:3px 0 0;font-size:14px;color:#e8e8e8;font-weight:600;">${r.enc_nome}</p>
            </td>
          </tr>
          <tr>
            <td width="50%" style="padding:8px 0;vertical-align:top;">
              <p style="margin:0;font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;">Telemóvel</p>
              <p style="margin:3px 0 0;font-size:14px;color:#e8e8e8;font-weight:600;">${r.enc_tlm}</p>
            </td>
            <td width="50%" style="padding:8px 0;vertical-align:top;">
              <p style="margin:0;font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;">E-mail</p>
              <p style="margin:3px 0 0;font-size:14px;color:#e8e8e8;font-weight:600;"><a href="mailto:${r.enc_email}" style="color:#e8e8e8;text-decoration:none;">${r.enc_email}</a></p>
            </td>
          </tr>
        </table>

      </td></tr>
      <tr>
        <td style="background:#0f0f0f;padding:20px 40px;text-align:center;border-top:1px solid #2a2a2a;">
          <p style="margin:0;font-size:11px;color:#555;">© 2026 Elite Legend Academy · Formamos Atletas. Construímos Lendas.</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
