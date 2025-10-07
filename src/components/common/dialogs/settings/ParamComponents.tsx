import { Slider } from '@/components/ui/slider';
import { CompactTooltip } from '@/components/ui/tooltip';
import type { PropsWithChildren, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// Button component for toggle
export const ParamButton = ({ children, onClick }: PropsWithChildren & { onClick: () => void }) => {
	return (
		<button 
			className="p-1 px-3 text-xs flex rounded-sm transition hover:bg-gray-100 dark:hover:bg-gray-800" 
			onClick={onClick} 
			type="button"
		>
			{children}
		</button>
	);
};

// Base param control with tooltip and label
type ParamControlProps = PropsWithChildren & {
	label: string;
	tooltip: string;
	isCustom: boolean;
	onToggle: () => void;
	children?: ReactNode;
	customLabel?: string;
	defaultLabel?: string;
}

export const ParamControl = ({ 
	label, 
	tooltip, 
	isCustom, 
	onToggle, 
	children,
	customLabel,
	defaultLabel 
}: ParamControlProps) => {
	const { t } = useTranslation('translation', { useSuspense: false });

	return (
        <>
            <CompactTooltip content={tooltip}>
                <div className="flex w-full justify-between">
                    <div className="self-center text-xs font-medium">{label}</div>
                    <ParamButton onClick={onToggle}>
                        <span className="self-center">
                            {isCustom ? (customLabel || t('Custom')) : (defaultLabel || t('Default'))}
                        </span>
                    </ParamButton>
                </div>
            </CompactTooltip>
			{isCustom && children}
        </>
	);
};

// Range with number input
interface RangeInputProps {
	value: number;
	onChange: (value: number) => void;
	min: number | string;
	max: number | string;
	step: number | string;
	parse?: (value: string) => number;
}

export const RangeInput = ({ 
	value, 
	onChange, 
	min, 
	max, 
	step,
	parse = parseFloat 
}: RangeInputProps) => {
	return (
		<div className="flex mt-0.5 gap-2 items-center">
			<div className="flex-1">
				<Slider
					min={Number(min)}
					max={Number(max)}
					step={Number(step)}
					value={[value]}
                    onValueChange={(value) => onChange(value[0])}
					className="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
				/>
			</div>
			<div>
				<input
					value={value}
					onChange={(e) => onChange(e.target.value ? parse(e.target.value) : 0)}
					type="number"
					className="bg-transparent text-center w-16"
					min={min}
					max={max}
					step={step === 'any' ? 'any' : step}
				/>
			</div>
		</div>
	);
};

// Simple text input
interface TextInputProps<T = string | number> {
	value: T;
	onChange: (value: T) => void;
	placeholder?: string;
	type?: 'text' | 'number';
	min?: string;
	parse?: (value: string) => T;
}

export const TextInput = <T extends string | number = string | number>({ 
	value, 
	onChange, 
	placeholder = '', 
	type = 'text',
	min,
	parse 
}: TextInputProps<T>) => {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (parse && e.target.value) {
			onChange(parse(e.target.value));
		} else if (parse && !e.target.value && type === 'number') {
			onChange(0 as T);
		} else {
			onChange(e.target.value as T);
		}
	};

	return (
		<div className="flex mt-0.5">
			<input
				className="w-full rounded-lg py-2 px-4 text-sm dark:text-gray-300 dark:bg-gray-850 outline-none"
				type={type}
				placeholder={placeholder}
				value={value}
				onChange={handleChange}
				min={min}
			/>
		</div>
	);
};

// Toggle switch for boolean values
interface ToggleSwitchProps {
	value: boolean;
	onChange: (value: boolean) => void;
	enabledLabel?: string;
	disabledLabel?: string;
}

export const ToggleSwitch = ({ 
	value, 
	onChange,
	enabledLabel = 'Enabled',
	disabledLabel = 'Disabled'
}: ToggleSwitchProps) => {
	return (
		<div className="flex justify-between items-center mt-1">
			<div className="text-xs text-gray-500">
				{value ? enabledLabel : disabledLabel}
			</div>
			<div className="pr-2">
				<label className="relative inline-flex items-center cursor-pointer">
					<input
						type="checkbox"
						checked={value}
						onChange={(e) => onChange(e.target.checked)}
						className="sr-only peer"
					/>
					<div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
				</label>
			</div>
		</div>
	);
};

// Cycle button wrapper for multi-state params
interface CycleParamProps {
	label: string;
	tooltip?: string;
	value: string;
	onCycle: () => void;
}

export const CycleParam = ({ label, tooltip, value, onCycle }: CycleParamProps) => {
	const content = (
		<div className="py-0.5 flex w-full justify-between">
			<div className="self-center text-xs font-medium">{label}</div>
			<ParamButton onClick={onCycle}>
				<span className="self-center">{value}</span>
			</ParamButton>
		</div>
	);

	if (tooltip) {
		return <CompactTooltip content={tooltip}>{content}</CompactTooltip>;
	}

	return content;
};

