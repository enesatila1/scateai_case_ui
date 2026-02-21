'use client';

import { useState, useRef, FormEvent, ChangeEvent, useEffect } from 'react';
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

  const handleRemoveSongFile = () => {
    setSongFile(null);
    if (songInputRef.current) {
      songInputRef.current.value = '';
    }
  };

  const handleRemoveVoiceFile = () => {
    setVoiceFile(null);
    if (voiceInputRef.current) {
      voiceInputRef.current.value = '';
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Back Button - Fixed Top Left */}
      <Link href="/" className="inline-block mb-8 text-gray-400 hover:text-white transition-colors">
        ← Back
      </Link>

      <div className="min-h-[calc(100vh-100px)] flex items-center justify-center">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-center mb-12">
            <h1 className="text-4xl font-bold bg-linear-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Generate Vocal Cover
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <form onSubmit={handleGenerateCover} className="space-y-4">
              {/* Song Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Song File *
                </label>
                <div className="relative">
                  <input
                    ref={songInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleSongFileChange}
                    disabled={loading || jobId !== null}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => songInputRef.current?.click()}
                    disabled={loading || jobId !== null}
                    className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700 border-2 border-dashed border-slate-600 rounded px-4 py-6 text-gray-300 transition-colors cursor-pointer flex flex-col items-center gap-2"
                  >
                    <span className="text-2xl">🎵</span>
                    <span className="text-sm">Click to upload song</span>
                    {songFile && <span className="text-xs text-green-400">✓ {songFile.name}</span>}
                  </button>
                </div>
                {songFile && (
                  <button
                    type="button"
                    onClick={handleRemoveSongFile}
                    className="text-xs text-red-400 hover:text-red-300 mt-2"
                  >
                    Remove file
                  </button>
                )}
              </div>

              {/* Voice Sample Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Voice Sample *
                </label>
                <div className="relative">
                  <input
                    ref={voiceInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleVoiceFileChange}
                    disabled={loading || jobId !== null}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => voiceInputRef.current?.click()}
                    disabled={loading || jobId !== null}
                    className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700 border-2 border-dashed border-slate-600 rounded px-4 py-6 text-gray-300 transition-colors cursor-pointer flex flex-col items-center gap-2"
                  >
                    <span className="text-2xl">🎤</span>
                    <span className="text-sm">Click to upload voice sample</span>
                    {voiceFile && <span className="text-xs text-green-400">✓ {voiceFile.name}</span>}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Minimum 10 seconds recommended</p>
                {voiceFile && (
                  <button
                    type="button"
                    onClick={handleRemoveVoiceFile}
                    className="text-xs text-red-400 hover:text-red-300 mt-2"
                  >
                    Remove file
                  </button>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-900/50 border border-red-700 rounded px-4 py-3 text-red-200 text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !songFile || !voiceFile || jobId !== null}
                className="w-full bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                {jobId ? (
                  <>
                    Processing... Check status on the right
                  </>
                ) : loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    🎤 Generate Cover
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Output Area */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-200 mb-4">Generated Output</h2>

            {audioUrl ? (
              <div className="space-y-4">
                {/* Audio Player */}
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-3">Audio Preview</p>
                  <audio
                    src={audioUrl}
                    controls
                    className="w-full"
                  />
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  className="w-full bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  📥 Download MP3
                </button>

                {/* Success Message */}
                <div className="bg-green-900/50 border border-green-700 rounded px-4 py-3 text-green-200 text-sm">
                  ✓ Cover generated successfully!
                </div>
              </div>
            ) : loading && jobStatus ? (
              <div className="space-y-4">
                {/* Progress Container */}
                <div className="bg-slate-700/50 rounded-lg p-6 space-y-4">
                  {/* Spinner */}
                  <div className="flex justify-center mb-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">
                      {jobStatus.status === 'pending' ? '⏳ Queued' : '⚙️ Processing'}
                    </p>
                    <p className="text-gray-300 font-medium">
                      {jobStatus.progress || 'Starting processing...'}
                    </p>
                  </div>

                  {/* Job ID */}
                  <div className="bg-slate-800/50 rounded px-3 py-2">
                    <p className="text-xs text-gray-500">Job ID</p>
                    <p className="text-xs text-gray-400 font-mono break-all">{jobId}</p>
                  </div>

                  {/* Estimated Time Info */}
                  <div className="bg-slate-800/50 rounded px-3 py-2 border border-slate-600">
                    <p className="text-xs text-gray-400">
                      ⏱️ This may take a few minutes. Please don't close this page.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 border-2 border-dashed border-slate-600 rounded-lg">
                <div className="text-4xl mb-3">🎤</div>
                <p className="text-center">Generated cover will appear here</p>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </main>
  );
}
