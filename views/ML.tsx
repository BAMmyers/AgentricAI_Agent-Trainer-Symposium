

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Slider from '../components/Slider';
import { CubeTransparentIcon, BeakerIcon, ChartBarIcon, PlayIcon, PauseIcon, StopIcon, UploadIcon, GlobeAltIcon, InformationCircleIcon, XMarkIcon } from '../components/icons/Icons';
import LineChart from '../components/LineChart';

interface MLProps {
  isOffline: boolean;
}

type LearningMode = 'supervised' | 'unsupervised' | 'reinforcement';
type TrainingStatus = 'idle' | 'running' | 'paused' | 'complete';

const ML: React.FC<MLProps> = ({ isOffline }) => {
    const [mode, setMode] = useState<LearningMode>('supervised');
    const [temperature, setTemperature] = useState(0.7);
    const [epochs, setEpochs] = useState(10);
    const [learningRate, setLearningRate] = useState(0.001);
    const [weightDecay, setWeightDecay] = useState(0.01);

    const [status, setStatus] = useState<TrainingStatus>('idle');
    const [currentEpoch, setCurrentEpoch] = useState(0);
    const [lossData, setLossData] = useState<number[]>([]);
    const [accuracyData, setAccuracyData] = useState<number[]>([]);
    
    const [dataSource, setDataSource] = useState<{ type: 'file' | 'url' | null; content: File | string | null }>({ type: null, content: null });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const trainingInterval = useRef<number | null>(null);

    const stopTraining = useCallback((finalStatus: TrainingStatus = 'idle') => {
        if (trainingInterval.current) {
            clearInterval(trainingInterval.current);
            trainingInterval.current = null;
        }
        setStatus(finalStatus);
    }, []);

    const startTraining = () => {
        if (!dataSource.content) {
            alert("Please select a data source before starting the training.");
            return;
        }

        stopTraining(); 
        setCurrentEpoch(0);
        
        // Initial dummy data
        setLossData([1 + Math.random() * 0.5]);
        setAccuracyData([Math.random() * 0.3 + 0.1]);

        setStatus('running');

        trainingInterval.current = window.setInterval(() => {
            setCurrentEpoch(prev => {
                const nextEpoch = prev + 1;
                if (nextEpoch > epochs) {
                    stopTraining('complete');
                    return prev;
                }

                setLossData(prevData => {
                    const lastVal = prevData[prevData.length-1];
                    const newVal = Math.max(0.05, lastVal - (Math.random() * 0.1) - 0.02);
                    return [...prevData, newVal];
                });
                setAccuracyData(prevData => {
                    const lastVal = prevData[prevData.length-1];
                    const newVal = Math.min(0.98, lastVal + (Math.random() * 0.1) + 0.02);
                    return [...prevData, newVal];
                });

                return nextEpoch;
            });
        }, 1500);
    };

    const handleStartPause = () => {
        if (status === 'running') {
            stopTraining('paused');
        } else {
            startTraining();
        }
    };
    
    const handleStop = () => {
        stopTraining('idle');
        setCurrentEpoch(0);
        setLossData([]);
        setAccuracyData([]);
    }

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setDataSource({ type: 'file', content: file });
        }
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleWebScrapeClick = () => {
        const url = window.prompt("Please enter the HTTP address for web scraping:", "https://");
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            setDataSource({ type: 'url', content: url });
        } else if (url) {
            alert("Invalid URL. Please enter a full URL starting with http:// or https://");
        }
    };
    
    const clearDataSource = () => {
        setDataSource({ type: null, content: null });
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => stopTraining();
    }, [stopTraining]);

    const ModeButton: React.FC<{ value: LearningMode, label: string }> = ({ value, label }) => (
        <button 
            onClick={() => setMode(value)}
            disabled={status !== 'idle'}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${mode === value ? 'bg-primary text-white' : 'bg-overlay text-text-secondary hover:bg-opacity-80'}`}
        >
            {label}
        </button>
    );

  return (
    <div className="h-full w-full p-4 lg:p-6 grid grid-cols-12 gap-4 lg:gap-6 animate-fadeIn">
        {/* Left Column: Configuration */}
        <div className="col-span-12 lg:col-span-4 h-full">
            <div className="bg-surface p-6 rounded-xl shadow-lg border border-overlay h-full flex flex-col">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <h2 className="text-xl font-bold text-highlight mb-4">Training Configuration</h2>
                
                <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                    {/* Learning Mode */}
                    <div className="p-3 bg-overlay/50 rounded-lg">
                        <h3 className="font-semibold text-text-primary mb-3">Learning Mode</h3>
                        <div className="flex items-center gap-2">
                            <ModeButton value="supervised" label="Supervised" />
                            <ModeButton value="unsupervised" label="Unsupervised" />
                            <ModeButton value="reinforcement" label="Reinforcement" />
                        </div>
                    </div>

                    {/* Model Parameters */}
                    <div className="p-3 bg-overlay/50 rounded-lg">
                         <h3 className="font-semibold text-text-primary mb-4">Model Parameters</h3>
                         <div className="space-y-4">
                            <Slider label="Temperature" value={temperature} min={0} max={2} step={0.1} onChange={setTemperature} tooltip="Controls randomness in the model's output generation."/>
                            <Slider label="Epochs" value={epochs} min={1} max={100} step={1} onChange={setEpochs} tooltip="The number of complete passes through the training dataset."/>
                            <Slider label="Learning Rate" value={learningRate} min={0.0001} max={0.1} step={0.0001} onChange={setLearningRate} tooltip="Step size at each iteration while moving toward a minimum of a loss function."/>
                            <Slider label="Weight Decay" value={weightDecay} min={0} max={0.3} step={0.005} onChange={setWeightDecay} tooltip="A regularization technique to prevent overfitting by penalizing large weights."/>
                         </div>
                    </div>

                    {/* Data Source */}
                    <div className="p-3 bg-overlay/50 rounded-lg">
                        <h3 className="font-semibold text-text-primary mb-3">Data Source</h3>
                        <div className="grid grid-cols-2 gap-2">
                             <button onClick={handleUploadClick} disabled={status !== 'idle'} className="flex items-center justify-center gap-2 text-sm bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 disabled:bg-opacity-50">
                                <UploadIcon className="w-4 h-4" /> Upload Dataset
                            </button>
                             <button onClick={handleWebScrapeClick} disabled={status !== 'idle'} className="flex items-center justify-center gap-2 text-sm bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 disabled:bg-opacity-50">
                                <GlobeAltIcon className="w-4 h-4" /> Web Scrape
                            </button>
                        </div>
                        <div className="mt-3 pt-3 border-t border-overlay/50">
                            <h4 className="text-xs font-semibold text-text-secondary mb-1">Selected Source</h4>
                            {dataSource.type === null ? (
                                <p className="text-sm text-text-secondary italic">None</p>
                            ) : (
                                <div className="flex items-center justify-between p-2 bg-overlay rounded-lg animate-fadeIn">
                                    <div className="flex items-center gap-2 truncate">
                                        {dataSource.type === 'file' ? <UploadIcon className="w-4 h-4 text-highlight flex-shrink-0" /> : <GlobeAltIcon className="w-4 h-4 text-highlight flex-shrink-0" />}
                                        <p className="text-sm text-text-primary truncate" title={dataSource.type === 'file' ? (dataSource.content as File).name : dataSource.content as string}>
                                             {dataSource.type === 'file' ? (dataSource.content as File).name : (dataSource.content as string)}
                                        </p>
                                    </div>
                                    <button onClick={clearDataSource} disabled={status !== 'idle'} className="p-1 text-red-400 hover:text-red-300 disabled:opacity-50">
                                        <XMarkIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto pt-4 border-t border-overlay flex items-center gap-2">
                    <button onClick={handleStartPause} disabled={status === 'complete'} className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-80 disabled:bg-opacity-50 disabled:cursor-not-allowed transition-all">
                        {status === 'running' ? <PauseIcon /> : <PlayIcon />}
                        {status === 'idle' && 'Start Training'}
                        {status === 'running' && 'Pause Training'}
                        {status === 'paused' && 'Resume Training'}
                        {status === 'complete' && 'Training Complete'}
                    </button>
                    <button onClick={handleStop} disabled={status === 'idle'} className="flex-shrink-0 p-3 bg-red-600 text-white font-bold rounded-lg hover:bg-opacity-80 disabled:bg-opacity-50 disabled:cursor-not-allowed transition-all">
                        <StopIcon />
                    </button>
                </div>
            </div>
        </div>

        {/* Right Column: Monitoring */}
        <div className="col-span-12 lg:col-span-8 h-full">
             <div className="bg-surface p-6 rounded-xl shadow-lg border border-overlay h-full flex flex-col">
                <h2 className="text-xl font-bold text-highlight mb-4">Live Monitoring</h2>
                
                {status === 'idle' && (
                    <div className="flex-grow flex flex-col items-center justify-center text-center text-text-secondary">
                        <ChartBarIcon className="w-24 h-24 text-overlay"/>
                        <p className="mt-4">Configure your training session and click "Start Training" to begin the training run.</p>
                    </div>
                )}
                {status !== 'idle' && (
                    <div className="flex-grow grid grid-cols-1 grid-rows-3 gap-4">
                        <div className="row-span-2 grid grid-cols-2 gap-4">
                            <div className="bg-overlay/50 p-4 rounded-lg">
                                <h4 className="text-sm font-semibold text-text-secondary mb-2">Model Loss</h4>
                                <LineChart data={lossData} color="#e94560" />
                            </div>
                            <div className="bg-overlay/50 p-4 rounded-lg">
                                <h4 className="text-sm font-semibold text-text-secondary mb-2">Accuracy</h4>
                                <LineChart data={accuracyData} color="#c3aed6" />
                            </div>
                        </div>
                        <div className="row-span-1 bg-overlay/50 p-4 rounded-lg flex items-center justify-around text-center">
                            <div>
                                <p className="text-sm text-text-secondary">Status</p>
                                <p className={`text-2xl font-bold capitalize ${status === 'running' ? 'text-green-400 animate-pulse' : 'text-highlight'}`}>{status}</p>
                            </div>
                             <div>
                                <p className="text-sm text-text-secondary">Epoch</p>
                                <p className="text-2xl font-bold text-highlight">{currentEpoch} / {epochs}</p>
                            </div>
                             <div>
                                <p className="text-sm text-text-secondary">Current Loss</p>
                                <p className="text-2xl font-bold text-highlight">{lossData.length > 0 ? lossData[lossData.length-1].toFixed(4) : 'N/A'}</p>
                            </div>
                             <div>
                                <p className="text-sm text-text-secondary">Current Accuracy</p>
                                <p className="text-2xl font-bold text-highlight">{accuracyData.length > 0 ? (accuracyData[accuracyData.length-1]*100).toFixed(2) + '%' : 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                )}

             </div>
        </div>
    </div>
  );
};

export default ML;