'use client';

import { useState, useRef, ChangeEvent, useEffect, FormEvent } from 'react';
import Link from 'next/link';

interface JobStatus {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: string;
  error?: string;
}

export default function GenerateVocalPage() {
  const [songFile, setSongFile] = useState<File | null>(null);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  // Job queue states
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);

  const songInputRef = useRef<HTMLInputElement>(null);
  const voiceInputRef = useRef<HTMLInputElement>(null);

  const handleSongFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['audio/mpeg', 'audio/wav', 'audio/mp3'].includes(file.type)) {
        setError('Please upload a valid audio file (MP3 or WAV)');
        return;
      }
      setSongFile(file);
      setError(null);
    }
  };

  const handleVoiceFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['audio/mpeg', 'audio/wav', 'audio/mp3'].includes(file.type)) {
        setError('Please upload a valid audio file (MP3 or WAV)');
        return;
      }
      setVoiceFile(file);
      setError(null);
    }
  };

  const handleGenerateCover = async (e: FormEvent) => {
    e.preventDefault();

    if (!songFile || !voiceFile) {
      setError('Please upload both song and voice sample files');
      return;
    }

    setLoading(true);
    setError(null);
    setAudioUrl(null);
    setAudioBlob(null);
    setJobId(null);
    setJobStatus(null);

    try {
      const formData = new FormData();
      formData.append('song_file', songFile);
      formData.append('voice_sample', voiceFile);

      const response = await fetch('/api/music/generate-cover', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setJobId(data.job_id);
      setJobStatus({ job_id: data.job_id, status: 'pending' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit job');
      setLoading(false);
    }
  };

  // Poll for job status
  useEffect(() => {
    if (!jobId || !loading) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/music/status/${jobId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }

        const status: JobStatus = await response.json();
        setJobStatus(status);

        // Job completed
        if (status.status === 'completed') {
          await fetchResult(jobId);
          setLoading(false);
          clearInterval(interval);
        }
        // Job failed
        else if (status.status === 'failed') {
          setError(status.error || 'Job failed');
          setLoading(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Status poll error:', err);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [jobId, loading]);

  const fetchResult = async (jId: string) => {
    try {
      const response = await fetch(`/api/music/result/${jId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch result');
      }

      const blob = await response.blob();
      setAudioBlob(blob);

      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch result');
    }
  };

  const handleDownload = () => {
    if (!audioBlob) return;

    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scate-ai-cover-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <Link href="/" className="text-gray-400 hover:text-white mb-12 absolute top-8 left-8">
        ← Back
      </Link>

      <div className="max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-12">Voice Cover</h1>

        {audioUrl ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded">
              <audio src={audioUrl} controls className="w-full" />
            </div>
            <button
              onClick={handleDownload}
              className="w-full bg-white text-black font-semibold py-3 rounded hover:bg-gray-200 transition"
            >
              Download
            </button>
          </div>
        ) : loading && jobStatus ? (
          <div className="space-y-6 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto"></div>
            <p className="text-lg">{jobStatus.progress || 'Processing...'}</p>
          </div>
        ) : (
          <form onSubmit={handleGenerateCover} className="space-y-6">
            <div>
              <input
                ref={songInputRef}
                type="file"
                accept="audio/*"
                onChange={handleSongFileChange}
                disabled={loading}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => songInputRef.current?.click()}
                disabled={loading}
                className="w-full bg-white text-black font-semibold py-3 rounded hover:bg-gray-200 disabled:bg-gray-400 transition"
              >
                {songFile ? `✓ ${songFile.name}` : 'Upload Song'}
              </button>
            </div>

            <div>
              <input
                ref={voiceInputRef}
                type="file"
                accept="audio/*"
                onChange={handleVoiceFileChange}
                disabled={loading}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => voiceInputRef.current?.click()}
                disabled={loading}
                className="w-full bg-white text-black font-semibold py-3 rounded hover:bg-gray-200 disabled:bg-gray-400 transition"
              >
                {voiceFile ? `✓ ${voiceFile.name}` : 'Upload Voice'}
              </button>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={!songFile || !voiceFile || loading}
              className="w-full bg-white text-black font-semibold py-3 rounded hover:bg-gray-200 disabled:bg-gray-400 transition"
            >
              {loading ? 'Submitting...' : 'Generate'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
