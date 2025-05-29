import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('compress'); // 'compress' or 'decompress'

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`/api/${mode}`, formData, {
        responseType: 'blob',
      });

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
      alert(`${mode === 'compress' ? 'Compression' : 'Decompression'} failed`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-900 text-gray-100 transition-colors duration-500">
      <h1 className="text-3xl font-bold mb-6 text-blue-400">
        📦 Huffman File {mode === 'compress' ? 'Compressor' : 'Decompressor'}
      </h1>

      <button
        onClick={() => setMode(mode === 'compress' ? 'decompress' : 'compress')}
        className="mb-6 px-4 py-2 rounded bg-purple-700 text-white hover:bg-purple-600 transition"
      >
        Switch to {mode === 'compress' ? 'Decompression' : 'Compression'}
      </button>

        <input
          type="file"
          accept={mode === 'compress' ? '.txt' : '.huff'}
          onChange={handleFileChange}
          className="mb-4 p-2 border rounded shadow-sm bg-gray-800 border-gray-700 text-white"
        />


      <button
        onClick={handleUpload}
        disabled={!file || isLoading}
        className={`px-6 py-2 rounded-lg font-semibold shadow-md transition ${
          isLoading || !file
            ? 'bg-gray-600 cursor-not-allowed text-gray-300'
            : mode === 'compress'
            ? 'bg-blue-700 hover:bg-blue-600 text-white'
            : 'bg-green-700 hover:bg-green-600 text-white'
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
  );
}

export default App;
