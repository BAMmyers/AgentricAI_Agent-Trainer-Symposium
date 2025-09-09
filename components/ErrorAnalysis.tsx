
import React, { useState } from 'react';
import { analyzeCodeError, isApiConfigured } from '../services/geminiService';
import { ExclamationTriangleIcon, SparklesIcon, CogIcon } from './icons/Icons';

interface ErrorAnalysisProps {
  error: Error;
  componentStack: string;
}

const ErrorAnalysis: React.FC<ErrorAnalysisProps> = ({ error, componentStack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{ explanation: string; suggestedFix: string } | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const apiReady = isApiConfigured();

  const handleAnalyze = async () => {
    setIsLoading(true);
    setAnalysis(null);
    setAnalysisError(null);
    try {
      const result = await analyzeCodeError(error, componentStack);
      setAnalysis(result);
    } catch (e) {
      setAnalysisError(e instanceof Error ? e.message : "An unknown error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const formattedStack = componentStack
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => line.trim())
    .join('\n');

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-base p-4 font-sans">
      <div className="bg-surface p-8 rounded-2xl shadow-2xl border border-overlay max-w-3xl w-full animate-fadeIn">
        <div className="text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-yellow-400 mx-auto" />
            <h1 className="text-3xl font-bold text-primary mt-4">An Unexpected Error Occurred</h1>
            <p className="text-text-secondary mt-2">
                The application has encountered a problem but has activated its self-healing protocol.
            </p>
        </div>

        <div className="mt-6 p-4 bg-overlay rounded-lg text-sm">
            <p className="font-semibold text-highlight">Error Message:</p>
            <p className="text-red-400 font-mono mt-1">{error.message}</p>
        </div>

        <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-text-secondary hover:text-white">
                Show Technical Details
            </summary>
            <pre className="mt-2 p-3 bg-overlay rounded-lg text-xs text-text-secondary whitespace-pre-wrap font-mono max-h-48 overflow-auto">
                <code>{formattedStack}</code>
            </pre>
        </details>

        <div className="mt-6 border-t border-overlay pt-6 space-y-4">
          {analysis ? (
            <div className="space-y-4 animate-fadeIn">
                <h3 className="font-semibold text-highlight flex items-center gap-2"><SparklesIcon/> AI Analysis Complete</h3>
                <div>
                    <h4 className="font-semibold text-text-primary">Explanation:</h4>
                    <p className="text-sm text-text-secondary mt-1">{analysis.explanation}</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-text-primary">Suggested Fix:</h4>
                    <div className="mt-2 p-3 bg-overlay rounded-lg text-xs text-text-secondary whitespace-pre-wrap font-mono">
                        <code>{analysis.suggestedFix}</code>
                    </div>
                </div>
            </div>
          ) : (
             <button 
                onClick={handleAnalyze} 
                disabled={isLoading || !apiReady}
                className="w-full flex items-center justify-center gap-3 bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-80 disabled:bg-opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                    <>
                        <CogIcon className="w-5 h-5 animate-spin" />
                        Analyzing Error...
                    </>
                ) : (
                    <>
                       <SparklesIcon className="w-5 h-5" />
                       Begin Self-Healing Analysis
                    </>
                )}
            </button>
          )}

          {!apiReady && !analysis && (
            <p className="text-xs text-yellow-400 text-center">Self-healing requires a valid API key to be configured.</p>
          )}

          {analysisError && (
             <p className="text-sm text-red-400 text-center">Analysis Failed: {analysisError}</p>
          )}

          <button onClick={() => window.location.reload()} className="w-full text-center text-sm text-text-secondary hover:text-white py-2">
            Reload Application
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorAnalysis;
