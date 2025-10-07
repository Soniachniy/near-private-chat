import React, { type JSX } from 'react';
import DOMPurify from 'dompurify';
import type { Token, Tokens } from 'marked';
import { lexer } from 'marked';
import CodeBlock from './CodeBlock';
import { copyToClipboard } from '@/lib';
import { toast } from 'sonner';
import KatexRenderer from './KatexRenderer';
import { unescapeHtml } from '@/lib/utils/markdown';
import Collapsible from '../../common/Collapsible';

interface MarkdownTokensProps {
	tokens: Token[];
	id: string;
	top?: boolean;
}

const MarkdownInlineTokens: React.FC<{ tokens?: Token[]; id: string }> = ({ tokens, id }) => {
	return (
		<>
			{tokens?.map((token, idx) => {
				const key = `${id}-${idx}`;

				if (token.type === 'escape') {
					return <span key={key}>{unescapeHtml(token.text)}</span>;
				}

				if (token.type === 'html') {
					const html = DOMPurify.sanitize(token.text);
					return <span key={key} dangerouslySetInnerHTML={{ __html: html }} />;
				}

				if (token.type === 'link') {
					return (
						<a key={key} href={token.href} target="_blank" rel="nofollow" title={token.title || ''}>
							{token.tokens ? (
								<MarkdownInlineTokens tokens={token.tokens} id={`${key}-a`} />
							) : (
								token.text
							)}
						</a>
					);
				}

				if (token.type === 'image') {
					return <img key={key} src={token.href} alt={token.text} className="max-w-full h-auto" />;
				}

				if (token.type === 'strong') {
					return (
						<strong key={key}>
							<MarkdownInlineTokens tokens={token.tokens} id={`${key}-strong`} />
						</strong>
					);
				}

				if (token.type === 'em') {
					return (
						<em key={key}>
							<MarkdownInlineTokens tokens={token.tokens} id={`${key}-em`} />
						</em>
					);
				}

				if (token.type === 'codespan') {
					return (
						<code
							key={key}
							onClick={() => {
								copyToClipboard(unescapeHtml(token.text));
								toast.success('Copied to clipboard');
							}}
							className="codespan cursor-pointer"
						>
							{unescapeHtml(token.text)}
						</code>
					);
				}

				if (token.type === 'br') {
					return <br key={key} />;
				}

				if (token.type === 'del') {
					return (
						<del key={key}>
							<MarkdownInlineTokens tokens={token.tokens} id={`${key}-del`} />
						</del>
					);
				}

				if (token.type === 'inlineKatex') {
					return <KatexRenderer key={key} content={token.text || ''} displayMode={false} />;
				}

				if (token.type === 'text') {
					return <span key={key}>{token.raw}</span>;
				}

				return null;
			})}
		</>
	);
};

const MarkdownTokens: React.FC<MarkdownTokensProps> = ({ tokens, id, top = false }) => {
	return (
		<>
			{tokens.map((token: Token, tokenIdx: number) => {
				const key = `${id}-${tokenIdx}`;

				if (token.type === 'hr') {
					return <hr key={key} className="border-gray-100 dark:border-gray-850" />;
				}

				if (token.type === 'heading') {
					const HeadingTag = `h${token.depth}` as keyof JSX.IntrinsicElements;
					return (
						<HeadingTag key={key} dir="auto">
							<MarkdownInlineTokens tokens={token.tokens} id={`${key}-h`} />
						</HeadingTag>
					);
				}

				if (token.type === 'code') {
					if (token.raw.includes('```')) {
						return <CodeBlock key={key} lang={token.lang || ''} code={token.text} />;
					} else {
						return <span key={key}>{token.text}</span>;
					}
				}

				if (token.type === 'table') {
					return (
						<div key={key} className="relative w-full group">
							<div className="scrollbar-hidden relative overflow-x-auto max-w-full rounded-lg">
								<table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 max-w-full rounded-xl">
									<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-850 dark:text-gray-400 border-none">
										<tr>
											{token.header.map((header: Tokens.TableCell, headerIdx: number) => (
												<th
													key={`${key}-header-${headerIdx}`}
													scope="col"
													className="px-3! py-1.5! border border-gray-100 dark:border-gray-850"
												>
													<MarkdownInlineTokens
														tokens={header.tokens}
														id={`${key}-header-${headerIdx}`}
													/>
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{token.rows.map((row: Tokens.TableCell[], rowIdx: number) => (
											<tr
												key={`${key}-row-${rowIdx}`}
												className="bg-white dark:bg-gray-900 dark:border-gray-850 text-xs"
											>
												{row?.map((cell: Tokens.TableCell, cellIdx: number) => (
													<td
														key={`${key}-row-${rowIdx}-${cellIdx}`}
														className="px-3! py-1.5! text-gray-900 dark:text-white border border-gray-100 dark:border-gray-850"
													>
														<MarkdownInlineTokens
															tokens={cell.tokens}
															id={`${key}-row-${rowIdx}-${cellIdx}`}
														/>
													</td>
												))}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					);
				}

				if (token.type === 'blockquote') {
					return (
						<blockquote
							key={key}
							dir="auto"
							className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic"
						>
							<MarkdownTokens tokens={token.tokens || []} id={`${key}-bq`} top={false} />
						</blockquote>
					);
				}

				if (token.type === 'list') {
					const ListTag = token.ordered ? 'ol' : 'ul';
					return (
						<ListTag key={key} dir="auto" start={token.start || 1}>
							{token.items.map((item: Tokens.ListItem, itemIdx: number) => (
								<li key={`${key}-${itemIdx}`} className="text-start">
									{item.task && (
										<input
											className="translate-y-[1px] -translate-x-1"
											type="checkbox"
											checked={item.checked}
											readOnly
										/>
									)}
									<MarkdownTokens tokens={item.tokens} id={`${key}-${itemIdx}`} top={token.loose} />
								</li>
							))}
						</ListTag>
					);
				}

				if (token.type === 'html') {
					const html = DOMPurify.sanitize(token.text);
					return <div key={key} dangerouslySetInnerHTML={{ __html: html }} />;
				}

				if (token.type === 'paragraph') {
					return (
						<p key={key} dir="auto">
							<MarkdownInlineTokens tokens={token.tokens || []} id={`${key}-p`} />
						</p>
					);
				}

				if (token.type === 'text') {
					if (top) {
						return (
							<p key={key}>
								{token.tokens ? (
									<MarkdownInlineTokens tokens={token.tokens} id={`${key}-t`} />
								) : (
									unescapeHtml(token.text)
								)}
							</p>
						);
					} else if (token.tokens) {
						return <MarkdownInlineTokens key={key} tokens={token.tokens} id={`${key}-t`} />;
					} else {
						return <span key={key}>{unescapeHtml(token.text)}</span>;
					}
				}

				if (token.type === 'space') {
					return <div key={key} className="my-2" />;
				}

				if (token.type === 'inlineKatex' || token.type === 'blockKatex') {
					return (
						<KatexRenderer
							key={key}
							content={token.text || ''}
							displayMode={token.displayMode || false}
						/>
					);
				}
				if (token.type === 'details') {
					const contentTokens = lexer(token.text || '');

					return (
						<Collapsible key={key} title={token.summary} className="w-full space-y-1 mb-1.5">
							<div className="mb-1.5">
								<MarkdownTokens tokens={contentTokens} id={`${key}-details`} top={false} />
							</div>
						</Collapsible>
					);
				}

				console.log('Unknown token', token);
				return null;
			})}
		</>
	);
};

export default MarkdownTokens;
