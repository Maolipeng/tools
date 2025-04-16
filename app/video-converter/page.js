'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(2) + ' KB';
    } else {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
}

export default function VideoConverter() {
    const [selectedFormat, setSelectedFormat] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [isConverting, setIsConverting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [fileName, setFileName] = useState('');
    const [fileSize, setFileSize] = useState('');
    const [error, setError] = useState(null);
    const [downloadUrl, setDownloadUrl] = useState(null);
    
    // 高级配置选项
    const [resolution, setResolution] = useState('1080p');
    const [bitrate, setBitrate] = useState('2000k');
    const [framerate, setFramerate] = useState('30');
    const [audioQuality, setAudioQuality] = useState('192k');
    
    const resolutionOptions = [
        { label: '1080p (1920x1080)', value: '1080p' },
        { label: '720p (1280x720)', value: '720p' },
        { label: '480p (854x480)', value: '480p' },
        { label: '360p (640x360)', value: '360p' }
    ];
    
    const bitrateOptions = [
        { label: '高质量 (4000k)', value: '4000k' },
        { label: '标准 (2000k)', value: '2000k' },
        { label: '压缩 (1000k)', value: '1000k' }
    ];
    
    const framerateOptions = [
        { label: '60 fps', value: '60' },
        { label: '30 fps', value: '30' },
        { label: '24 fps', value: '24' }
    ];
    
    const audioQualityOptions = [
        { label: '高质量 (320k)', value: '320k' },
        { label: '标准 (192k)', value: '192k' },
        { label: '压缩 (128k)', value: '128k' }
    ];

    const fileInputRef = useRef(null);
    const uploadAreaRef = useRef(null);

    const resetState = () => {
        setUploadedFile(null);
        setSelectedFormat(null);
        setFileName('');
        setFileSize('');
        setIsComplete(false);
        setIsConverting(false);
        setProgress(0);
        setError(null);
        setDownloadUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileSelected = (file) => {
        if (!file) return;
        if (!file.type.startsWith('video/')) {
            alert('请上传视频文件');
            return;
        }
        if (file.size > 100 * 1024 * 1024) { // Keep 100MB limit for now
            alert('文件大小不能超过100MB');
            return;
        }

        // Reset state before setting new file
        resetState();

        setUploadedFile(file);
        setFileName(file.name);
        setFileSize(formatFileSize(file.size));
    };

    const handleUploadAreaClick = () => {
        fileInputRef.current.click();
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        if (uploadAreaRef.current) {
            uploadAreaRef.current.style.borderColor = '#4a6ee0';
            uploadAreaRef.current.style.backgroundColor = '#f5f7fd';
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        if (uploadAreaRef.current) {
            uploadAreaRef.current.style.borderColor = '#d1d8e6';
            uploadAreaRef.current.style.backgroundColor = 'transparent';
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (uploadAreaRef.current) {
            uploadAreaRef.current.style.borderColor = '#d1d8e6';
            uploadAreaRef.current.style.backgroundColor = 'transparent';
        }
        if (e.dataTransfer.files.length > 0) {
            handleFileSelected(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            handleFileSelected(e.target.files[0]);
        }
    };

    const handleFormatSelect = (format) => {
        setSelectedFormat(format);
        // Reset conversion status if format changes after completion
        if (isComplete) {
            setIsComplete(false);
            setDownloadUrl(null);
            setError(null);
            setProgress(0);
        }
    };

    const handleConvertClick = async () => {
        if (!uploadedFile || !selectedFormat || isConverting) return;

        setIsConverting(true);
        setIsComplete(false);
        setError(null);
        setDownloadUrl(null);
        setProgress(0); // Reset progress before starting

        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('format', selectedFormat);
        formData.append('resolution', resolution);
        formData.append('bitrate', bitrate);
        formData.append('framerate', framerate);
        formData.append('audioQuality', audioQuality);

        try {
            // Simulate some initial progress
            setProgress(10);

            const response = await fetch('/api/convert-video', {
                method: 'POST',
                body: formData,
            });

            // Simulate remaining progress
            setProgress(70);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            setProgress(100);
            setDownloadUrl(result.downloadUrl);
            setIsComplete(true);
        } catch (err) {
            console.error('Conversion failed:', err);
            setError(err.message || '转换失败，请稍后重试。');
            setProgress(0); // Reset progress on error
        } finally {
            setIsConverting(false);
        }
    };

    const handleDownloadClick = () => {
        if (!downloadUrl) return;

        const link = document.createElement('a');
        link.href = downloadUrl;
        // Extract filename from URL or create a generic one
        const filename = downloadUrl.substring(downloadUrl.lastIndexOf('/') + 1);
        link.download = filename || `converted_video.${selectedFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Optionally reset state after download
        // resetState();
    };

    const canConvert = uploadedFile && selectedFormat && !isConverting;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>在线视频转换工具</h1>
                <p className={styles.subtitle}>轻松转换视频格式，无需安装软件</p>
            </header>

            <div className={styles.converterBox}>
                <div className={styles.step}>
                    <h2><span className={styles.stepNumber}>1</span>上传视频文件</h2>
                    <div
                        ref={uploadAreaRef}
                        className={`${styles.uploadArea} ${uploadedFile ? styles.fileUploaded : ''}`}
                        onClick={handleUploadAreaClick}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {!uploadedFile && (
                            <>
                                <div className={styles.uploadIcon}>⬆️</div>
                                <p className={styles.uploadText}>点击或拖放视频文件到这里</p>
                                <p className={styles.uploadHint}>支持MP4, AVI, MOV, WMV等格式，最大100MB</p>
                            </>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="video/*"
                            style={{ display: 'none' }}
                        />
                    </div>
                    {fileName && (
                        <p className={styles.selectedFile}>{`已选择: ${fileName} (${fileSize})`}</p>
                    )}
                </div>

                <div className={styles.step}>
                    <h2><span className={styles.stepNumber}>2</span>选择输出格式</h2>
                    <div className={styles.formatGrid}>
                        {['mp4', 'webm', 'mov', 'avi', 'mkv', 'gif'].map((format) => (
                            <div
                                key={format}
                                className={`${styles.formatOption} ${selectedFormat === format ? styles.selected : ''}`}
                                onClick={() => handleFormatSelect(format)}
                                data-format={format}
                            >
                                <div className={styles.formatIcon}>
                                    {format === 'mp4' ? '🎬' : format === 'webm' ? '🌐' : format === 'mov' ? '🎥' : format === 'avi' ? '📼' : format === 'mkv' ? '🎞️' : '🖼️'}
                                </div>
                                <div className={styles.formatName}>{format.toUpperCase()}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.step}>
                    <h2><span className={styles.stepNumber}>3</span>高级配置</h2>
                    <div className={styles.advancedSettings}>
                        <div className={styles.settingGroup}>
                            <label>分辨率:</label>
                            <select value={resolution} onChange={(e) => setResolution(e.target.value)}>
                                {resolutionOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.settingGroup}>
                            <label>视频比特率:</label>
                            <select value={bitrate} onChange={(e) => setBitrate(e.target.value)}>
                                {bitrateOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.settingGroup}>
                            <label>帧率:</label>
                            <select value={framerate} onChange={(e) => setFramerate(e.target.value)}>
                                {framerateOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.settingGroup}>
                            <label>音频质量:</label>
                            <select value={audioQuality} onChange={(e) => setAudioQuality(e.target.value)}>
                                {audioQualityOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className={styles.step}>
                    <h2><span className={styles.stepNumber}>4</span>开始转换</h2>
                    <button
                        className={styles.convertButton}
                        onClick={handleConvertClick}
                        disabled={!canConvert || isConverting || isComplete}
                    >
                        {isConverting ? '转换中...' : isComplete ? '转换完成' : '开始转换'}
                    </button>

                    {(isConverting || isComplete || error) && (
                        <div className={styles.progressContainer}>
                            {isConverting && progress < 100 && (
                                <>
                                    <div className={styles.progressBarContainer}>
                                        <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <p className={styles.progressText}>
                                        {`转换中... ${Math.round(progress)}%`}
                                    </p>
                                </>)
                            }
                            {isComplete && downloadUrl && (
                                <>
                                    <p className={styles.progressText} style={{ color: 'green' }}>转换成功!</p>
                                    <button onClick={handleDownloadClick} className={styles.downloadButton}>
                                        下载 {selectedFormat.toUpperCase()} 文件
                                    </button>
                                </>)
                            }
                            {error && (
                                <p className={styles.errorText}>{error}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}