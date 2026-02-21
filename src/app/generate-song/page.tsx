'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

export default function GenerateSongPage() {
  const [prompt, setPrompt] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const handleGenerateSong = async (e: FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);
    setAudioUrl(null);
    setAudioBlob(null);

    try {
      const response = await fetch('/api/music/generate-song', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          lyrics: lyrics.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const blob = await response.blob();
      setAudioBlob(blob);

      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate song');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!audioBlob) return;

    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scate-ai-song-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Generate Song
            </h1>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <form onSubmit={handleGenerateSong} className="space-y-4">
              {/* Prompt */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Prompt *
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., An energetic pop song about summer love with upbeat melody"
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                  rows={4}
                  disabled={loading}
                />
              </div>

              {/* Lyrics */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Lyrics (Optional)
                </label>
                <textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Enter lyrics for the song (optional)"
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                  rows={6}
                  disabled={loading}
                />
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
                disabled={loading}
                className="w-full bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    🎵 Generate Song
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
                  ✓ Song generated successfully!
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 border-2 border-dashed border-slate-600 rounded-lg">
                <div className="text-4xl mb-3">🎵</div>
                <p className="text-center">
                  {loading ? 'Generating your song...' : 'Generated song will appear here'}
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
