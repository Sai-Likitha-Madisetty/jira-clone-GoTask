import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";
import { SignUpCard } from "@/features/auth/components/sign-up-card";

interface SignUpPageProps {
  searchParams: { oauthError?: string | string[] };
}

const SignUpPage = async ({ searchParams }: SignUpPageProps) => {
  const user = await getCurrent();

  if (user) redirect("/");

  return <SignUpCard oauthError={searchParams.oauthError} />
};
 
export default SignUpPage;
