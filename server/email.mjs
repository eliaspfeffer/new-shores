const clean=value=>typeof value==='string'?value.trim():'';

export function createEmailService(env=process.env,fetcher=fetch){
  const apiKey=clean(env.RESEND_API_KEY),from=clean(env.MAIL_FROM),origin=clean(env.APP_ORIGIN);
  const enabled=Boolean(apiKey&&from&&origin);
  async function send(to,subject,heading,copy,path,token){
    if(!enabled)return false;
    const url=new URL(path,origin);url.searchParams.set('token',token);
    const response=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},body:JSON.stringify({
      from,to:[to],subject,
      text:`${heading}\n\n${copy}\n\n${url}\n\nDer Link ist nur einmal nutzbar und läuft automatisch ab.`,
      html:`<div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;padding:28px;color:#51341f;background:#fff4d5;border:4px solid #89603a;border-radius:20px"><h1 style="font-family:Georgia,serif">${heading}</h1><p>${copy}</p><p><a style="display:inline-block;padding:12px 18px;border-radius:10px;background:#e1ad61;color:#402712;font-weight:700" href="${url}">Sicher fortfahren</a></p><p style="font-size:12px">Der Link ist nur einmal nutzbar und läuft automatisch ab.</p></div>`
    })});
    if(!response.ok)throw new Error('E-Mail-Dienst hat die Nachricht abgelehnt.');
    return true;
  }
  return {
    enabled,
    verify:(email,value)=>send(email,'E-Mail für New Shores bestätigen','Willkommen an den neuen Küsten','Bestätige deine E-Mail-Adresse, damit dein Spielkonto geschützt ist.','/?verify=1',value),
    reset:(email,value)=>send(email,'New-Shores-Passwort zurücksetzen','Neues Passwort setzen','Du hast das Zurücksetzen deines Passworts angefordert. Falls du das nicht warst, ignoriere diese Nachricht.','/?reset=1',value)
  };
}
