import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowLeft, Play, AlertCircle, Settings, Check } from 'lucide-react';
import Hls from 'hls.js';
import { useTitleDetail } from '@/hooks/useAnime';
import { posterUrl } from '@/lib/anilibria';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@adaptive-ai/sdk/client';
import { useMutation } from '@tanstack/react-query';
import { client } from '@/lib/client';
import type { ReleaseEpisode } from '@/types/anime';

type Quality = '1080' | '720' | '480';

const QUALITY_LABELS: Record<Quality, string> = {
  '1080': '1080p HD',
  '720': '720p HD',
  '480': '480p',
};

const QUALITY_COLORS: Record<Quality, string> = {
  '1080': 'text-purple-400',
  '720': 'text-blue-400',
  '480': 'text-gray-400',
};

function getAvailableQualities(ep: ReleaseEpisode): Quality[] {
  const q: Quality[] = [];
  if (ep.hls_1080) q.push('1080');
  if (ep.hls_720) q.push('720');
  if (ep.hls_480) q.push('480');
  return q;
}

function getStreamUrl(ep: ReleaseEpisode, quality: Quality): string {
  if (quality === '1080' && ep.hls_1080) return ep.hls_1080;
  if (quality === '720' && ep.hls_720) return ep.hls_720;
  if (quality === '480' && ep.hls_480) return ep.hls_480;
  // fallback to best available
  return ep.hls_1080 || ep.hls_720 || ep.hls_480 || '';
}

function getBestQuality(ep: ReleaseEpisode): Quality {
  if (ep.hls_1080) return '1080';
  if (ep.hls_720) return '720';
  return '480';
}

// Persist quality preference in localStorage
const QUALITY_KEY = 'anistream_quality';
function getSavedQuality(): Quality {
  try {
    const q = localStorage.getItem(QUALITY_KEY) as Quality | null;
    if (q && ['1080', '720', '480'].includes(q)) return q;
  } catch (e) {
    // ignore
    void e;
  }
  return '1080';
}
function saveQuality(q: Quality) {
  try {
    localStorage.setItem(QUALITY_KEY, q);
  } catch (e) {
    // ignore
    void e;
  }
}

