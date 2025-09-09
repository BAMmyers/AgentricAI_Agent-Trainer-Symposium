

import React from 'react';

interface IconProps {
    className?: string;
    style?: React.CSSProperties;
}

const Icon: React.FC<React.PropsWithChildren<IconProps>> = ({ className = "w-6 h-6", children, style }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={style}>
            {children}
        </svg>
    );
};

export const PaperAirplaneIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></Icon>
);

export const ChipIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V5m0 14v-1m6-7h1M5 12H4m15 0a7 7 0 11-14 0 7 7 0 0114 0z" /></Icon>
);

export const InformationCircleIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>
);

export const UserCircleIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></Icon>
);

export const LightBulbIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></Icon>
);

export const ChatAltIcon: React.FC<IconProps> = ({ className="w-5 h-5" }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></Icon>
);

export const BeakerIcon: React.FC<IconProps> = ({ className="w-5 h-5" }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></Icon>
);

export const CalculatorIcon: React.FC<IconProps> = ({ className="w-5 h-5" }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></Icon>
);

export const CodeIcon: React.FC<IconProps> = ({ className="w-5 h-5" }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></Icon>
);

export const SparklesIcon: React.FC<IconProps> = ({ className="w-5 h-5" }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></Icon>
);

export const UploadIcon: React.FC<IconProps> = ({ className="w-5 h-5" }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></Icon>
);

export const DownloadIcon: React.FC<IconProps> = ({ className="w-5 h-5" }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></Icon>
);

export const DocumentTextIcon: React.FC<IconProps> = ({ className="w-5 h-5" }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></Icon>
);

export const CogIcon: React.FC<IconProps> = ({ className = "w-5 h-5", style }) => (
    <Icon className={className} style={style}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></Icon>
);

export const SpeakerWaveIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5 5 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></Icon>
);

export const EyeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></Icon>
);

export const PencilIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></Icon>
);

export const LightningBoltIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></Icon>
);

export const BrainIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 2.413a4.5 4.5 0 017.054 2.086 4.5 4.5 0 01-2.923 7.042c.502.43 1.04.805 1.61 1.116a4.5 4.5 0 01-1.42 8.204 4.5 4.5 0 01-5.74-2.834 4.5 4.5 0 013.435-6.07c-1.12-.663-2.336-1.13-3.64-1.285a4.5 4.5 0 01-2.977-6.275 4.5 4.5 0 016.59-1.99Z" />
    </Icon>
);

export const PlusIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></Icon>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></Icon>
);

export const IdentificationIcon: React.FC<IconProps> = ({ className="w-5 h-5" }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm.375 0a.375.375 0 01.375.375v2.25a.375.375 0 01-.375.375h-3a.375.375 0 01-.375-.375V9.75a.375.375 0 01.375-.375h.375z" /></Icon>
);

export const XMarkIcon: React.FC<IconProps> = ({ className="w-5 h-5" }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></Icon>
);

export const CheckIcon: React.FC<IconProps> = ({ className="w-5 h-5" }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></Icon>
);

export const ClipboardIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></Icon>
);

export const ShieldExclamationIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></Icon>
);

export const BrainCircuitIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 2.25H13.5V5.25H10.5V2.25Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 18.75H13.5V21.75H10.5V18.75Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 10.5H5.25V13.5H2.25V10.5Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M18.75 10.5H21.75V13.5H18.75V10.5Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 12a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 12h3.75" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12h3.75" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 5.25v3.75" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v3.75" /></Icon>
);

export const TrashIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></Icon>
);

export const VideoCameraIcon: React.FC<IconProps> = ({ className="w-5 h-5" }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" /></Icon>
);

export const ClockIcon: React.FC<IconProps> = ({ className="w-5 h-5" }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></Icon>
);

export const UserIcon: React.FC<IconProps> = ({ className="w-5 h-5" }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></Icon>
);

export const UsersIcon: React.FC<IconProps> = ({ className="w-5 h-5" }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM12 21a9.094 9.094 0 00-3.741-.479 3 3 0 004.682-2.72M6.344 16.071a9.094 9.094 0 01-3.741.479 3 3 0 01-4.682-2.72M12 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></Icon>
);

export const CubeTransparentIcon: React.FC<IconProps> = ({ className="w-6 h-6" }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></Icon>
);

export const PlayIcon: React.FC<IconProps> = ({ className="w-5 h-5" }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></Icon>
);

export const StopIcon: React.FC<IconProps> = ({ className="w-5 h-5" }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" /></Icon>
);

export const WifiSlashIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3.53 3.53l17.42 17.42M21 15.58a8.963 8.963 0 00-2.31-4.78M15.17 15.17c-.32.32-.67.6-1.04.84m-3.41 1.25c-.32.06-.65.1-1 .1a6.72 6.72 0 01-6.1-3.23M3 10.92a8.963 8.963 0 014.78-2.31M12 21a9.002 9.002 0 008.48-6.07" /></Icon>
);

export const PauseIcon: React.FC<IconProps> = ({ className="w-5 h-5" }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-6-13.5v13.5" /></Icon>
);

export const ChartBarIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></Icon>
);

export const PhotoIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></Icon>
);

export const GlobeAltIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21V3M4.22 9.029a9.004 9.004 0 0115.56 0M3 12.065a9.004 9.004 0 0018 0" /></Icon>
);

export const ClipboardDocumentListIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></Icon>
);

export const ExclamationTriangleIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></Icon>
);

export const WifiIcon: React.FC<IconProps> = ({ className }) => (
    <Icon className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5 5 0 017.424 0M5.636 12.386a9 9 0 0112.728 0M12 20.25h.008v.008H12v-.008z" /></Icon>
);