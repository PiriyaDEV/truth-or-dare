import { MemberObj } from "@/app/lib/interface";
import CommonBtn from "@/shared/components/CommonBtn";
import React, { useState, useRef, useEffect } from "react";

interface RandomLightProps {
  members: MemberObj[];
}

export default function RandomLight({ members }: RandomLightProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [drinker, setDrinker] = useState<MemberObj | null>(null);

  const intervalRef = useRef<number | null>(null);
  const totalDuration = 5_000; // 5 seconds
  const intervalTime = 150; // blink every 150ms

  const startGame = () => {
    if (members.length === 0) return;

    setIsRunning(true);
    setDrinker(null);
    let elapsed = 0;

    intervalRef.current = window.setInterval(() => {
      const randomIndex = Math.floor(Math.random() * members.length);
      setActiveIndex(randomIndex);

      elapsed += intervalTime;

      if (elapsed >= totalDuration) {
        stopGame(randomIndex);
      }
    }, intervalTime);
  };

  const stopGame = (finalIndex: number) => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setActiveIndex(finalIndex);
    setDrinker(members[finalIndex]);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative flex flex-col gap-10 w-full max-w-md text-center items-center justify-center mx-auto">
        <div>
          <h2 className="text-xl font-bold">สุ่มโดนใคร คนนั้นกิน!</h2>

          {drinker && (
            <p className="mt-4 text-lg font-semibold text-red-600">
              🍹 {drinker.name} ต้องดื่ม!
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-4 py-12">
          {members.map((member, idx) => (
            <div
              key={member.name}
              className={`w-16 h-16 rounded-full flex items-center justify-center font-semibold text-white transition-colors duration-150
              ${activeIndex === idx ? "animate-pulse" : ""}`}
              style={{
                backgroundColor: activeIndex === idx ? "#7ee081" : "#dddddd",
              }}
            >
              {member.name}
            </div>
          ))}
        </div>

        <CommonBtn
          text={isRunning ? "กำลังสุ่มจ้า..." : "สุ่มเลย!"}
          onClick={startGame}
          disabled={isRunning}
        />
      </div>
    </div>
  );
}
