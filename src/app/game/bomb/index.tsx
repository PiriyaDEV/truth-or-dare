import { MemberObj } from "@/app/lib/interface";
import CommonBtn from "@/shared/components/CommonBtn";
import React, { useState } from "react";

interface BombGameProps {
  members: MemberObj[];
}

interface Circle {
  id: number;
  isBomb: boolean;
  clicked: boolean;
}

export default function BombGame({ members }: BombGameProps) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [deadPlayers, setDeadPlayers] = useState<MemberObj[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [message, setMessage] = useState("");

  const totalCircles = 20;
  const totalBombs = 2;

  const startGame = () => {
    if (members.length === 0) return;
    setIsStarted(true);
    setMessage("");
    setDeadPlayers([]);

    // generate random bombs
    const bombIndexes = new Set<number>();
    while (bombIndexes.size < totalBombs) {
      bombIndexes.add(Math.floor(Math.random() * totalCircles));
    }

    const newCircles = Array.from({ length: totalCircles }, (_, i) => ({
      id: i,
      isBomb: bombIndexes.has(i),
      clicked: false,
    }));

    // shuffle first player
    const randomStart = Math.floor(Math.random() * members.length);
    setCurrentPlayerIndex(randomStart);

    setCircles(newCircles);
  };

  const handleCircleClick = (id: number) => {
    if (!isStarted) return;

    setCircles((prev) =>
      prev.map((circle) =>
        circle.id === id ? { ...circle, clicked: true } : circle
      )
    );

    const clickedCircle = circles.find((c) => c.id === id);
    if (!clickedCircle) return;

    const currentPlayer = members[currentPlayerIndex];

    if (clickedCircle.isBomb) {
      // 💣 Player hit a bomb!
      setDeadPlayers((prev) => [...prev, currentPlayer]);
      setMessage(`💣 ${currentPlayer.name} เจอบอมบ์ ตาย!`);
    } else {
      // ✅ Safe
      setMessage(`✅ ${currentPlayer.name} รอด!`);
    }

    // Move to next player (skip dead ones)
    let nextIndex = (currentPlayerIndex + 1) % members.length;
    while (deadPlayers.some((d) => d.name === members[nextIndex].name)) {
      nextIndex = (nextIndex + 1) % members.length;
      if (nextIndex === currentPlayerIndex) break; // all dead
    }

    setCurrentPlayerIndex(nextIndex);
  };

  const allDead = members.length > 0 && deadPlayers.length === members.length;

  return (
    <div className="flex flex-col gap-6 items-center justify-center text-center">
      <h2 className="text-xl font-bold">💣 เกมสุ่มบอมบ์</h2>

      {isStarted && (
        <>
          <p className="text-lg font-semibold">
            เทิร์นของ:{" "}
            <span className="text-green-600">
              {allDead
                ? "ไม่มีใครเหลือแล้ว!"
                : members[currentPlayerIndex].name}
            </span>
          </p>

          {message && <p className="text-red-500 font-medium">{message}</p>}

          <div className="grid grid-cols-5 gap-4 mt-6">
            {circles.map((circle) => (
              <div
                key={circle.id}
                onClick={() =>
                  !circle.clicked &&
                  !allDead &&
                  !deadPlayers.some(
                    (d) => d.name === members[currentPlayerIndex].name
                  ) &&
                  handleCircleClick(circle.id)
                }
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold cursor-pointer
                  ${
                    circle.clicked
                      ? circle.isBomb
                        ? "bg-red-600"
                        : "bg-green-500"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
              >
                {circle.clicked ? (circle.isBomb ? "💣" : "✅") : ""}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <p className="font-semibold text-red-600">
              ตายแล้ว:{" "}
              {deadPlayers.length > 0
                ? deadPlayers.map((d) => d.name).join(", ")
                : "ไม่มี"}
            </p>
          </div>
        </>
      )}

      <CommonBtn
        text={isStarted ? "เริ่มใหม่" : "เริ่มเกม"}
        onClick={startGame}
      />
    </div>
  );
}
