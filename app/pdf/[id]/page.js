'use client';

import { useState, useEffect, useRef } from 'react';
import { Progress } from '@/components/ui/progress';

export default function PdfPage({ params }) {
  const [pdfData, setPdfData] = useState(null);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const speechSynthesis = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

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

  const startReading = () => {
    if (pdfData) {
      const utterance = new SpeechSynthesisUtterance(pdfData.textContent.slice(currentTextIndex));

      utterance.onend = () => {
        setProgress(100);
        updateProgress(100, true);
        setSpeaking(false);
      };

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          setCurrentTextIndex(currentTextIndex + event.charIndex);
          const newProgress = Math.round(
            ((currentTextIndex + event.charIndex) / pdfData.textContent.length) * 100
          );
          setProgress(newProgress);
          updateProgress(newProgress, false);
        }
      };

      speechSynthesis.current.speak(utterance);
      setSpeaking(true);
      utteranceRef.current = utterance;
    }
  };

  const stopReading = () => {
    speechSynthesis.current.cancel();
    setSpeaking(false);
  };

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
          <div className="w-full mt-4 max-w-xs mx-auto">
            <Progress
              indicatorColor={progress === 100 ? 'bg-green-500' : ''}
              value={progress}
              className="h-1 w-full bg-zinc-200"
            />
          </div>
          <button onClick={startReading} disabled={speaking}>
            Start Reading
          </button>
          <button onClick={stopReading} disabled={!speaking}>
            Stop Reading
          </button>

          {/* Display the text content with the highlighted portion */}
          <div className="mt-4">
            <p>
              {/* Highlight the part of the text that is currently being read */}
              {pdfData.textContent.slice(0, currentTextIndex)}
              <span className="bg-yellow-200">
                {pdfData.textContent.slice(currentTextIndex, currentTextIndex + 50)}
              </span>
              {pdfData.textContent.slice(currentTextIndex + 50)}
            </p>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
