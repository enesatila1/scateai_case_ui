'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-7xl font-bold mb-4">Scate AI</h1>
          <p className="text-lg text-gray-400">Create Original Songs & AI Voice Covers</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Generate Song Card */}
          <Link href="/generate-song">
            <div className="group relative bg-white text-black rounded-lg p-8 cursor-pointer hover:bg-gray-100 transition-all duration-300 h-full flex flex-col items-center justify-center min-h-60">
              <div className="text-5xl mb-4">🎵</div>
              <h2 className="text-2xl font-bold mb-3">Generate Song</h2>
              <p className="text-center mb-6 text-gray-700 text-sm">
                Create original songs using AI
              </p>
            </div>
          </Link>

          {/* Generate Vocal Card */}
          <Link href="/generate-vocal">
            <div className="group relative bg-white text-black rounded-lg p-8 cursor-pointer hover:bg-gray-100 transition-all duration-300 h-full flex flex-col items-center justify-center min-h-60">
              <div className="text-5xl mb-4">🎤</div>
              <h2 className="text-2xl font-bold mb-3">Generate Vocal</h2>
              <p className="text-center mb-6 text-gray-700 text-sm">
                Create AI voice covers
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
