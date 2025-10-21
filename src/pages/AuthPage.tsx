import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { authClient } from "@/api/auth/client";
import { useConfig } from "@/api/config/queries";
import CheckIcon from "@/assets/icons/check-icon.svg?react";
import GitHubIcon from "@/assets/icons/github-icon.svg?react";
import GoogleIcon from "@/assets/icons/google-icon.svg?react";
import NearAIIcon from "@/assets/icons/near-icon-green.svg?react";
import type { OAuth2Provider } from "@/types";
import Spinner from "../components/common/Spinner";
import { APP_ROUTES } from "./routes";

const TERMS_VERSION = "V1";

const AuthPage: React.FC = () => {
  const { data: config } = useConfig();
  const [searchParams] = useSearchParams();
  console.log(searchParams.get("token"), "searchParams");
  const [agreedTerms, setAgreedTerms] = useState(localStorage.getItem("agreedTerms") === TERMS_VERSION);
  const navigate = useNavigate();
  const checkAgreeTerms = () => {
    if (!agreedTerms) {
      alert("You must agree to the Terms of Service and Privacy Policy to proceed.");
      return false;
    }
    return true;
  };

  const handleOAuthLogin = (provider: OAuth2Provider) => {
    if (!checkAgreeTerms()) return;
    authClient.oauth2SignIn(provider);
  };

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate(APP_ROUTES.HOME, { replace: true });
    }
  }, [searchParams]);

  if (!config) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="fixed z-50 m-10">
        <NearAIIcon className="h-6 w-6" />
      </div>

      <div className="flex justify-center bg-transparent font-primary text-black dark:text-white">
        <div className="flex min-h-screen flex-col px-10 sm:max-w-md">
          {config.features?.auth_trusted_header || config.features?.auth === false ? (
            <div className="my-auto w-full pb-10">
              <div className="flex items-center justify-center gap-3 text-center font-semibold text-xl sm:text-2xl dark:text-gray-200">
                <p className="text-center">Signing in to {config.name}</p>
                <div>
                  <Spinner />
                </div>
              </div>
            </div>
          ) : (
            <div className="my-auto w-full pb-10 dark:text-gray-100">
              <div className="mb-1">
                <p className="font-medium text-2xl">Sign in to {config.name}</p>

                {config.onboarding && (
                  <p className="mt-1 font-medium text-gray-500 text-xs">
                    ⓘ {config.name} does not make any external connections, and your data stays securely on your locally
                    hosted server.
                  </p>
                )}
              </div>

              <hr className="my-4 h-px w-full border-0 bg-gray-700/10 dark:bg-gray-100/10" />
              <div className="flex flex-col space-y-2">
                <button
                  className="flex w-full items-center justify-center rounded-full bg-gray-700/5 py-2.5 font-medium text-sm transition hover:bg-gray-700/10 dark:bg-gray-100/5 dark:text-gray-300 dark:hover:bg-gray-100/10 dark:hover:text-white"
                  onClick={() => handleOAuthLogin("google")}
                >
                  <GoogleIcon className="mr-3 h-6 w-6" />
                  <span>Continue with Google</span>
                </button>
                <button
                  className="flex w-full items-center justify-center rounded-full bg-gray-700/5 py-2.5 font-medium text-sm transition hover:bg-gray-700/10 dark:bg-gray-100/5 dark:text-gray-300 dark:hover:bg-gray-100/10 dark:hover:text-white"
                  onClick={() => handleOAuthLogin("github")}
                >
                  <GitHubIcon className="mr-3 h-6 w-6" />
                  <span>Continue with GitHub</span>
                </button>
              </div>

              <label className="flex cursor-pointer items-start pt-10 text-xs">
                <input
                  className="sr-only"
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => {
                    setAgreedTerms(e.target.checked);
                    localStorage.setItem("agreedTerms", e.target.checked ? TERMS_VERSION : "false");
                  }}
                />
                <div
                  className={`mt-0.5 h-4 w-4 ${
                    agreedTerms ? "bg-[#00EC97]" : "bg-gray-50"
                  } flex items-center justify-center rounded shadow`}
                >
                  <CheckIcon
                    className={`mt-[1px] h-3 w-3 transition-opacity ${agreedTerms ? "opacity-100" : "opacity-0"}`}
                  />
                </div>
                <div className="ml-2 inline-block flex-1 text-left">
                  {"By signing in, I agree to the "}
                  <a className="underline" href="/terms">
                    Terms of Service
                  </a>
                  {" and "}
                  <a className="underline" href="/privacy">
                    Privacy Policy
                  </a>
                  .
                </div>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
