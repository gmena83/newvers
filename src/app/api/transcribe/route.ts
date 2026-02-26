import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const CHUNK_SIZE = 24 * 1024 * 1024; // ~24MB to stay under 25MB limit

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const arrayBuffer = await file.arrayBuffer();

        // If file is small enough, send directly
        if (arrayBuffer.byteLength <= CHUNK_SIZE) {
            const response = await openai.audio.transcriptions.create({
                model: "whisper-1",
                file: new File([arrayBuffer], file.name, { type: file.type }),
            });
            return NextResponse.json({ transcript: response.text });
        }

        // Split into chunks for large files
        const chunkBuffers: ArrayBuffer[] = [];
        for (let i = 0; i < arrayBuffer.byteLength; i += CHUNK_SIZE) {
            chunkBuffers.push(arrayBuffer.slice(i, i + CHUNK_SIZE));
        }

        const transcripts: string[] = [];
        for (let idx = 0; idx < chunkBuffers.length; idx++) {
            const chunkFile = new File(
                [chunkBuffers[idx] as BlobPart],
                `chunk_${idx}.${file.name.split(".").pop()}`,
                { type: file.type }
            );
            const response = await openai.audio.transcriptions.create({
                model: "whisper-1",
                file: chunkFile,
            });
            transcripts.push(response.text);
        }

        return NextResponse.json({ transcript: transcripts.join(" ") });
    } catch (err: unknown) {
        console.error("Transcription error:", err);
        const message = err instanceof Error ? err.message : "Transcription failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
