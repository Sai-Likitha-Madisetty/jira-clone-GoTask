import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AppwriteException } from "node-appwrite";

import { AUTH_COOKIE } from "@/features/auth/constants";

import { createAdminClient } from "@/lib/appwrite";

const getRedirectBaseUrl = (request: NextRequest) => {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configuredUrl) {
    return new URL(configuredUrl).origin;
  }

  const forwardedHost = request.headers.get("x-forwarded-host")?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.trim();

  if (forwardedHost) {
    const protocol =
      forwardedProto ||
      (request.nextUrl.protocol === "https:" ? "https" : "http");
    return `${protocol}://${forwardedHost}`;
  }

  return "http://3.26.155.14:3000";
};

export async function GET(request: NextRequest) {
  const baseUrl = getRedirectBaseUrl(request);
  const error = request.nextUrl.searchParams.get("error");
  const userId = request.nextUrl.searchParams.get("userId");
  const secret = request.nextUrl.searchParams.get("secret");
  const returnTo =
    request.nextUrl.searchParams.get("returnTo") === "/sign-up"
      ? "/sign-up"
      : "/sign-in";
  const failureUrl = new URL(`${returnTo}?oauthError=callback`, baseUrl);

  if (error || !userId || !secret) {
    return NextResponse.redirect(
      error
        ? new URL(`${returnTo}?oauthError=provider`, baseUrl)
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
      secure: baseUrl.startsWith("https://"),
      maxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.redirect(new URL("/", baseUrl));
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