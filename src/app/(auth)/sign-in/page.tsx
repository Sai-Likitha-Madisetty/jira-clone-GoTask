import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";
import { SignInCard } from "@/features/auth/components/sign-in-card";

interface SignInPageProps {
  searchParams: { oauthError?: string | string[] };
}

const SignInPage = async ({ searchParams }: SignInPageProps) => {
  const user = await getCurrent();

  if (user) redirect("/");

  return <SignInCard oauthError={searchParams.oauthError} />
};
 
export default SignInPage;
