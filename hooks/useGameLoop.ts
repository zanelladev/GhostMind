"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Direction, GameMode, GameState } from "@/lib/game/types";
import { createGame, step } from "@/lib/game/engine";
import { extractFeatures } from "@/lib/game/nb/features";
import { trainThreatClassifier } from "@/lib/game/nb/train";

const KEY_TO_DIR: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

export interface GameLoopApi {
  state: GameState;
  running: boolean;
  speed: number; // ticks per second
  mode: GameMode;
  settings: GameState["settings"];
  classifierSamples: number;
  proba: Record<string, number>;
  toggleRunning: () => void;
  reset: () => void;
  setMode: (mode: GameMode) => void;
  setSpeed: (speed: number) => void;
  setSettings: (settings: GameState["settings"]) => void;
}

export function useGameLoop(): GameLoopApi {
  // Train the Naive Bayes threat classifier once on mount (fast, in-browser).
  const classifier = useMemo(() => trainThreatClassifier(), []);

  const [state, setState] = useState<GameState>(() => createGame("ai"));
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(6);
  const [settings, setSettingsState] = useState<GameState["settings"]>(state.settings);
  const desiredDir = useRef<Direction | null>(null);

  // Capture arrow / WASD input for player mode.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = KEY_TO_DIR[e.key];
      if (dir) {
        desiredDir.current = dir;
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Fixed-timestep tick driven by `speed`.
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.status !== "playing") return prev;
        return step(prev, {
          desiredDir: desiredDir.current,
          classify: classifier.classify,
        });
      });
    }, 1000 / speed);
    return () => clearInterval(interval);
  }, [running, speed, classifier]);

  // Stop the loop automatically when the game ends.
  useEffect(() => {
    if (state.status !== "playing") setRunning(false);
  }, [state.status]);

  const toggleRunning = useCallback(() => setRunning((r) => !r), []);

  const reset = useCallback(() => {
    setRunning(false);
    desiredDir.current = null;
    setState((prev) => createGame(prev.mode, settings));
  }, [settings]);

  const setMode = useCallback((mode: GameMode) => {
    setState((prev) => (prev.mode === mode ? prev : { ...prev, mode }));
  }, []);

  const setSettings = useCallback((nextSettings: GameState["settings"]) => {
    setSettingsState(nextSettings);
    setRunning(false);
    desiredDir.current = null;
    setState((prev) => createGame(prev.mode, nextSettings));
  }, []);

  // Posterior probabilities for the threat badge, from the current state.
  const proba = classifier.proba(extractFeatures(state));

  return {
    state,
    running,
    speed,
    mode: state.mode,
    settings,
    classifierSamples: classifier.sampleCount,
    proba,
    toggleRunning,
    reset,
    setMode,
    setSpeed,
    setSettings,
  };
}
