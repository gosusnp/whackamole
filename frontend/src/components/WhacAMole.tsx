/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import { Button } from './ui/Button';
import { Heading } from './ui/Heading';
import { Text } from './ui/Text';
import { Row } from './ui/Row';
import { Input } from './ui/Input';
import { Bug, Trophy, Target, Zap } from 'lucide-preact';

interface WhacAMoleProps {
  onGameOver?: (score: number) => void;
}

interface ScoreEntry {
  name: string;
  score: number;
  date: string;
  timestamp: number;
}

const LEADERBOARD_KEY = 'whac-a-mole-leaderboard';

export function WhacAMole({ onGameOver }: WhacAMoleProps) {
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [totalReactionTime, setTotalReactionTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver'>('idle');
  const [activeMole, setActiveMole] = useState<number | null>(null);
  const [lastMole, setLastMole] = useState<number | null>(null);
  const [moleAppearTime, setMoleAppearTime] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [playerName, setPlayerName] = useState(localStorage.getItem('whac-player-name') || '');
  const [isHighScore, setIsHighScore] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  const timerRef = useRef<number | null>(null);
  const moleRef = useRef<number | null>(null);
  const lastMoleClearRef = useRef<number | null>(null);

  // Load leaderboard
  useEffect(() => {
    const saved = localStorage.getItem(LEADERBOARD_KEY);
    if (saved) {
      try {
        setLeaderboard(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse leaderboard', e);
      }
    }
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setHits(0);
    setMisses(0);
    setTotalReactionTime(0);
    setTimeLeft(30);
    setGameState('playing');
    setActiveMole(null);
    setLastMole(null);
    setMoleAppearTime(null);
    setIsHighScore(false);
    setHasSaved(false);
  }, []);

  const whackMole = (index: number) => {
    if (gameState !== 'playing') return;

    if (index === activeMole || index === lastMole) {
      const now = Date.now();
      const appearTime = moleAppearTime;
      if (appearTime) {
        setTotalReactionTime((t) => t + (now - appearTime));
      }
      setScore((s) => s + 1);
      setHits((h) => h + 1);

      setActiveMole(null);
      setLastMole(null);
      if (lastMoleClearRef.current) {
        window.clearTimeout(lastMoleClearRef.current);
        lastMoleClearRef.current = null;
      }
    } else {
      setMisses((m) => m + 1);
    }
  };

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setGameState('gameOver');
            return 0;
          }
          return t - 1;
        });
      }, 1000);

      const moveMole = () => {
        setActiveMole((prev) => {
          if (prev !== null) {
            setLastMole(prev);
            if (lastMoleClearRef.current) window.clearTimeout(lastMoleClearRef.current);
            lastMoleClearRef.current = window.setTimeout(() => {
              setLastMole(null);
              lastMoleClearRef.current = null;
            }, 100);
          }
          return null;
        });

        const nextMole = Math.floor(Math.random() * 9);
        setActiveMole(nextMole);
        setMoleAppearTime(Date.now());
        const nextDelay = Math.max(400, 1000 - score * 20);
        moleRef.current = window.setTimeout(moveMole, nextDelay);
      };

      moveMole();
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (moleRef.current) window.clearTimeout(moleRef.current);
      if (lastMoleClearRef.current) window.clearTimeout(lastMoleClearRef.current);
    }

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (moleRef.current) window.clearTimeout(moleRef.current);
      if (lastMoleClearRef.current) window.clearTimeout(lastMoleClearRef.current);
    };
  }, [gameState, score]);

  useEffect(() => {
    if (gameState === 'gameOver') {
      const isTopTen = leaderboard.length < 10 || score > (leaderboard[9]?.score || 0);
      if (isTopTen && score > 0) {
        setIsHighScore(true);
      }
      if (onGameOver) onGameOver(score);
    }
  }, [gameState, score, leaderboard, onGameOver]);

  const saveScore = () => {
    if (hasSaved) return;

    const now = new Date();
    const newEntry: ScoreEntry = {
      name: playerName.trim() || 'Anonymous',
      score,
      date:
        now.toLocaleDateString() +
        ' ' +
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: now.getTime(),
    };
    const newLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score || b.timestamp - a.timestamp)
      .slice(0, 10);

    setLeaderboard(newLeaderboard);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(newLeaderboard));
    localStorage.setItem('whac-player-name', playerName.trim());
    setHasSaved(true);
    setIsHighScore(false);
    setGameState('idle');
  };

  const totalAttempts = hits + misses;
  const accuracy = totalAttempts > 0 ? Math.round((hits / totalAttempts) * 100) : 0;
  const avgReaction = hits > 0 ? Math.round(totalReactionTime / hits) : 0;

  return (
    <div className="relative z-20 flex flex-col items-center gap-6 p-2 pt-12">
      {gameState === 'playing' ? (
        <>
          <div className="w-full px-4 text-center">
            <Row justify="between" className="mb-2 w-full">
              <div className="flex flex-col items-start">
                <Text muted className="text-sm">
                  Score
                </Text>
                <Text className="font-mono text-2xl font-bold">{score}</Text>
              </div>
              <div className="flex flex-col items-center">
                <Text muted className="text-sm">
                  Time
                </Text>
                <Text
                  className={`font-mono text-2xl font-bold ${timeLeft < 10 ? 'text-red-500' : ''}`}
                >
                  {timeLeft}s
                </Text>
              </div>
              <div className="flex flex-col items-end">
                <Text muted className="text-sm">
                  Accuracy
                </Text>
                <Text className="font-mono text-2xl font-bold">{accuracy}%</Text>
              </div>
            </Row>
          </div>

          <div className="bg-bg-muted border-border-base grid grid-cols-3 gap-3 rounded-xl border p-4 shadow-inner">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="border-border-base relative h-16 w-16 cursor-pointer overflow-hidden rounded-full border-4 bg-amber-900 shadow-md transition-transform active:scale-95 sm:h-20 sm:w-20"
                onClick={() => whackMole(i)}
              >
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-transform duration-100 ease-in-out ${
                    activeMole === i ? 'translate-y-0' : 'translate-y-full'
                  }`}
                >
                  <div className="pointer-events-none flex h-12 w-12 items-center justify-center rounded-full border-2 border-amber-900 bg-amber-100 shadow-sm sm:h-14 sm:w-14 dark:bg-amber-800">
                    <Bug size={28} className="text-amber-900 dark:text-amber-200" />
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-amber-900/50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]" />
              </div>
            ))}
          </div>
          <Button variant="ghost" onClick={() => setGameState('idle')}>
            Quit
          </Button>
        </>
      ) : gameState === 'gameOver' ? (
        <div className="animate-in fade-in zoom-in flex w-full max-w-sm flex-col items-center gap-6 duration-300">
          <div className="text-center">
            <Heading level={1} className="mb-2 text-4xl">
              Game Over!
            </Heading>
            <Text muted className="text-lg">
              You squashed {score} bugs!
            </Text>
          </div>

          <div className="grid w-full grid-cols-2 gap-4">
            <div className="bg-bg-muted border-border-base flex flex-col items-center rounded-lg border p-4">
              <Target className="mb-1 text-blue-500" size={20} />
              <Text muted className="text-sm">
                Accuracy
              </Text>
              <Text className="text-xl font-bold">{accuracy}%</Text>
            </div>
            <div className="bg-bg-muted border-border-base flex flex-col items-center rounded-lg border p-4">
              <Zap className="mb-1 text-yellow-500" size={20} />
              <Text muted className="text-sm">
                Reaction
              </Text>
              <Text className="text-xl font-bold">{avgReaction}ms</Text>
            </div>
          </div>

          {isHighScore ? (
            <div className="flex w-full flex-col gap-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
              <Row items="center" gap={2}>
                <Trophy className="text-amber-500" size={20} />
                <Text className="font-bold text-amber-700 dark:text-amber-400">
                  New High Score!
                </Text>
              </Row>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your name"
                  value={playerName}
                  onValueChange={setPlayerName}
                  className="flex-1"
                />
                <Button onClick={saveScore} disabled={hasSaved}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-2">
              <Button onClick={startGame} className="w-full">
                Play Again
              </Button>
              <Button variant="ghost" onClick={() => setGameState('idle')} className="w-full">
                Leaderboard
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex w-full max-w-sm flex-col items-center gap-6">
          <div className="text-center">
            <div className="relative z-50 mx-auto mb-10 flex h-20 w-20 animate-bounce items-center justify-center rounded-full border-4 border-amber-900 bg-amber-100 shadow-lg dark:bg-amber-800">
              <Bug size={40} className="text-amber-900 dark:text-amber-200" />
            </div>
            <Heading level={2}>Whac-A-Mole</Heading>
            <Text muted>Squash as many bugs as you can in 30 seconds!</Text>
          </div>

          <div className="w-full">
            <Row items="center" gap={2} className="mb-3 px-1">
              <Trophy size={18} className="text-amber-500" />
              <Heading level={3} noMargin>
                Top 10 Leaderboard
              </Heading>
            </Row>
            <div className="bg-bg-muted border-border-base overflow-hidden rounded-lg border">
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full border-separate border-spacing-0 text-left text-sm">
                  <thead className="bg-bg-surface sticky top-0 z-10">
                    <tr>
                      <th className="border-border-base border-b px-4 py-2 font-semibold">Rank</th>
                      <th className="border-border-base border-b px-4 py-2 font-semibold">Name</th>
                      <th className="border-border-base border-b px-4 py-2 text-right font-semibold">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.length > 0 ? (
                      leaderboard.map((entry, i) => (
                        <tr key={i} className="hover:bg-bg-surface/50 transition-colors">
                          <td className="text-muted border-border-base border-b px-4 py-2 font-mono last:border-0">
                            <div className="flex flex-col">
                              <span>#{i + 1}</span>
                              <span className="text-[10px] whitespace-nowrap opacity-70">
                                {entry.date}
                              </span>
                            </div>
                          </td>
                          <td className="border-border-base border-b px-4 py-2 font-medium last:border-0">
                            {entry.name}
                          </td>
                          <td className="border-border-base border-b px-4 py-2 text-right text-lg font-bold last:border-0">
                            {entry.score}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="p-8 text-center">
                          <Text muted>No high scores yet. Be the first!</Text>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <Button onClick={startGame} className="w-full">
            Start Game
          </Button>
        </div>
      )}
    </div>
  );
}
