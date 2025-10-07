import { Check, ChevronDown } from 'lucide-react';
import { useChatStore } from '@/stores/useChatStore';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Model } from '@/types';

interface ModelSelectorItemProps {
	value: string;
	index: number;
	availableModels: Model[];
	onChange: (index: number, modelId: string) => void;
	onRemove: (index: number) => void;
	showRemove: boolean;
}

function ModelSelectorItem({
	value,
	index,
	availableModels,
	onChange,
	onRemove,
	showRemove
}: ModelSelectorItemProps) {
	const selectedModelObj = value ? availableModels.find((m) => m.id === value) : null;

	return (
		<div className="flex w-full max-w-fit">
			<div className="overflow-hidden w-full">
				<div className="mr-1 max-w-full">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								type="button"
								className="flex w-full px-3 items-center gap-1.5 py-1.5 rounded text-sm font-semibold dark:bg-[rgba(0,236,151,0.08)] dark:text-[rgba(0,236,151,1)] outline-hidden bg-transparent truncate"
								aria-label="Select a model"
							>
								<span className="font-normal text-xs opacity-50 self-end pb-[1px]">Model</span>
								{selectedModelObj ? selectedModelObj.name : 'Select a model'}
								<ChevronDown className="self-center ml-2 size-3" strokeWidth={2.5} />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-[32rem] max-w-[calc(100vw-1rem)] rounded-xl bg-white dark:bg-gray-875 dark:text-white shadow-lg ring-none border-none"
							align="start"
						>
							<div className="px-3 py-2 max-h-64 overflow-y-auto">
								{availableModels.length === 0 ? (
									<div className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-100">
										No results found
									</div>
								) : (
									availableModels.map((model) => {
										const isSelected = value === model.id;

										return (
											<DropdownMenuItem
												key={model.id}
												onClick={() => onChange(index, model.id)}
												className={cn(
													'flex flex-row w-full mb-1 text-left font-medium  select-none items-center rounded-button py-2 pl-3 pr-1.5 text-sm text-gray-700 dark:text-gray-100 outline-hidden transition-all duration-75 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer',
													isSelected && 'bg-gray-100 dark:bg-gray-800'
												)}
											>
												<div className="flex flex-col flex-1">
													<div className="flex items-center gap-2">
														<div className="flex items-center min-w-fit">
															<div className="mr-2 size-5 flex items-center justify-center">
																<img
																	src={model.info?.meta?.profile_image_url ?? '/static/favicon.png'}
																	alt="Model"
																	className="size-3.5"
																/>
															</div>
															<div className="line-clamp-1">{model.name}</div>
														</div>
													</div>
												</div>
												{isSelected && (
													<div className="ml-auto pl-2 pr-2 md:pr-0">
														<Check className="text-green-500 w-5 h-5" />
													</div>
												)}
											</DropdownMenuItem>
										);
									})
								)}
							</div>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{showRemove && (
				<div className="self-center mx-1 disabled:text-gray-600 disabled:hover:text-gray-600 -translate-y-[0.5px]">
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onRemove(index);
						}}
						aria-label="Remove Model"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth="2"
							stroke="currentColor"
							className="size-3"
						>
							<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
						</svg>
					</button>
				</div>
			)}
		</div>
	);
}

export default function ModelSelector() {
	const { models, selectedModels, setSelectedModels } = useChatStore();

	const handleModelChange = (index: number, modelId: string) => {
		const newModels = [...selectedModels];
		newModels[index] = modelId;
		setSelectedModels(newModels);
	};

	const handleAddModel = () => {
		if (selectedModels.length < models.length) {
			setSelectedModels([...selectedModels, '']);
		}
	};

	const handleRemoveModel = (index: number) => {
		if (selectedModels.length > 1) {
			const newModels = [...selectedModels];
			newModels.splice(index, 1);
			setSelectedModels(newModels);
		}
	};

	const getAvailableModelsForIndex = (currentIndex: number) => {
		const otherSelectedModels = selectedModels.filter((_, idx) => idx !== currentIndex);

		return models.filter((modelId) => !otherSelectedModels.includes(modelId.id));
	};

	const disabledAdd = selectedModels.length >= models.length;

	return (
		<div className="flex flex-col w-full items-start">
			{selectedModels.map((selectedModel, selectedModelIdx) => (
				<div key={selectedModelIdx} className="flex items-center w-full">
					<ModelSelectorItem
						value={selectedModel}
						index={selectedModelIdx}
						availableModels={getAvailableModelsForIndex(selectedModelIdx)}
						onChange={handleModelChange}
						onRemove={handleRemoveModel}
						showRemove={selectedModelIdx > 0}
					/>
					{selectedModelIdx === 0 && !disabledAdd && (
						<div className="self-center mx-1 disabled:text-gray-600 disabled:hover:text-gray-600 -translate-y-[0.5px]">
							<button
								type="button"
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									handleAddModel();
								}}
								aria-label="Add Model"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth="2"
									stroke="currentColor"
									className="size-3.5"
								>
									<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
								</svg>
							</button>
						</div>
					)}
				</div>
			))}
		</div>
	);
}
