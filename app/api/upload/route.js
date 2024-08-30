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
    let parsedText = "";
    console.log("Uploaded files:", uploadedFiles);
    let fileBuffer;

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

                // Parse the pdf using pdf2json. See pdf2json docs for more info.

                // The reason I am bypassing type checks is because
                // the default type definitions for pdf2json in the npm install
                // do not allow for any constructor arguments.
                // You can either modify the type definitions or bypass the type checks.
                // I chose to bypass the type checks.
                const pdfParser = new (PDFParser)(null, 1);

                // See pdf2json docs for more info on how the below works.
                pdfParser.on("pdfParser_dataError", (errData) =>
                console.log(errData.parserError)
                );
                pdfParser.on("pdfParser_dataReady", () => {
                    parsedText = (pdfParser).getRawTextContent();
                    console.log((pdfParser).getRawTextContent());
                    console.log("PDF parsed successfully");
            });
            
            pdfParser.loadPDF(tempFilePath);
            return new Promise((resolve) => {
                setTimeout(() => {
                    parsedText = (pdfParser).getRawTextContent();
                    console.log("Function 1 is done!");
                    console.log(parsedText);
                    resolve();
                }, 2000); // Simulating a 2-second asynchronous operation
            });
                // return (pdfParser as any).getRawTextContent();
            } else {
                console.log("Uploaded file is not in the expected format.");
                return "";
            }
        } else {
          console.log("No files found.");
          return "";
        }
    }
 
    // Connect to MongoDB and insert data
    try {
        const textContent = await pdfToText();
        let result;
        try {
            const client = await clientPromise;
            const db = client.db();
            const collection = db.collection('pdfs');

            // Check if a document with the same filename already exists
            const existingDocument = await collection.findOne({ filename });

            if (existingDocument) {
                // If the document already exists, return a response indicating the conflict
                console.log(`PDF with filename ${filename} already exists in the database.`);
                // return NextResponse.json(
                //     { error: 'PDF already exists' },
                //     { status: 409 } // 409 Conflict
                // );
            } else {
                console.log(`PDF with filename ${filename} does not exist in the database.`);
                result = await collection.insertOne({
                    originalFile: fileBuffer,
                    textContent,
                    completed: false,
                    progress: 0,
                    filename,
                });
            }
        } catch (err) {
            console.error('Database error:', err);
            console.error('Database error:', err.message);
            return NextResponse.json({ error: 'Database operation failed' }, { status: 500 });
        }
        const response = new NextResponse(parsedText);
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
// export async function POST(req) {
//   try {
//     // Attempt to retrieve form data
//     const data = await req.formData();
//     const file = data.get('file');

//     // Validate the file is present and is a PDF
//     if (!file || file.type !== 'application/pdf') {
//       return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
//     }

//     // Convert file to buffer
//     let fileBuffer;
//     try {
//       fileBuffer = Buffer.from(await file.arrayBuffer());
//     } catch (err) {
//       console.error('Error converting file to buffer:', err);
//       return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
//     }

//     // Parse the PDF content using pdf2json
//     let textContent = '';
//     try {
//       const pdfParser = new PDFParser();
//       pdfParser.parseBuffer(fileBuffer);
//       textContent = await new Promise((resolve, reject) => {
//         pdfParser.on('pdfParser_dataError', err => {
//           console.error('Error parsing PDF:', err);
//           reject('Failed to parse PDF content');
//         });
//         pdfParser.on('pdfParser_dataReady', pdfData => {
//           textContent = pdfData.formImage.Pages.map(page => 
//             page.Texts.map(text => decodeURIComponent(text.R[0].T)).join(' ')
//           ).join(' ');
//           resolve(textContent);
//         });
//       });
//     } catch (err) {
//       console.error('Error parsing PDF:', err);
//       return NextResponse.json({ error: 'Failed to parse PDF content' }, { status: 500 });
//     }

//     // Connect to MongoDB and insert data
//     let result;
//     try {
//       const client = await clientPromise;
//       const db = client.db();
//       const collection = db.collection('pdfs');

//       result = await collection.insertOne({
//         originalFile: fileBuffer,
//         textContent,
//         completed: false,
//         progress: 0,
//         filename: file.name,
//       });
//     } catch (err) {
//       console.error('Database error:', err);
//       return NextResponse.json({ error: 'Database operation failed' }, { status: 500 });
//     }

//     // Return success response
//     return NextResponse.json({ id: result.insertedId, filename: file.name });

//   } catch (err) {
//     // Catch any other unexpected errors
//     console.error('Unexpected error:', err);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