export function WatchPage() {
  const { id, episode } = useParams<{ id: string; episode: string }>();
  const animeId = Number(id);
  const epNum = Number(episode);
  const navigate = useNavigate();
  const auth = useAuth({ required: false });

  const { data: title, isLoading } = useTitleDetail(animeId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [hlsError, setHlsError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [quality, setQuality] = useState<Quality>(getSavedQuality);
  const [qualityMenuOpen, setQualityMenuOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const historyMutation = useMutation({
    mutationFn: () => client.addToHistory(animeId, epNum),
  });

  const episodes = (title?.episodes ?? []).slice().sort((a, b) => a.ordinal - b.ordinal);
  const currentEp = episodes.find((e) => e.ordinal === epNum);
  const epIndex = episodes.findIndex((e) => e.ordinal === epNum);
  const prevEp = epIndex > 0 ? episodes[epIndex - 1] : null;
  const nextEp = epIndex < episodes.length - 1 ? episodes[epIndex + 1] : null;

  const availableQualities = currentEp ? getAvailableQualities(currentEp) : [];

  // When episode changes, pick best available quality (respecting saved pref)
  useEffect(() => {
    if (!currentEp) return;
    const saved = getSavedQuality();
    const avail = getAvailableQualities(currentEp);
    if (avail.includes(saved)) {
      setQuality(saved);
    } else {
      setQuality(getBestQuality(currentEp));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEp?.id]);

  const streamUrl = currentEp ? getStreamUrl(currentEp, quality) : '';

  const loadStream = useCallback((url: string) => {
    if (!url || !videoRef.current) return;

    // Save current time if switching quality mid-playback
    const savedTime = videoRef.current.currentTime || 0;
    const wasPaused = videoRef.current.paused;

    setHlsError(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        startPosition: savedTime > 1 ? savedTime : -1,
      });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsReady(true);
        setSwitching(false);
        if (savedTime > 1 && videoRef.current) {
          videoRef.current.currentTime = savedTime;
        }
        if (!wasPaused && videoRef.current) {
          videoRef.current.play().catch(() => {});
        }
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setHlsError(true);
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = url;
      if (savedTime > 1) videoRef.current.currentTime = savedTime;
      setIsReady(true);
      setSwitching(false);
    } else {
      setHlsError(true);
      setSwitching(false);
    }
  }, []);

  // Load stream when URL or quality changes
  useEffect(() => {
    if (!streamUrl) return;
    setIsReady(false);
    loadStream(streamUrl);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl, loadStream]);

  // Track watch history
  useEffect(() => {
    if (auth.status === 'authenticated' && isReady) {
      historyMutation.mutate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, auth.status]);

  // Close quality menu on outside click
  useEffect(() => {
    if (!qualityMenuOpen) return;
    const handler = () => setQualityMenuOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [qualityMenuOpen]);

  const handleQualityChange = (q: Quality) => {
    if (q === quality) { setQualityMenuOpen(false); return; }
    setSwitching(true);
    saveQuality(q);
    setQuality(q);
    setQualityMenuOpen(false);
  };

  if (isLoading) return <LoadingState />;
  if (!title) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-gray-400">
      Аниме не найдено
    </div>
  );

  const name = title.name.main || title.name.english || '';
  const img = posterUrl(title);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
          {/* Back */}
          <Link
            to={`/anime/${animeId}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {name}
          </Link>

          <div className="flex flex-col xl:flex-row gap-6">
            {/* Player */}
            <div className="flex-1 min-w-0">
              <div className="player-container mb-4 relative">
                {hlsError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-[#0d0d15]">
                    <AlertCircle className="w-12 h-12 text-red-400" />
                    <p className="text-gray-400 text-center px-4">
                      Не удалось загрузить видео. Возможно, оно недоступно в вашем регионе.
                    </p>
                    <a
                      href={`https://anilibria.top/anime/releases/${title.alias}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm transition-colors"
                    >
                      Смотреть на AniLibria
                    </a>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      controls
                      autoPlay
                      className="w-full h-full"
                      poster={img}
                      onError={() => setHlsError(true)}
                    />
                    {/* Switching overlay */}
                    {switching && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                          <span className="text-sm text-white font-medium">
                            Переключение на {QUALITY_LABELS[quality]}...
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Episode info + controls */}
              <div className="glass rounded-xl border border-white/5 p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-xs text-purple-400 font-medium mb-1">{name}</p>
                    <h2 className="text-white font-bold text-lg">
                      Серия {epNum}
                      {currentEp?.name && ` — ${currentEp.name}`}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    {/* Quality selector */}
                    {availableQualities.length > 0 && (
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setQualityMenuOpen((v) => !v)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg glass border transition-all text-sm font-medium ${
                            qualityMenuOpen
                              ? 'border-purple-500/50 text-purple-300'
                              : 'border-white/10 text-gray-300 hover:text-white hover:border-white/20'
                          }`}
                          title="Качество видео"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span className={QUALITY_COLORS[quality]}>{QUALITY_LABELS[quality]}</span>
                        </button>

                        {qualityMenuOpen && (
                          <div className="absolute right-0 bottom-full mb-2 w-44 glass-strong rounded-xl border border-purple-500/20 shadow-2xl overflow-hidden z-50">
                            <div className="px-3 py-2 border-b border-white/5">
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Качество</p>
                            </div>
                            {(['1080', '720', '480'] as Quality[]).map((q) => {
                              const available = availableQualities.includes(q);
                              const isActive = quality === q;
                              return (
                                <button
                                  key={q}
                                  disabled={!available}
                                  onClick={() => handleQualityChange(q)}
                                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-all ${
                                    !available
                                      ? 'opacity-30 cursor-not-allowed text-gray-600'
                                      : isActive
                                      ? 'bg-purple-500/15 text-white'
                                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={available ? QUALITY_COLORS[q] : ''}>
                                      {QUALITY_LABELS[q]}
                                    </span>
                                    {q === '1080' && available && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                                        ЛУЧШЕЕ
                                      </span>
                                    )}
                                    {!available && (
                                      <span className="text-[10px] text-gray-600">Недоступно</span>
                                    )}
                                  </div>
                                  {isActive && <Check className="w-3.5 h-3.5 text-purple-400" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Prev / Next */}
                    <button
                      onClick={() => prevEp && navigate(`/anime/${animeId}/watch/${prevEp.ordinal}`)}
                      disabled={!prevEp}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg glass border border-white/10 text-sm text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Пред.
                    </button>
                    <button
                      onClick={() => nextEp && navigate(`/anime/${animeId}/watch/${nextEp.ordinal}`)}
                      disabled={!nextEp}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm text-white disabled:opacity-30 transition-colors"
                    >
                      След.
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Episode List Sidebar */}
            <div className="xl:w-72 xl:flex-shrink-0">
              <div className="glass rounded-xl border border-white/5 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5">
                  <h3 className="font-semibold text-white text-sm">
                    Все серии ({episodes.length})
                  </h3>
                </div>
                <div className="overflow-y-auto max-h-[60vh] xl:max-h-[calc(100vh-20rem)]">
                  {episodes.map((ep) => {
                    const isCurrent = ep.ordinal === epNum;
                    const epQualities = getAvailableQualities(ep);
                    const best = epQualities[0];
                    return (
                      <Link
                        key={ep.id}
                        to={`/anime/${animeId}/watch/${ep.ordinal}`}
                        className={`flex items-center gap-3 px-4 py-3 border-b border-white/5 transition-all hover:bg-white/5 ${
                          isCurrent ? 'bg-purple-500/10 border-l-2 border-l-purple-500' : ''
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCurrent ? 'bg-purple-500' : 'bg-white/5'
                        }`}>
                          {isCurrent ? (
                            <Play className="w-3 h-3 text-white fill-white" />
                          ) : (
                            <span className="text-xs text-gray-500">{ep.ordinal}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium truncate ${isCurrent ? 'text-white' : 'text-gray-400'}`}>
                            Серия {ep.ordinal}
                          </p>
                          {ep.name && (
                            <p className="text-xs text-gray-600 truncate">{ep.name}</p>
                          )}
                        </div>
                        {best && (
                          <span className={`text-[10px] font-semibold flex-shrink-0 ${QUALITY_COLORS[best]}`}>
                            {best}p
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-16">
      <Navbar />
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="skeleton h-6 w-32 rounded mb-4" />
        <div className="skeleton aspect-video rounded-xl mb-4" />
        <div className="skeleton h-20 rounded-xl" />
      </div>
    </div>
  );
}
