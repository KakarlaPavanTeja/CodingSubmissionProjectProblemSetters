import React, { useState } from 'react';
import axios from 'axios';
import FileInput from './FileInput';
import StatusMessage from './StatusMessage';
import { Spinner, DownloadIcon } from './Icons';

const IdChangerForm = () => {
  const [jsonFile, setJsonFile] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jsonFile) {
      setStatus({ type: 'error', message: 'Please upload a coding_questions.json file.' });
      return;
    }

    const formData = new FormData();
    formData.append('jsonFile', jsonFile);

    setIsLoading(true);
    setStatus({ type: 'loading', message: 'Regenerating IDs on the server...' });

    try {
      // NOTE: Using the non-encrypted endpoint for local testing.
      // Update this URL if you deploy to a live server.
      const response = await axios.post('https://coding-factory-backend.onrender.com/api/process/regenerate-ids', formData, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'coding_questions_new_ids.json');
      document.body.appendChild(link);
      link.click();
      
      setStatus({ type: 'success', message: 'File with new IDs has been downloaded!' });
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('ID regeneration error:', error);
      setStatus({ type: 'error', message: 'An error occurred on the server. Please check the console.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-100 mb-2">Regenerate Question IDs</h2>
      <p className="text-gray-400 mb-6">Upload a `coding_questions.json` file to replace all unique identifiers (for questions, test cases, and code blocks) with new UUIDs.</p>
      
      <form onSubmit={handleSubmit}>
        <FileInput
          label="coding_questions.json"
          required
          acceptedTypes=".json"
          file={jsonFile}
          onChange={(e) => setJsonFile(e.target.files[0])}
          onClear={() => setJsonFile(null)}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 flex items-center justify-center gap-3 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? <Spinner /> : <DownloadIcon />}
          {isLoading ? 'Processing...' : 'Regenerate IDs & Download'}
        </button>
      </form>

      <StatusMessage type={status.type} message={status.message} />
    </div>
  );
};

export default IdChangerForm;
