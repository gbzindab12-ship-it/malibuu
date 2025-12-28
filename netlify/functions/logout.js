exports.handler = async function handler() {
  return {
    statusCode: 200,
    headers: {
      "Set-Cookie": [
        "discord_user=; Path=/; Max-Age=0; Secure; SameSite=Lax; HttpOnly",
        "discord_state=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax"
      ]
    },
    body: JSON.stringify({ ok: true })
  };
};
