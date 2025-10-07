import { useMutation } from "@tanstack/react-query";
import { authClient } from "../client";

interface SignInParams {
	email: string;
	password: string;
}

export const useSignIn = () => {
	return useMutation({
		mutationFn: ({ email, password }: SignInParams) => 
			authClient.signIn(email, password)
	});
};
