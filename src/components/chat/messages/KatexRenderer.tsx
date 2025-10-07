import katex from "katex";
import type React from "react";
import "katex/contrib/mhchem";
import "katex/dist/katex.min.css";

interface KatexRendererProps {
  content: string;
  displayMode?: boolean;
}

const KatexRenderer: React.FC<KatexRendererProps> = ({ content, displayMode = false }) => {
  const html = katex.renderToString(content, { displayMode, throwOnError: false });

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

export default KatexRenderer;
