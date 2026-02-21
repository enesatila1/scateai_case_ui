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
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <Link href="/" className="text-gray-400 hover:text-white mb-12 absolute top-8 left-8">
        ← Back
      </Link>

      <div className="max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-12">Generate Song</h1>

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
        ) : loading ? (
          <div className="space-y-6 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto"></div>
            <p className="text-lg">Generating...</p>
          </div>
        ) : (
          <form onSubmit={handleGenerateSong} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the song you want..."
                className="w-full bg-white text-black border-none rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                rows={4}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">Lyrics (Optional)</label>
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Enter lyrics (optional)..."
                className="w-full bg-white text-black border-none rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                rows={6}
                disabled={loading}
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full bg-white text-black font-semibold py-3 rounded hover:bg-gray-200 disabled:bg-gray-400 transition"
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
