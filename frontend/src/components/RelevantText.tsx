
interface SingleChunkProps {
  relevantChunk: string;
}

function SingleChunk({relevantChunk}: SingleChunkProps) {
    return (
        <div className="text-center border rounded p-4 mt-4">
            {relevantChunk}
        </div>
    );
}

interface RelevantTextProps {
    relevantChunks: string[];
}

export default function RelevantText({relevantChunks}: RelevantTextProps) {
    const displayChunks = relevantChunks.map(relevantChunk => <SingleChunk relevantChunk={relevantChunk}/>)
    return (
        <div className="flex flex-col justify-center align-middle">
            {displayChunks}
        </div>
    )
}