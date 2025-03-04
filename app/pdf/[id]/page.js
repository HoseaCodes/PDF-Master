'use client';

import { useState, useEffect, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { 
  Play, 
  Octagon, 
  Save, 
  Share2, 
  ZoomIn, 
  ZoomOut, 
  ChevronUp, 
  ChevronDown, 
  BookOpen,
  SkipBack,
  SkipForward,
  Repeat,
  PlayCircle,
  Timer
} from 'lucide-react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState('thumbnails');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [autoPlay, setAutoPlay] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [sections, setSections] = useState([]);

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

  useEffect(() => {
    if (pdfData) {
      // Split text into sections (e.g., by paragraphs or periods)
      const textSections = pdfData.textContent.split(/(?<=\.)\s+/);
      setSections(textSections);
    }
  }, [pdfData]);

  useEffect(() => {
    if (autoPlay && !speaking && currentSection < sections.length - 1) {
      const timer = setTimeout(() => {
        setCurrentSection(prev => prev + 1);
        startReading();
      }, 1000); // Wait 1 second between sections
      return () => clearTimeout(timer);
    }
  }, [speaking, autoPlay, currentSection, sections.length]);

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (utteranceRef.current) {
      utteranceRef.current.rate = speed;
    }
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const goToNextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
      startReading();
    }
  };

  const goToPreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
      startReading();
    }
  };

  const repeatSection = () => {
    startReading();
  };

  const startReading = async () => {
    if (sections[currentSection]) {
      if (cost >= 0.1 || selectedMethod === 'speechSynthesis') {
        const utterance = new SpeechSynthesisUtterance(sections[currentSection]);
        utterance.rate = playbackSpeed;

        utterance.onend = () => {
          setSpeaking(false);
          if (autoPlay) {
            goToNextSection();
          }
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
        // AWS Polly implementation
        const params = {
          OutputFormat: 'mp3',
          Text: sections[currentSection],
          VoiceId: selectedVoice,
        };

        try {
          const { AudioStream } = await polly.synthesizeSpeech(params).promise();
          const audioBlob = new Blob([AudioStream], { type: 'audio/mp3' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(audioUrl);

          const audio = new Audio(audioUrl);
          audio.playbackRate = playbackSpeed;
          audioRef.current = audio;

          setHighlightedText(sections[currentSection]);
          setTotalCharactersProcessed(prev => prev + sections[currentSection].length);

          audio.onended = () => {
            setSpeaking(false);
            if (autoPlay) {
              goToNextSection();
            }
          };

          audio.play();
          setSpeaking(true);
        } catch (error) {
          console.error('Error synthesizing speech:', error);
        }
      }
    }
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
    <div className="flex h-screen bg-white pb-24">
      {/* Left Sidebar */}
      <div className="w-64 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              className={`px-3 py-1 rounded ${viewMode === 'thumbnails' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setViewMode('thumbnails')}
            >
              Thumbnails
            </button>
            <button
              className={`px-3 py-1 rounded ${viewMode === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setViewMode('text')}
            >
              Text
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'thumbnails' ? (
            <div className="p-4 space-y-4">
              {/* Thumbnail pages */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={`border p-2 cursor-pointer ${currentPage === i + 1 ? 'border-blue-500' : 'border-gray-200'}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  <div className="text-xs mb-1">Page {i + 1}</div>
                  <div className="bg-gray-100 h-32 flex items-center justify-center">
                    {/* Placeholder for PDF thumbnail */}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4">
              {/* Text outline view */}
              <div className="space-y-2">
                {pdfData?.textContent.split('\n').map((line, i) => (
                  <div key={i} className="text-sm cursor-pointer hover:bg-gray-100 p-1">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">{pdfData?.filename}</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 rounded hover:bg-gray-100"
            >
              <Save className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded hover:bg-gray-100">
              <Share2 className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setZoom(Math.max(zoom - 10, 50))}
                className="p-2 rounded hover:bg-gray-100"
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <span>{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(zoom + 10, 200))}
                className="p-2 rounded hover:bg-gray-100"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div
            className="bg-white rounded-lg shadow-lg mx-auto"
            style={{ maxWidth: '800px', transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            {pdfData ? (
              <div className="p-8">
                <div className="whitespace-pre-wrap">
                  {highlightText(pdfData.textContent, highlightedText)}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex flex-col space-y-2">
              <VoiceSelector selectedVoice={selectedVoice} setSelectedVoice={setSelectedVoice} />
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="polly">AWS Polly</option>
                <option value="speechSynthesis">Speech API</option>
              </select>
            </div>

            {/* Playback Controls */}
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={goToPreviousSection}
                  className="p-2 rounded-full hover:bg-gray-100"
                  disabled={currentSection === 0}
                >
                  <SkipBack className="h-5 w-5" />
                </button>
                <button
                  onClick={speaking ? stopReading : startReading}
                  className={`p-3 rounded-full ${
                    speaking ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  {speaking ? <Octagon className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </button>
                <button
                  onClick={goToNextSection}
                  className="p-2 rounded-full hover:bg-gray-100"
                  disabled={currentSection === sections.length - 1}
                >
                  <SkipForward className="h-5 w-5" />
                </button>
                <button
                  onClick={repeatSection}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <Repeat className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setAutoPlay(!autoPlay)}
                  className={`p-2 rounded-full ${
                    autoPlay ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <PlayCircle className="h-5 w-5" />
                </button>
              </div>

              {/* Speed Control */}
              <div className="flex items-center space-x-2">
                <Timer className="h-4 w-4" />
                <select
                  value={playbackSpeed}
                  onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                  className="p-1 border rounded text-sm"
                >
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1">1x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="1.75">1.75x</option>
                  <option value="2">2x</option>
                </select>
              </div>
              <Progress value={progress} className="w-64" />
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 rounded hover:bg-gray-100">
                <ChevronUp className="h-5 w-5" />
              </button>
              <span className="text-sm">Page {currentPage}</span>
              <button className="p-2 rounded hover:bg-gray-100">
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Development Mode Stats */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg max-w-3xl mx-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm">
                  <span className="font-semibold">Total Characters Processed:</span> {totalCharactersProcessed}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Estimated Cost:</span> ${cost.toFixed(4)}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Right Sidebar - Notes Feature */}
      <div className="w-64 border-l border-gray-200 p-4">
        <div className="flex flex-col items-center text-center">
          <BookOpen className="h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Unlock Notes Feature</h3>
          <p className="text-sm text-gray-600 mb-4">
            Sign in to jot down your key takeaways and keep them organized for easy access anytime.
          </p>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Login to Continue
          </button>
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogTitle>Rename Document</DialogTitle>
          <input
            type="text"
            value={newFilename}
            onChange={handleFilenameChange}
            className="w-full p-2 border rounded"
          />
          <DialogFooter>
            <button
              onClick={saveFilename}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
