import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState('compress');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    // Fake progress simulation
    let fakeProgress = 0;
    const interval = setInterval(() => {
      fakeProgress += 5;
      if (fakeProgress < 95) setProgress(fakeProgress);
    }, 200);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/${mode}`, formData, {
        responseType: 'blob',
      });

      clearInterval(interval);
      setProgress(100);

      const blob = new Blob([res.data], {
        type: mode === 'compress' ? 'application/octet-stream' : 'text/plain',
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = mode === 'compress' ? 'compressed.huff' : 'decompressed.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      clearInterval(interval);
      setProgress(0);
      alert(`${mode === 'compress' ? 'Compression' : 'Decompression'} failed`);
    } finally {
      setIsLoading(false);
    }
  };

  // Default to dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
        <div className="w-full max-w-xl sm:px-6 px-4 py-6 sm:py-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl relative">

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-blue-600 dark:text-blue-400">
            Huffman {mode === 'compress' ? 'Compressor' : 'Decompressor'}
          </h1>

          {/* Mode Toggle */}
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setMode('compress')}
              className={`px-4 py-2 text-sm rounded-l-lg font-semibold ${
                mode === 'compress'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              } transition`}
            >
              Compress
            </button>
            <button
              onClick={() => setMode('decompress')}
              className={`px-4 py-2 text-sm rounded-r-lg font-semibold ${
                mode === 'decompress'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              } transition`}
            >
              Decompress
            </button>
          </div>

          {/* File Input */}
          <div className="mb-4">
            <input
              type="file"
              accept={mode === 'compress' ? '.txt' : '.huff'}
              onChange={handleFileChange}
              className="w-full text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:outline-none"
            />
          </div>

          {/* Progress Bar */}
          {isLoading && (
            <div className="mb-4">
              <div className="w-full bg-gray-300 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-center mt-1">{progress}%</p>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || isLoading}
            className={`w-full py-2 rounded-lg font-semibold text-white transition ${
              isLoading || !file
                ? 'bg-gray-400 cursor-not-allowed'
                : mode === 'compress'
                ? 'bg-blue-600 hover:bg-blue-500'
                : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            {isLoading
              ? mode === 'compress'
                ? 'Compressing...'
                : 'Decompressing...'
              : mode === 'compress'
              ? 'Compress File'
              : 'Decompress File'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
