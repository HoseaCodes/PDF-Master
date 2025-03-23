'use client';

import React, { useState, useEffect } from 'react';
import AWS from '@/lib/aws';

const polly = new AWS.Polly();

const VoiceSelector = ({ selectedVoice, setSelectedVoice, onError }) => {
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setLoading(true);
        const result = await polly.describeVoices().promise();
  
        // Filter for English voices that are standard or neural
        const filteredVoices = result.Voices.filter(
          (voice) => voice.LanguageCode.startsWith('en') && 
          (voice.SupportedEngines.includes('standard') || voice.SupportedEngines.includes('neural'))
        );
  
        // Sort voices by name
        filteredVoices.sort((a, b) => a.Name.localeCompare(b.Name));
        
        setVoices(filteredVoices);
        if (filteredVoices.length > 0 && !selectedVoice) {
          setSelectedVoice(filteredVoices[0].Id);
        }
      } catch (error) {
        console.error("Error fetching voices:", error);
        setError("Failed to load voices. Please try again later.");
        if (onError) onError(error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchVoices();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center mt-4">
        <div className="animate-pulse flex space-x-4">
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center mt-4 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center mt-4 space-y-2 sm:space-y-0 sm:space-x-4">
      <label className="text-lg font-medium">Voice:</label>
      <div className="relative">
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-lg py-2 px-4 pr-8 leading-tight focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          {voices.map((voice) => (
            <option key={voice.Id} value={voice.Id}>
              {voice.Name} ({voice.SupportedEngines.includes('neural') ? 'Neural' : 'Standard'})
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default VoiceSelector;
