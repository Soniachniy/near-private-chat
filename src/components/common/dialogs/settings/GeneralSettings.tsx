import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useUserStore } from '@/stores/useUserStore';
import { getLanguages, changeLanguage } from '@/i18n';
import type { Settings } from '@/types';
import { SelectNative } from '@/components/ui/select-native';
import AdvancedParams from './AdvancedParams';
import { validateJSON } from '@/lib';
import { CycleParam, ParamControl, TextInput } from './ParamComponents';

interface Language {
	code: string;
	title: string;
}

const GeneralSettings = () => {
	const { t, i18n } = useTranslation("translation", { useSuspense: false });
	const { settings, setSettings } = useSettingsStore();
	const { user } = useUserStore();

	const [saved, setSaved] = useState(false);
	const [languages, setLanguages] = useState<Language[]>([]);
	const [lang, setLang] = useState(i18n.language || 'en-US');
	const [notificationEnabled, setNotificationEnabled] = useState(false);
	const [system, setSystem] = useState('');
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [requestFormat, setRequestFormat] = useState<string | null>(null);
	const [keepAlive, setKeepAlive] = useState<string | null>(null);
	const [params, setParams] = useState<NonNullable<Settings['params']>>({
		stream_response: null,
		function_calling: null,
		seed: null,
		temperature: null,
		reasoning_effort: null,
		logit_bias: null,
		frequency_penalty: null,
		presence_penalty: null,
		repeat_penalty: null,
		repeat_last_n: null,
		mirostat: null,
		mirostat_eta: null,
		mirostat_tau: null,
		top_k: null,
		top_p: null,
		min_p: null,
		stop: null,
		tfs_z: null,
		num_ctx: null,
		num_batch: null,
		num_keep: null,
		max_tokens: null,
		use_mmap: null,
		use_mlock: null,
		num_thread: null,
		num_gpu: null,
	});

	useEffect(() => {
		const loadLanguages = async () => {
			const langs = await getLanguages();
			setLanguages(langs);
		};
		loadLanguages();

		setNotificationEnabled(settings.notificationEnabled ?? false);
		setSystem(settings.system ?? '');

		let rf = settings.requestFormat ?? null;
		if (rf !== null && rf !== 'json') {
			rf = typeof rf === 'object' ? JSON.stringify(rf, null, 2) : String(rf);
		}
		setRequestFormat(rf);

		setKeepAlive(settings.keepAlive?.toString() ?? null);

		if (settings.params) {
			const settingsParams = settings.params;

			
			setParams((prevParams) => ({
				...prevParams,
				stream_response: settingsParams.stream_response ?? null,
				function_calling: settingsParams.function_calling ?? null,
				seed: settingsParams.seed ?? null,
				temperature: settingsParams.temperature ?? null,
				reasoning_effort: settingsParams.reasoning_effort ?? null,
				frequency_penalty: settingsParams.frequency_penalty ?? null,
				presence_penalty: settingsParams.presence_penalty ?? null,
				repeat_penalty: settingsParams.repeat_penalty ?? null,
				repeat_last_n: settingsParams.repeat_last_n ?? null,
				mirostat: settingsParams.mirostat ?? null,
				mirostat_eta: settingsParams.mirostat_eta ?? null,
				mirostat_tau: settingsParams.mirostat_tau ?? null,
				top_k: settingsParams.top_k ?? null,
				top_p: settingsParams.top_p ?? null,
				min_p: settingsParams.min_p ?? null,
				tfs_z: settingsParams.tfs_z ?? null,
				num_ctx: settingsParams.num_ctx ?? null,
				num_batch: settingsParams.num_batch ?? null,
				num_keep: settingsParams.num_keep ?? null,
				max_tokens: settingsParams.max_tokens ?? null,
				use_mmap: settingsParams.use_mmap ?? null,
				use_mlock: settingsParams.use_mlock ?? null,
				num_thread: settingsParams.num_thread ?? null,
				num_gpu: settingsParams.num_gpu ?? null,
				stop: settingsParams.stop ?? null,
				logit_bias: settingsParams.logit_bias ?? null,
			}));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const toggleNotification = async () => {
		const permission = await Notification.requestPermission();

		if (permission === 'granted') {
			const newValue = !notificationEnabled;
			setNotificationEnabled(newValue);
			setSettings({ notificationEnabled: newValue });
		} else {
			toast.error(
				t(
					'Response notifications cannot be activated as the website permissions have been denied. Please visit your browser settings to grant the necessary access.'
				)
			);
		}
	};

	const toggleRequestFormat = () => {
		const newFormat = requestFormat === null ? 'json' : null;
		setRequestFormat(newFormat);
	};

	const handleLanguageChange = (newLang: string) => {
		setLang(newLang);
		changeLanguage(newLang);
	};

	const handleSave = () => {
		let finalRequestFormat: Settings['requestFormat'] = requestFormat;

		if (finalRequestFormat !== null && finalRequestFormat !== 'json') {
			if (!validateJSON(finalRequestFormat as string)) {
				toast.error(t('Invalid JSON schema'));
				return;
			}
			finalRequestFormat = JSON.parse(finalRequestFormat as string);
		}

		setSettings({
			system: system !== '' ? system : undefined,
			params: {
				stream_response: params.stream_response !== null ? params.stream_response : undefined,
				function_calling: params.function_calling !== null ? params.function_calling : undefined,
				seed: params.seed !== null ? params.seed : undefined,
				stop: params.stop !== null ? params.stop : undefined,
				temperature: params.temperature !== null ? params.temperature : undefined,
				reasoning_effort: params.reasoning_effort !== null ? params.reasoning_effort : undefined,
				logit_bias: params.logit_bias !== null ? params.logit_bias : undefined,
				frequency_penalty: params.frequency_penalty !== null ? params.frequency_penalty : undefined,
				presence_penalty: params.presence_penalty !== null ? params.presence_penalty : undefined,
				repeat_penalty: params.repeat_penalty !== null ? params.repeat_penalty : undefined,
				repeat_last_n: params.repeat_last_n !== null ? params.repeat_last_n : undefined,
				mirostat: params.mirostat !== null ? params.mirostat : undefined,
				mirostat_eta: params.mirostat_eta !== null ? params.mirostat_eta : undefined,
				mirostat_tau: params.mirostat_tau !== null ? params.mirostat_tau : undefined,
				top_k: params.top_k !== null ? params.top_k : undefined,
				top_p: params.top_p !== null ? params.top_p : undefined,
				min_p: params.min_p !== null ? params.min_p : undefined,
				tfs_z: params.tfs_z !== null ? params.tfs_z : undefined,
				num_ctx: params.num_ctx !== null ? params.num_ctx : undefined,
				num_batch: params.num_batch !== null ? params.num_batch : undefined,
				num_keep: params.num_keep !== null ? params.num_keep : undefined,
				max_tokens: params.max_tokens !== null ? params.max_tokens : undefined,
				use_mmap: params.use_mmap !== null ? params.use_mmap : undefined,
				use_mlock: params.use_mlock !== null ? params.use_mlock : undefined,
				num_thread: params.num_thread !== null ? params.num_thread : undefined,
				num_gpu: params.num_gpu !== null ? params.num_gpu : undefined,
			},
			keepAlive: keepAlive ? (isNaN(Number(keepAlive)) ? keepAlive : parseInt(keepAlive)) : undefined,
			requestFormat: finalRequestFormat !== null ? finalRequestFormat : undefined,
		});

		toast.success(t('Settings saved successfully!'));
		setSaved(true);
		setTimeout(() => {
			setSaved(false);
		}, 2000);
	};

	const handleParamsChange = (newParams: NonNullable<Settings['params']>) => {
		setParams(newParams);
	};

	const isAdmin = user?.role === 'admin';
	const hasPermissions = user?.permissions?.chat;

	return (
		<div className="flex flex-col h-full justify-between text-sm">
			<div className="overflow-y-auto pr-2 max-h-[28rem] lg:max-h-full">
				<div>
					<div className="mb-1 text-sm font-medium">{t('WebUI Settings')}</div>

					{/* Language Selector */}
					<div className="flex w-full justify-between">
						<div className="self-center text-xs font-medium">{t('Language')}</div>
						<div className="flex items-center relative">
							<SelectNative
								className="w-fit pr-8 rounded-sm py-2 px-2 text-xs bg-transparent outline-none text-right"
								value={lang}
								onChange={(e) => handleLanguageChange(e.target.value)}
							>
								{languages.map((language) => (
									<option key={language.code} value={language.code}>
										{language.title}
									</option>
								))}
							</SelectNative>
						</div>
					</div>

					{/* Notifications Toggle */}
                    <CycleParam
                        label={t('Notifications')}
                        value={notificationEnabled ? t('On') : t('Off')}
                        onCycle={toggleNotification}
                    />
				</div>

				{/* Admin/Permission-based settings */}
				{(isAdmin || hasPermissions) && (
					<>
						<hr className="border-border my-3" />

						<div>
							<div className="my-2.5 text-sm font-medium">{t('System Prompt')}</div>
							<textarea
								value={system}
								onChange={(e) => setSystem(e.target.value)}
								className="w-full text-sm bg-white dark:text-gray-300 dark:bg-gray-900 outline-none resize-none rounded p-2 border border-gray-200 dark:border-gray-700"
								rows={4}
								placeholder={t('Enter system prompt here')}
							/>
						</div>

						<div className="mt-2 space-y-3 pr-1.5">
                            <CycleParam
                                label={t('Advanced Parameters')}
                                value={showAdvanced ? t('Hide') : t('Show')}
                                onCycle={() => setShowAdvanced(!showAdvanced)}
                            />

							{showAdvanced && (
								<>
									<AdvancedParams admin={isAdmin} params={params} onChange={handleParamsChange} />

									<hr className="border-border" />

									{/* Keep Alive */}
									<div className="w-full">
										<ParamControl
											label={t('Keep Alive')}
											tooltip="Control how long the model stays loaded in memory. Set to '5m' for 5 minutes, '1h' for 1 hour, or '-1' to keep loaded indefinitely."
											isCustom={keepAlive !== null}
											onToggle={() => setKeepAlive(keepAlive === null ? '5m' : null)}
										>
											<TextInput
												value={keepAlive || ''}
												onChange={(value) => setKeepAlive(value)}
												placeholder={t("e.g. '30s','10m'. Valid time units are 's', 'm', 'h'.")}
											/>
										</ParamControl>
									</div>

									{/* Request Format */}
									<div>
										<ParamControl
											label={t('Request Mode')}
											tooltip="Enable JSON mode to force the model to respond with valid JSON. You can also provide a JSON schema to constrain the response format."
											isCustom={requestFormat !== null}
											onToggle={toggleRequestFormat}
											customLabel={t('JSON')}
										>
											<div className="flex mt-0.5">
												<textarea
													className="w-full text-sm dark:text-gray-300 dark:bg-gray-900 outline-none rounded p-2 border border-gray-200 dark:border-gray-700"
													placeholder={t('e.g. "json" or a JSON schema')}
													value={requestFormat || ''}
													onChange={(e) => setRequestFormat(e.target.value)}
													rows={4}
												/>
											</div>
										</ParamControl>
									</div>
								</>
							)}
						</div>
					</>
				)}
			</div>

			{/* Save Button */}
			<div className="flex justify-end pt-3 text-sm font-medium">
				<button
					className="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full"
					onClick={handleSave}
				>
					{saved ? t('Saved') : t('Save')}
				</button>
			</div>
		</div>
	);
};

export default GeneralSettings;
