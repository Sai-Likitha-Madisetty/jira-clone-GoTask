import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AppwriteException } from "node-appwrite";

import { AUTH_COOKIE } from "@/features/auth/constants";

import { createAdminClient } from "@/lib/appwrite";

export async function GET(request: NextRequest) {
  const error = request.nextUrl.searchParams.get("error");
  const userId = request.nextUrl.searchParams.get("userId");
  const secret = request.nextUrl.searchParams.get("secret");
  const returnTo =
    request.nextUrl.searchParams.get("returnTo") === "/sign-up"
      ? "/sign-up"
      : "/sign-in";
  const failureUrl = new URL(`${returnTo}?oauthError=callback`, request.url);

  if (error || !userId || !secret) {
    return NextResponse.redirect(
      error
        ? new URL(`${returnTo}?oauthError=provider`, request.url)
        : failureUrl,
    );
  }

  try {
    const { account } = await createAdminClient();
    const session = await account.createSession(userId, secret);

    cookies().set(AUTH_COOKIE, session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      maxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    if (error instanceof AppwriteException) {
      console.error("Failed to create an Appwrite session after OAuth", {
        code: error.code,
        type: error.type,
      });
    } else {
      console.error("Failed to create an Appwrite session after OAuth", error);
    }

    return NextResponse.redirect(failureUrl);
  }
}
