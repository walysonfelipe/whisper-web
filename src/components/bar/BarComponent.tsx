export function VerticalBar() {
    return <div className='w-[1px] bg-slate-200'></div>;
}

export function AudioDataBar(props: { progress: number }) {
    return <ProgressBar progress={`${Math.round(props.progress * 100)}%`} />;
}

export function ProgressBar(props: { progress: string }) {
    return (
        <div className='w-full bg-gray-200 rounded-full h-1 dark:bg-gray-700'>
            <div
                className='bg-blue-600 h-1 rounded-full transition-all duration-100'
                style={{ width: props.progress }}
            ></div>
        </div>
    );
}