import { useState, useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Minus, Square, X } from 'lucide-react';

export function TitleBar() {
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        const checkMaximized = async () => {
            try {
                const appWindow = getCurrentWindow();
                const maximized = await appWindow.isMaximized();
                setIsMaximized(maximized);
            } catch (e) {
                // Not in Tauri environment
                console.log('Not in Tauri environment');
            }
        };
        checkMaximized();
    }, []);

    const handleMinimize = async () => {
        try {
            const appWindow = getCurrentWindow();
            await appWindow.minimize();
        } catch (e) {
            console.error('Minimize failed:', e);
        }
    };

    const handleMaximize = async () => {
        try {
            const appWindow = getCurrentWindow();
            await appWindow.toggleMaximize();
            setIsMaximized(!isMaximized);
        } catch (e) {
            console.error('Maximize failed:', e);
        }
    };

    const handleClose = async () => {
        try {
            const appWindow = getCurrentWindow();
            await appWindow.close();
        } catch (e) {
            console.error('Close failed:', e);
        }
    };

    return (
        <div className="title-bar" data-tauri-drag-region>
            <div className="title-bar-title" data-tauri-drag-region>
                VerbaMind
            </div>
            <div className="title-bar-buttons">
                <button
                    className="title-bar-btn minimize"
                    onClick={handleMinimize}
                    title="Minimize"
                >
                    <Minus size={14} />
                </button>
                <button
                    className="title-bar-btn maximize"
                    onClick={handleMaximize}
                    title={isMaximized ? "Restore" : "Maximize"}
                >
                    <Square size={12} />
                </button>
                <button
                    className="title-bar-btn close"
                    onClick={handleClose}
                    title="Close"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
