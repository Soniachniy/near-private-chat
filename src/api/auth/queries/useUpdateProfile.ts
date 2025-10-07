import { useMutation } from "@tanstack/react-query";
import { authClient } from "../client";

interface UpdateProfileParams {
  token: string;
  name: string;
  profileImageUrl: string;
}

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: ({ token, name, profileImageUrl }: UpdateProfileParams) =>
      authClient.updateProfile(token, name, profileImageUrl),
  });
};
