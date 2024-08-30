"use client";

import { useEffect, useState, useCallback } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "filepond/dist/filepond.min.css";

registerPlugin(FilePondPluginFileValidateSize, FilePondPluginFileValidateType);

export default function FileUpload({ pdfFiles, setPdfFiles, setPDFData, fieldPondRef }) {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    files.forEach((file) => {
      file.metadata = {
        type: "pdfs",
        poster: "https://i.imgur.com/xZaKrYt.jpg",
      };
    });
  }, [files]);
    
  // Function to handle file processing
  const handleFileProcess = useCallback(
    (fieldName, file, metadata, load, error, progress, abort) => {
      console.log({ fieldName, file, metadata });

      // Append the file to the current pdfFiles state
      setPdfFiles((prevFiles) => [...prevFiles, file]);

      const formData = new FormData();
      formData.append(fieldName, file, file.name);

      const request = new XMLHttpRequest();
      request.open("POST", "/api/upload");
      request.upload.onprogress = (e) => {
        progress(e.lengthComputable, e.loaded, e.total);
      };
      request.onload = function () {
        if (request.status >= 200 && request.status < 300) {
          console.log(request);
          load(request.responseText);
          setPDFData(request.responseText);
        } else {
          error("Upload failed");
        }
      };
      request.onerror = function () {
        error("Upload failed due to network error");
      };
      request.send(formData);

      return {
        abort: () => {
          request.abort();
          abort();
        },
      };
    },
    [setPdfFiles, setPDFData]
  );

  return (
    <FilePond
      ref={fieldPondRef}
      allowProcess={true}
      storeAsFile={true}
      dropOnPage={true}
      dropValidation={true}
      labelIdle={`Drag & Drop your picture or <span class="filepond--label-action">Browse</span>`}
      styleLoadIndicatorPosition="center bottom"
      styleProgressIndicatorPosition="right bottom"
      styleButtonRemoveItemPosition="left bottom"
      styleButtonProcessItemPosition="right bottom"
      onupdatefiles={(fileItems) => {
        // Only update the state if the file list has changed
        if (fileItems.length !== files.length) {
          setFiles(fileItems.map((fileItem) => fileItem.file));
        }
      }}
      maxFileSize="450KB"
      acceptedFileTypes={["application/pdf"]}
      files={files}
      allowMultiple={true}
      maxFiles={3}
      server={{
        timeout: 3000,
        process: handleFileProcess,
        fetch: null,
        revert: null,
      }}
    />
  );
}
