import { Transcriber } from "../../hooks/useTranscriber";
import LANGUAGES from "../../utils/LanguagesSupports";
import Modal from "./Modal";

function titleCase(str: string) {
    str = str.toLowerCase();
    return (str.match(/\w+.?/g) || [])
        .map((word) => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join("");
}

export function SettingsModal(props: {
    show: boolean;
    onSubmit: (url: string) => void;
    onClose: () => void;
    transcriber: Transcriber;
}) {
    const names = Object.values(LANGUAGES).map(titleCase);

    const models = {
        // Original checkpoints
        'Xenova/whisper-tiny': [41, 152],
        'Xenova/whisper-base': [77, 291],
        'Xenova/whisper-small': [249],
        'Xenova/whisper-medium': [776],

        // Distil Whisper (English-only)
        'distil-whisper/distil-medium.en': [402],
        'distil-whisper/distil-large-v2': [767],
    };
    return (
        <Modal
            show={props.show}
            title={"Settings"}
            content={
                <>
                    <label>Select the model to use.</label>
                    <select
                        className='mt-1 mb-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                        defaultValue={props.transcriber.model}
                        onChange={(e) => {
                            props.transcriber.setModel(e.target.value);
                        }}
                    >
                        {Object.keys(models)
                            .filter(
                                (key) =>
                                    props.transcriber.quantized ||
                                    // @ts-ignore
                                    models[key].length == 2,
                            )
                            .filter(
                                (key) => (
                                    !props.transcriber.multilingual || !key.startsWith('distil-whisper/')
                                )
                            )
                            .map((key) => (
                                <option key={key} value={key}>{`${key}${
                                    (props.transcriber.multilingual || key.startsWith('distil-whisper/')) ? "" : ".en"
                                } (${
                                    // @ts-ignore
                                    models[key][
                                        props.transcriber.quantized ? 0 : 1
                                    ]
                                }MB)`}</option>
                            ))}
                    </select>
                    <div className='flex justify-between items-center mb-3 px-1'>
                        <div className='flex'>
                            <input
                                id='multilingual'
                                type='checkbox'
                                checked={props.transcriber.multilingual}
                                onChange={(e) => {
                                    props.transcriber.setMultilingual(
                                        e.target.checked,
                                    );
                                }}
                            ></input>
                            <label htmlFor={"multilingual"} className='ms-1'>
                                Multilingual
                            </label>
                        </div>
                        <div className='flex'>
                            <input
                                id='quantize'
                                type='checkbox'
                                checked={props.transcriber.quantized}
                                onChange={(e) => {
                                    props.transcriber.setQuantized(
                                        e.target.checked,
                                    );
                                }}
                            ></input>
                            <label htmlFor={"quantize"} className='ms-1'>
                                Quantized
                            </label>
                        </div>
                    </div>
                    {props.transcriber.multilingual && (
                        <>
                            <label>Select the source language.</label>
                            <select
                                className='mt-1 mb-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                                defaultValue={props.transcriber.language}
                                onChange={(e) => {
                                    props.transcriber.setLanguage(
                                        e.target.value,
                                    );
                                }}
                            >
                                {Object.keys(LANGUAGES).map((key, i) => (
                                    <option key={key} value={key}>
                                        {names[i]}
                                    </option>
                                ))}
                            </select>
                            <label>Select the task to perform.</label>
                            <select
                                className='mt-1 mb-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                                defaultValue={props.transcriber.subtask}
                                onChange={(e) => {
                                    props.transcriber.setSubtask(
                                        e.target.value,
                                    );
                                }}
                            >
                                <option value={"transcribe"}>Transcribe</option>
                                <option value={"translate"}>
                                    Translate (to English)
                                </option>
                            </select>
                        </>
                    )}
                </>
            }
            onClose={props.onClose}
            onSubmit={() => {}}
        />
    );
}