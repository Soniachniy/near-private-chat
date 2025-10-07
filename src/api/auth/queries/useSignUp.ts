import { useMutation } from "@tanstack/react-query";
import { authClient } from "../client";

interface SignUpParams {
  name: string;
  email: string;
  password: string;
  profile_image_url: string;
}

export const useSignUp = () => {
  return useMutation({
    mutationFn: ({ name, email, password, profile_image_url }: SignUpParams) =>
      authClient.signUp(name, email, password, profile_image_url),
  });
};
