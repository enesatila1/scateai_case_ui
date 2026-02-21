'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Scate AI
          </h1>
          <p className="text-xl text-gray-300">Create Original Songs & AI Voice Covers</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Generate Song Card */}
          <Link href="/generate-song">
            <div className="group relative bg-linear-to-br from-blue-600 to-blue-800 rounded-lg p-8 cursor-pointer hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 h-full">
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-6xl mb-4">🎵</div>
                <h2 className="text-3xl font-bold mb-3">Generate Song</h2>
                <p className="text-gray-200 text-center mb-6">
                  Create original songs using AI. Provide a prompt and lyrics to generate unique music.
                </p>
                <div className="inline-block px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg group-hover:bg-blue-50 transition-colors">
                  Create Song →
                </div>
              </div>
            </div>
          </Link>

          {/* Generate Vocal Card */}
          <Link href="/generate-vocal">
            <div className="group relative bg-linear-to-br from-purple-600 to-purple-800 rounded-lg p-8 cursor-pointer hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 h-full">
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-6xl mb-4">🎤</div>
                <h2 className="text-3xl font-bold mb-3">Generate Vocal</h2>
                <p className="text-gray-200 text-center mb-6">
                  Create AI voice covers. Upload a song and voice sample to generate unique vocal performances.
                </p>
                <div className="inline-block px-6 py-2 bg-white text-purple-600 font-semibold rounded-lg group-hover:bg-purple-50 transition-colors">
                  Create Cover →
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
