"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const CANVAS_W = 800;
const CANVAS_H = 500;
const PADDLE_W = 12;
const PADDLE_H = 90;
const BALL_SIZE = 10;
const WIN_SCORE = 11;
const AI_SPEED = 5.5;

type GameState = "idle" | "playing" | "scored" | "over";

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Paddle {
  y: number;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function PingPongGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>("idle");
  const playerRef = useRef<Paddle>({ y: CANVAS_H / 2 - PADDLE_H / 2 });
  const aiRef = useRef<Paddle>({ y: CANVAS_H / 2 - PADDLE_H / 2 });
  const ballRef = useRef<Ball>({ x: CANVAS_W / 2, y: CANVAS_H / 2, vx: 0, vy: 0 });
  const playerScoreRef = useRef(0);
  const aiScoreRef = useRef(0);
  const keysRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number>(0);
  const scoredTimerRef = useRef(0);

  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>("idle");

  const resetBall = useCallback((direction: 1 | -1) => {
    const angle = (Math.random() * 0.8 - 0.4); // -0.4 to 0.4 rad
    const speed = 7;
    ballRef.current = {
      x: CANVAS_W / 2,
      y: CANVAS_H / 2,
      vx: speed * direction * Math.cos(angle),
      vy: speed * Math.sin(angle),
    };
  }, []);

  const serve = useCallback(() => {
    stateRef.current = "playing";
    setGameState("playing");
    playerScoreRef.current = 0;
    aiScoreRef.current = 0;
    setPlayerScore(0);
    setAiScore(0);
    playerRef.current.y = CANVAS_H / 2 - PADDLE_H / 2;
    aiRef.current.y = CANVAS_H / 2 - PADDLE_H / 2;
    const dir = Math.random() > 0.5 ? 1 : -1;
    resetBall(dir as 1 | -1);
  }, [resetBall]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = stateRef.current;
    const player = playerRef.current;
    const ai = aiRef.current;
    const ball = ballRef.current;

    // Input handling
    const keys = keysRef.current;
    const paddleSpeed = 8;
    if (keys.has("w") || keys.has("W")) {
      player.y = Math.max(0, player.y - paddleSpeed);
    }
    if (keys.has("s") || keys.has("S")) {
      player.y = Math.min(CANVAS_H - PADDLE_H, player.y + paddleSpeed);
    }

    if (state === "playing") {
      // Move ball
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Top/bottom wall bounce
      if (ball.y <= 0) {
        ball.y = 0;
        ball.vy = -ball.vy;
      }
      if (ball.y >= CANVAS_H - BALL_SIZE) {
        ball.y = CANVAS_H - BALL_SIZE;
        ball.vy = -ball.vy;
      }

      // Player paddle collision (left)
      if (
        ball.x <= PADDLE_W &&
        ball.y + BALL_SIZE >= player.y &&
        ball.y <= player.y + PADDLE_H
      ) {
        const hitPos = (ball.y + BALL_SIZE / 2 - player.y) / PADDLE_H;
        const angle = (hitPos - 0.5) * Math.PI * 0.6;
        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy) * 1.03;
        ball.x = PADDLE_W;
        ball.vx = speed * Math.cos(angle);
        ball.vy = speed * Math.sin(angle);
      }

      // AI paddle collision (right)
      if (
        ball.x + BALL_SIZE >= CANVAS_W - PADDLE_W &&
        ball.y + BALL_SIZE >= ai.y &&
        ball.y <= ai.y + PADDLE_H
      ) {
        const hitPos = (ball.y + BALL_SIZE / 2 - ai.y) / PADDLE_H;
        const angle = Math.PI - (hitPos - 0.5) * Math.PI * 0.6;
        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy) * 1.03;
        ball.x = CANVAS_W - PADDLE_W - BALL_SIZE;
        ball.vx = speed * Math.cos(angle);
        ball.vy = speed * Math.sin(angle);
      }

      // Scoring
      if (ball.x < -BALL_SIZE) {
        aiScoreRef.current += 1;
        setAiScore(aiScoreRef.current);
        if (aiScoreRef.current >= WIN_SCORE && aiScoreRef.current - playerScoreRef.current >= 2) {
          stateRef.current = "over";
          setGameState("over");
        } else {
          stateRef.current = "scored";
          setGameState("scored");
          scoredTimerRef.current = 60;
          resetBall(1);
        }
      }
      if (ball.x > CANVAS_W) {
        playerScoreRef.current += 1;
        setPlayerScore(playerScoreRef.current);
        if (playerScoreRef.current >= WIN_SCORE && playerScoreRef.current - aiScoreRef.current >= 2) {
          stateRef.current = "over";
          setGameState("over");
        } else {
          stateRef.current = "scored";
          setGameState("scored");
          scoredTimerRef.current = 60;
          resetBall(-1);
        }
      }

      // AI movement
      const targetY = ball.y - PADDLE_H / 2 + BALL_SIZE / 2;
      ai.y = lerp(ai.y, targetY, 0.08);
      ai.y = Math.max(0, Math.min(CANVAS_H - PADDLE_H, ai.y));
    }

    if (state === "scored") {
      scoredTimerRef.current -= 1;
      if (scoredTimerRef.current <= 0) {
        stateRef.current = "playing";
        setGameState("playing");
      }
    }

    // Draw
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Center line
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_W / 2, 0);
    ctx.lineTo(CANVAS_W / 2, CANVAS_H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Paddles
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(0, player.y, PADDLE_W, PADDLE_H);
    ctx.fillRect(CANVAS_W - PADDLE_W, ai.y, PADDLE_W, PADDLE_H);

    // Ball
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(ball.x + BALL_SIZE / 2, ball.y + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    // Score
    ctx.font = "bold 36px 'Geist', 'Inter', system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.textAlign = "center";
    ctx.fillText(String(playerScoreRef.current), CANVAS_W / 2 - 60, 50);
    ctx.fillText(String(aiScoreRef.current), CANVAS_W / 2 + 60, 50);

    if (state === "idle") {
      ctx.fillStyle = "rgba(15,23,42,0.7)";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 28px 'Geist', 'Inter', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Ping Pong", CANVAS_W / 2, CANVAS_H / 2 - 40);
      ctx.font = "16px 'Geist', 'Inter', system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText("Press SPACE to start", CANVAS_W / 2, CANVAS_H / 2 + 10);
      ctx.fillText("W/S to move paddle · First to 11, win by 2", CANVAS_W / 2, CANVAS_H / 2 + 36);
    }

    if (state === "scored") {
      ctx.fillStyle = "rgba(255,255,255, 0.1)";
      ctx.font = "bold 20px 'Geist', 'Inter', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Point!", CANVAS_W / 2, CANVAS_H - 30);
    }

    if (state === "over") {
      ctx.fillStyle = "rgba(15,23,42,0.75)";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      const winner = playerScoreRef.current > aiScoreRef.current ? "You win!" : "AI wins!";
      ctx.fillStyle = playerScoreRef.current > aiScoreRef.current ? "#4ade80" : "#f87171";
      ctx.font = "bold 36px 'Geist', 'Inter', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(winner, CANVAS_W / 2, CANVAS_H / 2 - 20);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "16px 'Geist', 'Inter', system-ui, sans-serif";
      ctx.fillText(
        `${playerScoreRef.current} - ${aiScoreRef.current}`,
        CANVAS_W / 2,
        CANVAS_H / 2 + 20
      );
      ctx.fillText("Press SPACE to play again", CANVAS_W / 2, CANVAS_H / 2 + 48);
    }

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [resetBall]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameLoop]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if ((e.key === " " || e.key === "Spacebar") && stateRef.current !== "playing") {
        e.preventDefault();
        serve();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [serve]);

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-muted-foreground">You</span>
        <span className="tabular-nums text-2xl font-bold">{playerScore}</span>
        <span className="text-muted-foreground">-</span>
        <span className="tabular-nums text-2xl font-bold">{aiScore}</span>
        <span className="text-sm font-medium text-muted-foreground">AI</span>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="w-full max-w-[800px] rounded-lg border shadow-lg"
      />
      <p className="text-sm text-muted-foreground">
        <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">W</kbd>{" "}
        <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">S</kbd>{" "}
        to move ·{" "}
        <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">SPACE</kbd>{" "}
        to start/restart
      </p>
    </div>
  );
}
