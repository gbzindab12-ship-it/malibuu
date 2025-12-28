exports.handler = async function handler(event) {
  const cookieHeader = event.headers.cookie || "";
  const cookies = Object.fromEntries(
    cookieHeader
      .split("; ")
      .filter(Boolean)
      .map((c) => c.split("="))
  );

  if (!cookies.discord_user) {
    return { statusCode: 200, body: JSON.stringify({ logged: false }) };
  }

  try {
    const user = JSON.parse(Buffer.from(cookies.discord_user, "base64").toString());
    return { statusCode: 200, body: JSON.stringify({ logged: true, user }) };
  } catch {
    return { statusCode: 200, body: JSON.stringify({ logged: false }) };
  }
};
