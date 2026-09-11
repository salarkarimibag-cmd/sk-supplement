// TODO: integrate with ZarinPal using the `ZARINPAL_KEY` env var (see .env.local).
export async function POST(request: Request) {
  const body = await request.json();
  return Response.json(
    { message: "ZarinPal payment flow not implemented yet.", body },
    { status: 501 }
  );
}
