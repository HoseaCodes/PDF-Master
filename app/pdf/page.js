"use client";
import React, { useState } from "react";
import { Spinner } from "@/components/spinner";
import FileUpload from "@/components/fileUpload";
// import { uploadPDF2Firebase } from "@/lib/firebase";

export default function PDF() {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [pdfData, setPDFData] = useState();
  const [uploadedFile, setUploadedFile] = useState(false);
  const [loading, setLoading] = useState(false);
    
  const handleUpload = async () => {
    // await uploadPDF2Firebase(setLoading, setUploadedFile, pdfFiles);
  };


  return (
    <div>
      <FileUpload setPdfFiles={setPdfFiles} setPDFData={setPDFData} />
      {loading ? (
        <Spinner />
      ) : (
        <div>
          <button
            type="button"
            className="m-2"
            disabled={!pdfFiles.length}
            onClick={handleUpload}
          >
            Upload To Firebase
          </button>
        </div>
      )}
      {pdfFiles.length > 0 && (
              <div>
                  <h2>Uploaded PDFs</h2>
                  <ul>
                      {pdfFiles.map((pdfFile, index) => (
                          <li key={index}>{pdfFile.name}</li>
                      ))}
                  </ul>
              </div>
          )}
        {uploadedFile && <p>File uploaded successfully!</p>}
      {pdfData && <pre>{pdfData}</pre>}
    </div>
  );
}
