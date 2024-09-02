'use client';

import React, { useState, useEffect } from 'react';
import AWS from '@/lib/aws';

const polly = new AWS.Polly();

const VoiceSelector = ({ selectedVoice, setSelectedVoice }) => {
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const result = await polly.describeVoices().promise();
        console.log("Voices:", result.Voices);
        setVoices(result.Voices);
        setSelectedVoice(result.Voices[0].Id); // Default to the first voice
      } catch (error) {
        console.error("Error fetching voices:", error);
      }
    };

    fetchVoices();
  }, []);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const result = await polly.describeVoices().promise();
  
        // Filter for English voices that are standard
        const filteredVoices = result.Voices.filter(
          (voice) => voice.LanguageCode.startsWith('en') && (voice.SupportedEngines[0] === 'standard' || voice.SupportedEngines[1] === 'standard')
        );
  
        setVoices(filteredVoices);
        if (filteredVoices.length > 0) {
          setSelectedVoice(filteredVoices[0].Id); // Default to the first filtered voice
        } else {
          setSelectedVoice(null); // No voice to select if none match criteria
        }
      } catch (error) {
        console.error("Error fetching voices:", error);
      }
    };
  
    fetchVoices();
  }, []);

  return (
    <div className="flex items-center justify-center mt-4">
        <label className="mr-2 text-lg">Select Voice:</label>
        {voices.length > 0 ? (
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="border rounded p-2 mb-4"
        >
          {voices.map((voice) => (
            <option key={voice.Id} value={voice.Id}>
              {voice.Name} ({voice.LanguageName})
            </option>
          ))}
        </select>
      ) : (
        <p>Loading voices...</p>
      )}
     </div>
  );
};

export default VoiceSelector;
