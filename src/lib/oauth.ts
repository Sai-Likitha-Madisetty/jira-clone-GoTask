"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppwriteException, OAuthProvider } from "node-appwrite";

import { createAdminClient } from "@/lib/appwrite";

const getAppOrigin = () => {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configuredUrl) {
    const url = new URL(configuredUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("NEXT_PUBLIC_APP_URL must use HTTP or HTTPS");
    }

    return url.origin;
  }

  const requestOrigin = headers().get("origin");

  if (!requestOrigin) {
    throw new Error("Set NEXT_PUBLIC_APP_URL to the public application URL");
  }

  const url = new URL(requestOrigin);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("The request origin must use HTTP or HTTPS");
  }

  return url.origin;
};

const startOAuth = async (
  provider: OAuthProvider,
  returnTo: "/sign-in" | "/sign-up",
) => {
  const missingConfig = [
    "NEXT_PUBLIC_APPWRITE_ENDPOINT",
    "NEXT_PUBLIC_APPWRITE_PROJECT",
    "NEXT_APPWRITE_KEY",
  ].filter((key) => !process.env[key]?.trim());

  if (missingConfig.length > 0) {
    console.error("OAuth configuration is incomplete", { missingConfig });
    redirect(`${returnTo}?oauthError=config`);
  }

  let origin: string;

  try {
    origin = getAppOrigin();
  } catch (error) {
    console.error("OAuth application origin is unavailable", error);
    redirect(`${returnTo}?oauthError=origin`);
  }

  let redirectUrl: string;

  try {
    const { account } = await createAdminClient();

    redirectUrl = await account.createOAuth2Token(
      provider,
      `${origin}/oauth?returnTo=${encodeURIComponent(returnTo)}`,
      `${origin}${returnTo}?oauthError=provider`,
    );
  } catch (error) {
    if (error instanceof AppwriteException) {
      console.error("Appwrite rejected OAuth URL creation", {
        provider,
        code: error.code,
        type: error.type,
        message: error.message,
      });
      redirect(`${returnTo}?oauthError=appwrite`);
    }

    console.error("Failed to start OAuth sign-in", error);
    redirect(`${returnTo}?oauthError=start`);
  }

  if (!redirectUrl) {
    console.error("Appwrite returned an empty OAuth URL", { provider });
    redirect(`${returnTo}?oauthError=appwrite`);
  }

  redirect(redirectUrl);
};

export async function signUpWithGithub() {
  await startOAuth(OAuthProvider.Github, "/sign-up");
}

export async function signUpWithGoogle() {
  await startOAuth(OAuthProvider.Google, "/sign-up");
}

export async function signInWithGithub() {
  await startOAuth(OAuthProvider.Github, "/sign-in");
}

export async function signInWithGoogle() {
  await startOAuth(OAuthProvider.Google, "/sign-in");
}
