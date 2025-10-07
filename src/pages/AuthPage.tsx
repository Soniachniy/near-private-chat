import React, { useState } from 'react';

import Spinner from '../components/common/Spinner';
import NearAIIcon from '@/assets/icons/near-icon-green.svg?react';
import CheckIcon from '@/assets/icons/check-icon.svg?react';
import GoogleIcon from '@/assets/icons/google-icon.svg?react';
import GitHubIcon from '@/assets/icons/github-icon.svg?react';
import { authClient } from '@/api/auth/client';
import type { OAuth2Provider } from '@/types';
import { useConfigStore } from '@/stores/useConfig';

const TERMS_VERSION = 'V1';

const AuthPage: React.FC = () => {
	const config = useConfigStore((state) => state.config);

	const [agreedTerms, setAgreedTerms] = useState(localStorage.getItem('agreedTerms') === TERMS_VERSION);

	const checkAgreeTerms = () => {
		if (!agreedTerms) {
			alert('You must agree to the Terms of Service and Privacy Policy to proceed.');
			return false;
		}
		return true;
	};

	const handleOAuthLogin = (provider: OAuth2Provider) => {
		if (!checkAgreeTerms()) return;
		authClient.oauth2SignIn(provider);
	};

	if (!config) {
		return (
			<div className="flex items-center justify-center h-full">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="relative">

			{/* Logo */}
			<div className="fixed m-10 z-50">
				<div className="flex space-x-2">
					<div className="self-center">
						<NearAIIcon className="w-6 h-6" />
					</div>
				</div>
			</div>

			<div className="fixed bg-transparent min-h-screen w-full flex justify-center font-primary z-50 text-black dark:text-white">
				<div className="w-full sm:max-w-md px-10 min-h-screen flex flex-col text-center">
					{/* Auto sign-in for trusted header or disabled auth */}
					{config.features?.auth_trusted_header || config.features?.auth === false ? (
						<div className="my-auto pb-10 w-full">
							<div className="flex items-center justify-center gap-3 text-xl sm:text-2xl text-center font-semibold dark:text-gray-200">
								<div>Signing in to {config.name}</div>
								<div>
									<Spinner />
								</div>
							</div>
						</div>
					) : (
						<div className="my-auto pb-10 w-full dark:text-gray-100">
								<div className="mb-1">
									<div className="text-2xl font-medium">
										Sign in to {config.name}
									</div>

									{config.onboarding && (
										<div className="mt-1 text-xs font-medium text-gray-500">
											ⓘ {config.name} does not make any external connections, and your data stays
											securely on your locally hosted server.
										</div>
									)}
								</div>
							{/* OAuth Providers */}

							<hr className="w-full h-px my-4 border-0 dark:bg-gray-100/10 bg-gray-700/10" />
							<div className="flex flex-col space-y-2">
								<button
									className="flex justify-center items-center bg-gray-700/5 hover:bg-gray-700/10 dark:bg-gray-100/5 dark:hover:bg-gray-100/10 dark:text-gray-300 dark:hover:text-white transition w-full rounded-full font-medium text-sm py-2.5"
									onClick={() => handleOAuthLogin('google')}
								>
									<GoogleIcon className="w-6 h-6 mr-3" />
									<span>Continue with Google</span>
								</button>
								<button
									className="flex justify-center items-center bg-gray-700/5 hover:bg-gray-700/10 dark:bg-gray-100/5 dark:hover:bg-gray-100/10 dark:text-gray-300 dark:hover:text-white transition w-full rounded-full font-medium text-sm py-2.5"
									onClick={() => handleOAuthLogin('github')}
								>
									<GitHubIcon className="w-6 h-6 mr-3" />
									<span>Continue with GitHub</span>
								</button>
							</div>

							{/* Terms and Privacy Checkbox */}
							<label className="text-xs  pt-10 flex items-start cursor-pointer">
								<input
									className="sr-only"
									type="checkbox"
									checked={agreedTerms}
									onChange={(e) => {
										setAgreedTerms(e.target.checked);
										localStorage.setItem('agreedTerms', e.target.checked ? TERMS_VERSION : 'false');
									}}
								/>
								<div
									className={`w-4 h-4 mt-0.5 ${agreedTerms ? 'bg-[#00EC97]' : 'bg-gray-50'} flex items-center justify-center shadow rounded`}
								>
									<CheckIcon
										className={`w-3 h-3 mt-[1px] transition-opacity ${agreedTerms ? 'opacity-100' : 'opacity-0'}`}
									/>
								</div>
								<div className="inline-block text-left ml-2 flex-1">
									{'By signing in, I agree to the '}
									<a className="underline" href="/terms">
										Terms of Service
									</a>
									{' and '}
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
