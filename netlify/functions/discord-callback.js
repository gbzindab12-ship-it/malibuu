exports.handler = async function handler(event) {
  const qs = event.queryStringParameters || {};
  const code = qs.code;
  const state = qs.state;

  if (!code) {
    return { statusCode: 400, body: "Code não recebido." };
  }

  const cookieHeader = event.headers.cookie || "";
  const cookies = Object.fromEntries(
    cookieHeader
      .split("; ")
      .filter(Boolean)
      .map((c) => c.split("="))
  );

  if (!state || state !== cookies.discord_state) {
    return { statusCode: 403, body: "State inválido." };
  }

  // Troca code por token
  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: String(code),
      redirect_uri: `${process.env.SITE_URL}/.netlify/functions/discord-callback`
    })
  });

  const token = await tokenRes.json();
  if (!tokenRes.ok) {
    return { statusCode: 400, body: JSON.stringify(token) };
  }

  // Pega usuário
  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token.access_token}` }
  });

  const user = await userRes.json();
  if (!userRes.ok) {
    return { statusCode: 400, body: JSON.stringify(user) };
  }

  const payload = Buffer.from(
    JSON.stringify({ id: user.id, username: user.username, avatar: user.avatar })
  ).toString("base64");

  return {
    statusCode: 302,
    headers: {
      Location: "/",
      // cookie não-HttpOnly para o front poder ler? aqui usamos endpoint /me, então pode ser HttpOnly.
      "Set-Cookie": `discord_user=${payload}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=604800`
    }
  };
};
