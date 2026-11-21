interface OAuthErrorMessageProps {
  error?: string | string[];
}

const errorMessages: Record<string, string> = {
  config: "OAuth server configuration is incomplete. Check NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT, and NEXT_APPWRITE_KEY in your environment, then restart the app.",
  origin: "The app's public URL could not be determined. Set NEXT_PUBLIC_APP_URL to your app origin (for example, http://localhost:3000) and add that domain as a platform in Appwrite.",
  appwrite: "Appwrite rejected the OAuth request. Check the Appwrite project and enabled Google/GitHub provider settings, then inspect the server log for the Appwrite error code.",
  start: "We couldn't start sign-in. Check the server log for the OAuth error and verify your Appwrite configuration.",
  provider: "The provider couldn't complete sign-in. Please try again or use email and password.",
  callback: "We couldn't finish creating your session. Please try again.",
};

export const OAuthErrorMessage = ({ error }: OAuthErrorMessageProps) => {
  const errorCode = Array.isArray(error) ? error[0] : error;
  const message = errorCode ? errorMessages[errorCode] : undefined;

  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      className="mx-7 mt-5 rounded-lg border border-navy/20 bg-champagne/10 px-4 py-3 text-sm leading-5 text-navy"
    >
      {message}
    </div>
  );
};
