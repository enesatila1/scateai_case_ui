'use client';

import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';

export default function GenerateVocalPage() {
  const [songFile, setSongFile] = useState<File | null>(null);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

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

      const blob = await response.blob();
      setAudioBlob(blob);

      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate cover');
    } finally {
      setLoading(false);
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
                    disabled={loading}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => songInputRef.current?.click()}
                    disabled={loading}
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
                    disabled={loading}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => voiceInputRef.current?.click()}
                    disabled={loading}
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
                disabled={loading || !songFile || !voiceFile}
                className="w-full bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating...
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
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 border-2 border-dashed border-slate-600 rounded-lg">
                <div className="text-4xl mb-3">🎤</div>
                <p className="text-center">
                  {loading ? 'Generating your cover...' : 'Generated cover will appear here'}
                </p>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </main>
  );
}
