const Loading = () => {
    return (
        <div className="flex flex-col gap-6 animate-pulse" aria-busy="true" aria-label="Loading">
            <div className="h-8 w-48 rounded bg-gray-800"/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-[420px] rounded-lg bg-gray-800"/>
                <div className="h-[420px] rounded-lg bg-gray-800"/>
            </div>
        </div>
    );
};

export default Loading;