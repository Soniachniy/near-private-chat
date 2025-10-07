import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.min.css';
import CodeEditor from '@/components/common/CodeEditor';

interface CodeBlockProps {
	lang: string;
	code: string;
	className?: string;
	editable?: boolean;
	onSave?: (code: string) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ lang, code, className = 'my-2', onSave }) => {
	const [copied, setCopied] = useState(false);
	const [collapsed, setCollapsed] = useState(false);

	const [editedCode, setEditedCode] = useState(code);
	const [saved, setSaved] = useState(false);
	const codeRef = useRef<HTMLElement>(null);

	useEffect(() => {
		setEditedCode(code);
	}, [code]);

	useEffect(() => {
		if (codeRef.current && !collapsed) {
			codeRef.current.removeAttribute('data-highlighted');

			if (lang) {
				try {
					const language = hljs.getLanguage(lang) ? lang : 'plaintext';
					const highlighted = hljs.highlight(code, { language });
					codeRef.current.innerHTML = highlighted.value;
				} catch (error) {
					console.error('Highlight.js error:', error);
					codeRef.current.textContent = code;
				}
			} else {
				codeRef.current.textContent = code;
			}
		}
	}, [code, lang, collapsed]);

	const copyCode = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			toast.success('Copied to clipboard');
			setTimeout(() => setCopied(false), 1000);
		} catch (err) {
			console.error('Failed to copy to clipboard', err);
			toast.error('Failed to copy to clipboard');
		}
	};

	const toggleCollapse = () => {
		setCollapsed(!collapsed);
	};

	const handleSave = () => {
		if (onSave) {
			onSave(editedCode);
		}
		setSaved(true);

		toast.success('Code saved');
		setTimeout(() => setSaved(false), 1000);
	};

	const handleCodeChange = (value: string) => {
		setEditedCode(value);
	};

	const lineCount = code.split('\n').length;

	return (
		<div className={`relative ${className} flex flex-col rounded-lg`} dir="ltr">
			<div className="text-gray-500 dark:text-gray-400 absolute pl-4 py-1.5 text-xs font-medium">
				{lang || 'plaintext'}
			</div>

			<div className="sticky top-8 mb-1 py-1 pr-2.5 flex items-center justify-end z-10 text-xs">
				<div className="flex items-center gap-0.5 translate-y-[1px]">
					<button
						className="flex gap-1 items-center bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 transition rounded-md px-1.5 py-0.5"
						onClick={toggleCollapse}
						title={collapsed ? 'Expand' : 'Collapse'}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={2}
							stroke="currentColor"
							className="w-3 h-3"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
							/>
						</svg>
						<span>{collapsed ? 'Expand' : 'Collapse'}</span>
					</button>

					<button
						className="save-code-button bg-none border-none bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 transition rounded-md px-1.5 py-0.5"
						onClick={handleSave}
						title="Save"
					>
						<span>{saved ? 'Saved' : 'Save'}</span>
					</button>

					<button
						className="flex gap-1 items-center bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 transition rounded-md px-1.5 py-0.5"
						onClick={copyCode}
						title="Copy code"
					>
						{copied ? (
							<>
								<span>Copied</span>
							</>
						) : (
							<>
								<span>Copy</span>
							</>
						)}
					</button>
				</div>
			</div>

			<div
				className={`language-${lang} rounded-t-lg -mt-8 ${collapsed ? 'rounded-b-lg' : ''} overflow-hidden`}
			>
				<div className="pt-7 bg-gray-50 dark:bg-gray-850"></div>

				{!collapsed ? (
					<div className="bg-gray-50 dark:bg-gray-900 rounded-b-lg overflow-hidden">
						<CodeEditor
							id={`code-editor-${lang}-${Date.now()}`}
							value={editedCode}
							lang={lang}
							onChange={handleCodeChange}
							onSave={handleSave}
						/>
					</div>
				) : (
					<div className="bg-gray-50 dark:bg-black dark:text-white rounded-b-lg! pt-2 pb-2 px-4 flex flex-col gap-2 text-xs">
						<span className="text-gray-500 italic">{`${lineCount} hidden lines`}</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default CodeBlock;
