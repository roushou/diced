function requireAuth(req: Request): string | Response {
  const authorization = req.headers.get("Authorization");
  if (!authorization) {
    return new Response("unauthorized", { status: 401 });
  }

  const parts = authorization.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return new Response("unauthorized", { status: 401 });
  }

  const token = parts[1];
  if (!token) {
    return new Response("unauthorized", { status: 401 });
  }

  return token;
}

export function withAuth(
  handler: (req: Request, token: string) => Response | Promise<Response>,
) {
  return (req: Request) => {
    const authResult = requireAuth(req);
    if (authResult instanceof Response) return authResult;
    return handler(req, authResult);
  };
}
