/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import { Button } from './ui/Button';
import { Heading } from './ui/Heading';
import { Text } from './ui/Text';
import { Row } from './ui/Row';
import { Bug } from 'lucide-preact';

interface WhacAMoleProps {
  onGameOver?: (score: number) => void;
}

export function WhacAMole({ onGameOver }: WhacAMoleProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver'>('idle');
  const [activeMole, setActiveMole] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const moleRef = useRef<number | null>(null);
  const scoreRef = useRef(0);

  const startGame = useCallback(() => {
    scoreRef.current = 0;
    setScore(0);
    setTimeLeft(30);
    setGameState('playing');
    setActiveMole(null);
  }, []);

  const whackMole = (index: number) => {
    if (gameState === 'playing' && index === activeMole) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setActiveMole(null);
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
        const nextMole = Math.floor(Math.random() * 9);
        setActiveMole(nextMole);
        const nextDelay = Math.max(400, 1000 - scoreRef.current * 20); // Get faster as score increases
        moleRef.current = window.setTimeout(moveMole, nextDelay);
      };

      moveMole();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (moleRef.current) clearTimeout(moleRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (moleRef.current) clearTimeout(moleRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'gameOver' && onGameOver) {
      onGameOver(score);
    }
  }, [gameState, score, onGameOver]);

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="w-full text-center">
        <Row justify="between" className="mb-2 w-full gap-8">
          <Text className="text-xl font-bold">Score: {score}</Text>
          <Text className="text-xl font-bold">Time: {timeLeft}s</Text>
        </Row>
      </div>

      <div className="bg-bg-muted grid grid-cols-3 gap-4 rounded-xl p-6 shadow-inner">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="border-border-base relative h-20 w-20 cursor-pointer overflow-hidden rounded-full border-4 bg-amber-900 shadow-md"
            onClick={() => whackMole(i)}
          >
            <div
              className={`absolute inset-0 flex items-center justify-center transition-transform duration-100 ease-in-out ${
                activeMole === i ? 'translate-y-0' : 'translate-y-full'
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-900 bg-amber-100 shadow-sm dark:bg-amber-800">
                <Bug size={32} className="text-amber-900 dark:text-amber-200" />
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-amber-900" />
          </div>
        ))}
      </div>

      {gameState === 'idle' && <Button onClick={startGame}>Start Game</Button>}

      {gameState === 'gameOver' && (
        <div className="flex flex-col items-center gap-4">
          <Heading level={2}>Game Over!</Heading>
          <Text>Final Score: {score}</Text>
          <Button onClick={startGame}>Play Again</Button>
        </div>
      )}

      {gameState === 'playing' && (
        <Button variant="ghost" onClick={() => setGameState('idle')}>
          Reset
        </Button>
      )}
    </div>
  );
}
