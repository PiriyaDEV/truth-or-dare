"use client";

import { useEffect, useState } from "react";
import CommonBtn from "@/shared/components/CommonBtn";
import CommonLoading from "@/shared/components/CommonLoading";
import { MemberObj } from "./lib/interface";
import { encodeBase64, getURLParams } from "../../lib/utils";
import ImportQuestionsPopup from "@/shared/components/ImportQuestion";
import defaultTruth from "./lib/truth.json";
import defaultDare from "./lib/dare.json";
import { FaCog } from "react-icons/fa";

// Wrap questions with isPlayed
type Question = { text: string; isPlayed?: boolean };

export default function TruthOrDate() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [members, setMembers] = useState<MemberObj[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<{
    truthQuestions: Question[];
    dareTasks: Question[];
  }>({
    truthQuestions: defaultTruth.map((t) => ({ text: t, isPlayed: false })),
    dareTasks: defaultDare.map((d) => ({ text: d, isPlayed: false })),
  });
  const [isImport, setImport] = useState(false);

  const [currentPlayer, setCurrentPlayer] = useState<MemberObj | null>(null);
  const [result, setResult] = useState("");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [lockedRandom, setLockedRandom] = useState(false);

  // Load members from URL params
  useEffect(() => {
    const { members: loadedMembers } = getURLParams();
    setMembers(loadedMembers);
    setIsLoaded(true);
  }, []);

  // Update URL params when members change
  useEffect(() => {
    if (!isLoaded) return;

    const params = new URLSearchParams();
    params.set("members", encodeBase64(members));
    window.history.replaceState({}, "", "?" + params.toString());
  }, [members, isLoaded]);

  // Handle imported questions
  const handleImport = (data: any) => {
    setQuestions({
      truthQuestions: (data.truthQuestions || defaultTruth).map(
        (t: string) => ({ text: t, isPlayed: false })
      ),
      dareTasks: (data.dareTasks || defaultDare).map((d: string) => ({
        text: d,
        isPlayed: false,
      })),
    });
    setImport(false);
  };

  const getRandomItem = <T,>(arr: T[]): T =>
    arr[Math.floor(Math.random() * arr.length)];

  const getRandomPlayer = (): MemberObj | null => {
    if (members.length === 0) return null;

    if (!currentPlayer) return getRandomItem(members);

    // 80% chance to NOT pick the same player
    if (Math.random() < 0.8) {
      const otherPlayers = members.filter((p) => p.name !== currentPlayer.name);
      if (otherPlayers.length > 0) {
        return getRandomItem(otherPlayers);
      }
    }

    // fallback: allow current player (20% chance)
    return currentPlayer;
  };

  const handleStartTurn = () => {
    if (members.length < 2) {
      setResult("ต้องมีผู้เล่นอย่างน้อย 2 คน!");
      return;
    }
    setCurrentPlayer(getRandomPlayer());
    setResult("");
    setHasAnswered(false);
  };

  // Generate question with isPlayed check
  const generateQuestion = (type: "truth" | "dare") => {
    if (!currentPlayer) return "";

    const player = currentPlayer;
    const list =
      type === "truth" ? questions.truthQuestions : questions.dareTasks;

    // Filter unplayed questions
    let available = list.filter((q) => !q.isPlayed);
    // If all played, reset
    if (available.length === 0) {
      available = list.map((q) => ({ ...q, isPlayed: false }));
    }

    const selected = getRandomItem(available);

    // Mark as played
    const updatedList = list.map((q) =>
      q.text === selected.text ? { ...q, isPlayed: true } : q
    );

    setQuestions((prev) => ({
      ...prev,
      [type === "truth" ? "truthQuestions" : "dareTasks"]: updatedList,
    }));

    // Replace placeholders
    let text = selected.text.replace("{name1}", player.name);

    if (text.includes("{name2}") && members.length > 1) {
      const otherPlayers = members.filter((p) => p.name !== player.name);
      const player2 = getRandomItem(otherPlayers);
      text = text.replace("{name2}", player2.name);
    }

    return `${type.toUpperCase()}: ${text}`;
  };

  const handleChoice = (choice: "truth" | "dare") => {
    if (!currentPlayer) return;

    setIsLoading(true);
    setResult("");

    setTimeout(() => {
      const question = generateQuestion(choice);
      setResult(question);
      setIsLoading(false);
      setHasAnswered(true);
      setLockedRandom(false);
    }, 1200);
  };

  const handlePass = () => {
    if (!currentPlayer) return;

    setIsLoading(true);
    setResult("");

    setTimeout(() => {
      const randomType = Math.random() < 0.5 ? "truth" : "dare";
      const question = generateQuestion(randomType);
      setResult(question);
      setIsLoading(false);
      setLockedRandom(true);
    }, 1200);
  };

  const handleEndTurn = () => {
    setCurrentPlayer(null);
    setResult("");
    setHasAnswered(false);
    setLockedRandom(false);
  };

  if (!isLoaded) return <CommonLoading />;

  return (
    <div className="flex flex-col gap-5">
      <div className="relative flex flex-col gap-4 w-full max-w-md text-center items-center justify-center h-[calc(100vh-200px)] mx-auto">
        <div className="absolute top-[20px] z-[99] right-[10px]">
          <FaCog
            onClick={() => setImport(true)}
            className="text-[24px] mr-1 cursor-pointer text-[#333333]"
          />
        </div>

        {!currentPlayer ? (
          <>
            <p>
              ผู้เล่น ({members.length} คน):{" "}
              {members.map((p) => p.name).join(", ")}
            </p>
            <CommonBtn
              text="🎲 เริ่มตาใหม่"
              type="primary"
              onClick={handleStartTurn}
              disabled={members.length < 2}
              className="mx-auto w-[200px]"
            />
          </>
        ) : (
          <div className="mt-4 flex flex-col gap-3 items-center">
            <h3 className="text-lg font-bold">
              ถึงตาของ {currentPlayer.name}!
            </h3>

            {!hasAnswered && (
              <div className="flex flex-col gap-4">
                <CommonBtn
                  text="Truth"
                  type="secondary"
                  onClick={() => handleChoice("truth")}
                  disabled={isLoading}
                />
                <CommonBtn
                  text="Dare"
                  type="secondary"
                  onClick={() => handleChoice("dare")}
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="mt-5 min-h-[60px] font-semibold">
              {isLoading ? "กำลังคิด..." : result}
            </div>

            {hasAnswered && (
              <div className="flex flex-col gap-4 mt-4">
                <CommonBtn
                  text="ข้าม"
                  type="secondary"
                  onClick={handlePass}
                  disabled={isLoading || lockedRandom}
                />
                <CommonBtn
                  text="✅ จบตา"
                  type="primary"
                  onClick={handleEndTurn}
                />
              </div>
            )}

            {lockedRandom && (
              <p className="italic text-sm text-gray-500 mt-2">
                คุณข้ามครั้งก่อน! ไม่สามารถข้ามรอบถัดไปได้
              </p>
            )}
          </div>
        )}
      </div>

      <ImportQuestionsPopup
        isOpen={isImport}
        onImport={handleImport}
        truthQuestions={questions.truthQuestions.map((q) => q.text)}
        dareTasks={questions.dareTasks.map((q) => q.text)}
        onCancel={() => setImport(false)}
      />
    </div>
  );
}
