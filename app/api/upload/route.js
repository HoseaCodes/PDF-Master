import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db'; // Adjust the import path to your MongoDB client file
import { Buffer } from 'buffer';
import { promises as fs } from "fs"; // To save the file temporarily
import { v4 as uuidv4 } from "uuid"; // To generate a unique filename
import PDFParser from 'pdf2json';

export async function POST(req) {
    const formData = await req.formData();
    const uploadedFiles = formData.getAll("filepond");
    let fileName = "";
    let filename = "";
    let fileBuffer;

    // Function to parse PDF and return text content
    const pdfToText = async () => {
        if (uploadedFiles && uploadedFiles.length > 0) {
            const uploadedFile = uploadedFiles[0];
            filename = uploadedFile.name;
            console.log("Uploaded file:", uploadedFile);

            // Check if uploadedFile is of type File
            if (uploadedFile instanceof File) {
                // Generate a unique filename
                fileName = uuidv4();

                // Convert the uploaded file into a temporary file
                const tempFilePath = `/tmp/${fileName}.pdf`;

                // Convert ArrayBuffer to Buffer
                fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());

                // Save the buffer as a file
                await fs.writeFile(tempFilePath, fileBuffer);

                // Parse the pdf using pdf2json
                const pdfParser = new (PDFParser)(null, 1);

                // Wrap the parsing in a Promise to handle async parsing correctly
                return new Promise((resolve, reject) => {
                    pdfParser.on("pdfParser_dataError", (errData) => {
                        console.error("PDF Parsing Error:", errData.parserError);
                        reject(errData.parserError);
                    });

                    pdfParser.on("pdfParser_dataReady", () => {
                        const parsedText = pdfParser.getRawTextContent();
                        console.log("PDF parsed successfully:", parsedText);
                        resolve(parsedText);
                    });

                    pdfParser.loadPDF(tempFilePath);
                });
            } else {
                console.log("Uploaded file is not in the expected format.");
                throw new Error("Uploaded file is not a valid PDF.");
            }
        } else {
            console.log("No files found.");
            throw new Error("No files uploaded.");
        }
    };

    // Connect to MongoDB and insert data
    try {
        const textContent = await pdfToText(); // Wait for textContent to be fully populated

        if (!textContent) {
            console.log("Text content could not be extracted.");
            return NextResponse.json(
                { error: 'Text content extraction failed' },
                { status: 500 }
            );
        }

        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection('pdfs');

        // Check if a document with the same filename already exists
        const existingDocument = await collection.findOne({ filename });

        if (existingDocument) {
            console.log(`PDF with filename ${filename} already exists in the database.`);
            return NextResponse.json(
                { error: 'PDF already exists' },
                { status: 409 } // 409 Conflict
            );
        } else {
            console.log(`PDF with filename ${filename} does not exist in the database.`);
            await collection.insertOne({
                originalFile: fileBuffer,
                textContent,
                completed: false,
                progress: 0,
                filename,
                createdAt: new Date(),
            });
            console.log('Document inserted successfully.');
        }

        const response = new NextResponse(textContent);
        response.headers.set("FileName", fileName);
        return response;

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: `Internal Server Error: ${error}` },
            { status: 500 }
        );
    }
}
