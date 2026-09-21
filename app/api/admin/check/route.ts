import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "feedback_1dg_admin";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);

  if (session && session.value === "authenticated") {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
