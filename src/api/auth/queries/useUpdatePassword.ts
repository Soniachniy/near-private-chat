import { useMutation } from "@tanstack/react-query";
import { authClient } from "../client";

interface UpdatePasswordParams {
	token: string;
	password: string;
	newPassword: string;
}

export const useUpdatePassword = () => {
	return useMutation({
		mutationFn: ({ token, password, newPassword }: UpdatePasswordParams) => 
			authClient.updatePassword(token, password, newPassword)
	});
};
