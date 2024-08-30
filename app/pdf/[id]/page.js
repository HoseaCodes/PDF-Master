// app/pdf/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
// import { useSpeechSynthesis } from 'react-speech-kit';
// import ProgressBar from '@ramonak/react-progress-bar';

export default function PdfPage({ params }) {
//   const { speak, cancel, speaking } = useSpeechSynthesis();
  const [pdfData, setPdfData] = useState(null);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchPdfData = async () => {
      const res = await fetch(`/api/pdf/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setPdfData(data);
        setProgress(data.progress);
      }
    };
    fetchPdfData();
  }, [params.id]);

//   const startReading = () => {
//     if (pdfData) {
//       speak({
//         text: pdfData.textContent.slice(currentTextIndex),
//         onEnd: () => {
//           setProgress(100);
//           updateProgress(100, true);
//         },
//         onBoundary: (event) => {
//           setCurrentTextIndex(currentTextIndex + event.charIndex);
//           const newProgress = Math.round(
//             ((currentTextIndex + event.charIndex) / pdfData.textContent.length) * 100
//           );
//           setProgress(newProgress);
//           updateProgress(newProgress, false);
//         },
//       });
//     }
//   };

//   const stopReading = () => {
//     cancel();
//   };

  const updateProgress = async (newProgress, completed) => {
    await fetch(`/api/pdf/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify({ progress: newProgress, completed }),
    });
  };

  return (
    <div>
      {pdfData ? (
        <>
          <h1>{pdfData.filename}</h1>
          {/* <ProgressBar completed={progress} /> */}
          {/* <button onClick={startReading} disabled={speaking}> */}
            {/* Start Reading
          </button> */}
          {/* <button onClick={stopReading} disabled={!speaking}>
            Stop Reading
          </button> */}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
