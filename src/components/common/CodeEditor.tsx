import { acceptCompletion } from "@codemirror/autocomplete";
import { indentWithTab } from "@codemirror/commands";
import { indentUnit } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { Compartment, EditorState } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { keymap } from "@codemirror/view";
import { basicSetup, EditorView } from "codemirror";
import type React from "react";
import { useCallback, useEffect, useRef } from "react";

interface CodeEditorProps {
  id: string;
  value: string;
  lang?: string;
  onChange?: (value: string) => void;
  onSave?: () => void;
  placeholder?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, lang = "", onChange, onSave }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const editorThemeRef = useRef(new Compartment());
  const editorLanguageRef = useRef(new Compartment());
  const loadLanguage = useCallback(async (langName: string) => {
    if (!viewRef.current) return;

    try {
      const language = languages.find(
        (l) => l.alias.includes(langName.toLowerCase()) || l.name.toLowerCase() === langName.toLowerCase()
      );

      if (language) {
        const languageSupport = await language.load();
        if (viewRef.current && languageSupport) {
          viewRef.current.dispatch({
            effects: editorLanguageRef.current.reconfigure(languageSupport),
          });
        }
      }
    } catch (error) {
      console.error("Failed to load language:", error);
    }
  }, []);
  // Initialize editor
  useEffect(() => {
    if (!editorRef.current || viewRef.current) return;

    const isDarkMode = document.documentElement.classList.contains("dark");

    const extensions = [
      basicSetup,
      keymap.of([{ key: "Tab", run: acceptCompletion }, indentWithTab]),
      indentUnit.of("    "),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && onChange) {
          const newValue = update.state.doc.toString();
          onChange(newValue);
        }
      }),
      editorThemeRef.current.of(isDarkMode ? [oneDark] : []),
      editorLanguageRef.current.of([]),
    ];

    viewRef.current = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions,
      }),
      parent: editorRef.current,
    });

    // Set initial language
    if (lang) {
      loadLanguage(lang);
    }

    // Dark mode observer
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          const isDark = document.documentElement.classList.contains("dark");
          if (viewRef.current) {
            viewRef.current.dispatch({
              effects: editorThemeRef.current.reconfigure(isDark ? [oneDark] : []),
            });
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Keyboard shortcuts
    const keydownHandler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (onSave) onSave();
      }
    };

    document.addEventListener("keydown", keydownHandler);

    return () => {
      observer.disconnect();
      document.removeEventListener("keydown", keydownHandler);
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [lang, onChange, onSave, loadLanguage, value]);

  useEffect(() => {
    if (lang && viewRef.current) {
      loadLanguage(lang);
    }
  }, [lang, loadLanguage]);

  useEffect(() => {
    if (viewRef.current) {
      const currentValue = viewRef.current.state.doc.toString();
      if (currentValue !== value) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: value,
          },
        });
      }
    }
  }, [value]);

  return <div ref={editorRef} className="h-full w-full text-sm" />;
};

export default CodeEditor;
