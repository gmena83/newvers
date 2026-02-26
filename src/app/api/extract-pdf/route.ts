import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
        }

        const apiKey = process.env.PDFCO_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "PDF.co API key not configured" }, { status: 500 });
        }

        // Step 1: Upload file to PDF.co
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const base64 = fileBuffer.toString("base64");

        const uploadRes = await fetch("https://api.pdf.co/v1/file/upload/base64", {
            method: "POST",
            headers: {
                "x-api-key": apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: file.name,
                file: base64,
            }),
        });

        const uploadData = await uploadRes.json();
        if (uploadData.error) {
            throw new Error(uploadData.message || "PDF upload failed");
        }

        // Step 2: Convert to text
        const convertRes = await fetch("https://api.pdf.co/v1/pdf/convert/to/text", {
            method: "POST",
            headers: {
                "x-api-key": apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url: uploadData.url,
                inline: true,
            }),
        });

        const convertData = await convertRes.json();
        if (convertData.error) {
            throw new Error(convertData.message || "PDF conversion failed");
        }

        // If inline, the body is the text. Otherwise fetch from URL.
        let text = convertData.body || "";
        if (!text && convertData.url) {
            const textRes = await fetch(convertData.url);
            text = await textRes.text();
        }

        return NextResponse.json({ text });
    } catch (err: unknown) {
        console.error("PDF extraction error:", err);
        const message = err instanceof Error ? err.message : "PDF extraction failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
