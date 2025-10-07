import type { OAuth2Provider, SessionUser } from '@/types';
import { ApiClient } from '@/api/base-client';

class AuthClient extends ApiClient {
	constructor() {
		super({
			apiPrefix: '/api/v1',
			defaultHeaders: {
				'Content-Type': 'application/json'
			},
			includeAuth: false
		});
	}

	async getSessionUser(): Promise<SessionUser> {
		const token = localStorage.getItem('token');

		if (!token) {
			throw new Error('No token found');
		}
		
		return this.get<SessionUser>('/auths/', {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
	}

	async signIn(email: string, password: string) {
		return this.post('/auths/signin', {
			email,
			password
		});
	}

	async signUp(name: string, email: string, password: string, profile_image_url: string) {
		return this.post('/auths/signup', {
			name,
			email,
			password,
			profile_image_url
		});
	}

	async signOut(): Promise<void> {
		await fetch(`${this.baseURL}/auths/signout`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (res) => {
				if (!res.ok) throw await res.json();
			})
			.catch((err) => {
				console.error(err);
				throw err.detail || err;
			});
	}

	async updateProfile(token: string, name: string, profileImageUrl: string) {
		return this.post('/auths/update/profile', {
			name,
			profile_image_url: profileImageUrl
		}, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
	}

	async updatePassword(token: string, password: string, newPassword: string) {
		return this.post('/auths/update/password', {
			password,
			new_password: newPassword
		}, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
	}

	oauth2SignIn(provider: OAuth2Provider) {
		window.location.href = `${this.baseURL}/oauth/${provider}/login`;
	}
}

export const authClient = new AuthClient();
