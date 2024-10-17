import { useEffect, useState } from "react";
import axios from "axios";
import AudioPlayer from "./AudioPlayer";
import { TranscribeButton } from "./TranscribeButton";
import Constants from "../utils/Constants";
import { Transcriber } from "../hooks/useTranscriber";
import Progress from "./Progress";
import { SettingsTile } from "./tiles/SettingsTile";
import { UrlTile } from "./tiles/UrlTile";
import { FileTile } from "./tiles/FileTile";
import { RecordTile } from "./tiles/RecordTile";
import { AudioDataBar, VerticalBar } from "./bar/barComponent";

export enum AudioSource {
    URL = "URL",
    FILE = "FILE",
    RECORDING = "RECORDING",
}

export function AudioManager(props: { transcriber: Transcriber }) {
    const [progress, setProgress] = useState<number | undefined>(undefined);
    const [audioData, setAudioData] = useState<
        | {
              buffer: AudioBuffer;
              url: string;
              source: AudioSource;
              mimeType: string;
          }
        | undefined
    >(undefined);
    const [audioDownloadUrl, setAudioDownloadUrl] = useState<
        string | undefined
    >(undefined);

    const isAudioLoading = progress !== undefined;

    const resetAudio = () => {
        setAudioData(undefined);
        setAudioDownloadUrl(undefined);
    };

    const setAudioFromDownload = async (
        data: ArrayBuffer,
        mimeType: string,
    ) => {
        const audioCTX = new AudioContext({
            sampleRate: Constants.SAMPLING_RATE,
        });
        const blobUrl = URL.createObjectURL(
            new Blob([data], { type: "audio/*" }),
        );
        const decoded = await audioCTX.decodeAudioData(data);
        setAudioData({
            buffer: decoded,
            url: blobUrl,
            source: AudioSource.URL,
            mimeType: mimeType,
        });
    };

    const setAudioFromRecording = async (data: Blob) => {
        resetAudio();
        setProgress(0);
        const blobUrl = URL.createObjectURL(data);
        const fileReader = new FileReader();
        fileReader.onprogress = (event) => {
            setProgress(event.loaded / event.total || 0);
        };
        fileReader.onloadend = async () => {
            const audioCTX = new AudioContext({
                sampleRate: Constants.SAMPLING_RATE,
            });
            const arrayBuffer = fileReader.result as ArrayBuffer;
            const decoded = await audioCTX.decodeAudioData(arrayBuffer);
            setProgress(undefined);
            setAudioData({
                buffer: decoded,
                url: blobUrl,
                source: AudioSource.RECORDING,
                mimeType: data.type,
            });
        };
        fileReader.readAsArrayBuffer(data);
    };


    
    const downloadAudioFromUrl = async (
        requestAbortController: AbortController,
    ) => {
        if (audioDownloadUrl) {
            try {
                setAudioData(undefined);
                setProgress(0);
                const { data, headers } = (await axios.get(audioDownloadUrl, {
                    signal: requestAbortController.signal,
                    responseType: "arraybuffer",
                    onDownloadProgress(progressEvent) {
                        setProgress(progressEvent.progress || 0);
                    },
                })) as {
                    data: ArrayBuffer;
                    headers: { "content-type": string };
                };

                let mimeType = headers["content-type"];
                if (!mimeType || mimeType === "audio/wave") {
                    mimeType = "audio/wav";
                }
                setAudioFromDownload(data, mimeType);
            } catch (error) {
                console.log("Request failed or aborted", error);
            } finally {
                setProgress(undefined);
            }
        }
    };

    // When URL changes, download audio
    useEffect(() => {
        if (audioDownloadUrl) {
            const requestAbortController = new AbortController();
            downloadAudioFromUrl(requestAbortController);
            return () => {
                requestAbortController.abort();
            };
        }
    }, [audioDownloadUrl]);

    return (
        <>
            <div className='flex flex-col justify-center items-center rounded-lg bg-white shadow-xl shadow-black/5 ring-1 ring-slate-700/10'>
                <div className='flex flex-row space-x-2 py-2 w-full px-2'>
                    <UrlTile
                        text={"From URL"}
                        onUrlUpdate={(e) => {
                            props.transcriber.onInputChange();
                            setAudioDownloadUrl(e);
                        }}
                    />
                    <VerticalBar />
                    <FileTile
                        text={"From file"}
                        onFileUpdate={(decoded, blobUrl, mimeType) => {
                            props.transcriber.onInputChange();
                            setAudioData({
                                buffer: decoded,
                                url: blobUrl,
                                source: AudioSource.FILE,
                                mimeType: mimeType,
                            });
                        }}
                    />
                    {navigator.mediaDevices && (
                        <>
                            <VerticalBar />
                            <RecordTile
                                text={"Record"}
                                setAudioData={(e) => {
                                    props.transcriber.onInputChange();
                                    setAudioFromRecording(e);
                                }}
                            />
                        </>
                    )}
                </div>
                {
                    <AudioDataBar
                        progress={isAudioLoading ? progress : +!!audioData}
                    />
                }
            </div>
            {audioData && (
                <>
                    <AudioPlayer
                        audioUrl={audioData.url}
                        mimeType={audioData.mimeType}
                    />

                    <div className='relative w-full flex justify-center items-center'>
                        <TranscribeButton
                            onClick={() => {
                                props.transcriber.start(audioData.buffer);
                            }}
                            isModelLoading={props.transcriber.isModelLoading}
                            // isAudioLoading ||
                            isTranscribing={props.transcriber.isBusy}
                        />

                        <SettingsTile
                            className='absolute right-4'
                            transcriber={props.transcriber}
                        />
                    </div>
                    {props.transcriber.progressItems.length > 0 && (
                        <div className='relative z-10 p-4 w-full'>
                            <label>
                                Loading model files... (only run once)
                            </label>
                            {props.transcriber.progressItems.map((data) => (
                                <div key={data.file}>
                                    <Progress
                                        text={data.file}
                                        percentage={data.progress}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </>
    );
}