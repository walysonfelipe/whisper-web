import Constants from "../../utils/Constants";
import { Tile } from "./tile";

export function FileTile(props: {
    text: string;
    onFileUpdate: (
        decoded: AudioBuffer,
        blobUrl: string,
        mimeType: string,
    ) => void;
}) {
    // const audioPlayer = useRef<HTMLAudioElement>(null);

    // Create hidden input element
    let elem = document.createElement("input");
    elem.type = "file";
    elem.oninput = (event) => {
        // Make sure we have files to use
        let files = (event.target as HTMLInputElement).files;
        if (!files) return;

        // Create a blob that we can use as an src for our audio element
        const urlObj = URL.createObjectURL(files[0]);
        const mimeType = files[0].type;

        const reader = new FileReader();
        reader.addEventListener("load", async (e) => {
            const arrayBuffer = e.target?.result as ArrayBuffer; // Get the ArrayBuffer
            if (!arrayBuffer) return;

            const audioCTX = new AudioContext({
                sampleRate: Constants.SAMPLING_RATE,
            });

            const decoded = await audioCTX.decodeAudioData(arrayBuffer);

            props.onFileUpdate(decoded, urlObj, mimeType);
        });
        reader.readAsArrayBuffer(files[0]);

        // Reset files
        elem.value = "";
    };

    return (
        <>
            <Tile
                icon={<FolderIcon />}
                text={props.text}
                onClick={() => elem.click()}
            />
        </>
    );
}


function FolderIcon() {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth='1.5'
            stroke='currentColor'
        >
            <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776'
            />
        </svg>
    );
}