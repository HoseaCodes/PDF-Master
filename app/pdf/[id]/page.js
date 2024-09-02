'use client';

import { useState, useEffect, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Play, Octagon, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import AWS from '@/lib/aws';
import VoiceSelector from '@/components/voiceselector';

export default function PdfPage({ params }) {
  const [pdfData, setPdfData] = useState(null);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [highlightedText, setHighlightedText] = useState("");
  const [progress, setProgress] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [newFilename, setNewFilename] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState('Joanna');
  const [totalCharactersProcessed, setTotalCharactersProcessed] = useState(0);
  const [cost, setCost] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState('polly');

  const polly = new AWS.Polly();
  const audioRef = useRef(null);
  const utteranceRef = useRef(null);
  const speechSynthesis = useRef(window.speechSynthesis);

  useEffect(() => {
    const fetchPdfData = async () => {
      const res = await fetch(`/api/pdf/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setPdfData(data);
        setProgress(data.progress);
        setNewFilename(data.filename);
      }
    };
    fetchPdfData();
  }, [params.id]);

  useEffect(() => {
    // Update cost when total characters processed changes
    const costPerCharacter = 0.000004; // Example cost per character
    setCost(totalCharactersProcessed * costPerCharacter);
  }, [totalCharactersProcessed]);

  const startReading = async () => {
    if (pdfData) {
      if (cost >= 0.1 || selectedMethod === 'speechSynthesis') {
        // Use SpeechSynthesisUtterance if cost is above the threshold
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
      } else {
        // Use Amazon Polly if cost is below the threshold
        const textChunks = splitTextIntoChunks(pdfData.textContent.slice(currentTextIndex), 3000);

        for (const chunk of textChunks) {
          const params = {
            OutputFormat: 'mp3',
            Text: chunk,
            VoiceId: selectedVoice,
          };

          try {
            const { AudioStream } = await polly.synthesizeSpeech(params).promise();
            const audioBlob = new Blob([AudioStream], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioUrl(audioUrl);

            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            console.log('Playing audio:', audioUrl, audio, currentTextIndex, chunk.length, chunk);
            setCurrentTextIndex((prevIndex) => prevIndex + (chunk.length - 1));
            setHighlightedText(chunk);
            setTotalCharactersProcessed((prev) => prev + chunk.length);

            audio.onended = () => {
              const newProgress = Math.min(progress + (chunk.length / pdfData.textContent.length) * 100, 100);
              setProgress(newProgress);
              setCurrentTextIndex((prevIndex) => prevIndex + chunk.length);
              updateProgress(newProgress, newProgress === 100);
              setSpeaking(false);
            };

            audio.play();
            setSpeaking(true);

            await new Promise((resolve) => {
              audio.onended = resolve;
            });
          } catch (error) {
            console.error('Error synthesizing speech:', error);
          }
        }
      }
    }
  };

  const splitTextIntoChunks = (text, chunkSize) => {
    const regex = new RegExp(`.{1,${chunkSize}}`, 'g');
    return text.match(regex) || [];
  };

  const stopReading = () => {
    if (speechSynthesis.current.speaking) {
      speechSynthesis.current.cancel();
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
    setSpeaking(false);
  };

  const updateProgress = async (newProgress, completed) => {
    await fetch(`/api/pdf/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify({ progress: newProgress, completed }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  const handleFilenameChange = (e) => {
    setNewFilename(e.target.value);
  };

  const saveFilename = async () => {
    if (newFilename.trim()) {
      try {
        const res = await fetch(`/api/pdf/${params.id}`, {
          method: 'PUT',
          body: JSON.stringify({ filename: newFilename }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Filename updated:', res);
        setPdfData((prevData) => ({ ...prevData, filename: newFilename }));
        setIsModalOpen(false);
      } catch (error) {
        console.error('Failed to update filename:', error);
      }
    }
  };

  const highlightText = (text, searchTerm) => {
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={index} className="bg-yellow-200">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className='flex flex-col'>
      {pdfData ? (
        <>
          <div className="flex items-center justify-center">
            <h1 className="text-xl font-bold">{pdfData.filename}</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="ml-4 p-2 rounded bg-green-500 hover:bg-green-600 text-white"
            >
              <Save className="h-5 w-5" />
            </button>
          </div>
          <VoiceSelector selectedVoice={selectedVoice} setSelectedVoice={setSelectedVoice} />
          <div className="flex items-center justify-center mt-4">
            <label className="mr-2 text-lg">Select API:</label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="speechSynthesis">Speech API</option>
              <option value="polly">AWS Polly</option>
            </select>
          </div>


          <div className="w-full mt-4 max-w-xs mx-auto">
            <Progress
              indicatorColor={progress === 100 ? 'bg-green-500' : ''}
              value={progress}
              className="h-1 w-full bg-zinc-200"
            />
          </div>

          <div className="flex justify-center mt-4 space-x-4">
            <button
              onClick={startReading}
              disabled={speaking}
              className="p-2 rounded bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
            >
              <Play className="text-white" />
            </button>
            <button
              onClick={stopReading}
              disabled={!speaking}
              className="p-2 rounded bg-red-500 hover:bg-red-600 disabled:opacity-50"
            >
              <Octagon className="text-white" />
            </button>
          </div>

          {/* Usage Calculator */}
          <Card className="mt-4 p-4 flex justify-center items-center flex-col">
            <p className='font-bold'>Total Characters Processed: {totalCharactersProcessed}</p>
            <p className='font-bold'>Estimated Cost: ${cost.toFixed(4)}</p>
          </Card>

          {selectedMethod === 'speechSynthesis' ? (
            <Card className="mt-4 p-4 flex w-max self-center">
              <p className='prose items-center justify-center'>
                {pdfData.textContent.slice(0, currentTextIndex)}
                <span className="bg-yellow-200">
                  {pdfData.textContent.slice(currentTextIndex, currentTextIndex + 50)}
                </span>
                {pdfData.textContent.slice(currentTextIndex + 50)}
              </p>
            </Card>
          ) : (
            <Card className="mt-4 p-4 flex w-max self-center">
              <p className='prose items-center justify-center'>
                {highlightText(pdfData.textContent, highlightedText)}
              </p>
            </Card>
          )}


          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent>
              <DialogTitle>Update Filename</DialogTitle>
              <input
                type="text"
                value={newFilename}
                onChange={handleFilenameChange}
                placeholder="New filename"
                className="border rounded p-2 w-full"
              />
              <DialogFooter>
                <button
                  onClick={saveFilename}
                  className="ml-2 p-2 rounded bg-green-500 hover:bg-green-600 text-white"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="ml-2 p-2 rounded bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Cancel
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
