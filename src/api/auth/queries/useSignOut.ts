import { useMutation } from "@tanstack/react-query";
import { authClient } from "../client";
import { useUserStore } from "@/stores/useUserStore";
import { useNavigate } from "react-router";
import { APP_ROUTES } from "@/pages/routes";

export const useSignOut = () => {
	const { setUser } = useUserStore();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: () => authClient.signOut(),
		onSuccess: () => {
			setUser(null);
			localStorage.removeItem('token');
			navigate(APP_ROUTES.AUTH);
		}
	});
};
