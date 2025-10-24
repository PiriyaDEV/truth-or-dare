"use client";

import { useEffect, useState } from "react";
import CommonBtn from "@/shared/components/CommonBtn";
import CommonLoading from "@/shared/components/CommonLoading";
import Member from "@/shared/pages/Member";
import { MemberObj } from "./lib/interface";
import { encodeBase64, getURLParams } from "./lib/utils";
import ImportQuestionsPopup from "@/shared/components/ImportQuestion";
import defaultTruth from "./lib/truth.json";
import defaultDare from "./lib/dare.json";
import { FaCog } from "react-icons/fa";

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMember, setMember] = useState(false);
  const [members, setMembers] = useState<MemberObj[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<{
    truthQuestions: string[];
    dareTasks: string[];
  }>({
    truthQuestions: defaultTruth,
    dareTasks: defaultDare,
  });
  const [isImport, setImport] = useState(false);

  const [currentPlayer, setCurrentPlayer] = useState<MemberObj | null>(null);
  const [result, setResult] = useState("");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [lockedRandom, setLockedRandom] = useState(false);

  // โหลดจาก URL parameters
  useEffect(() => {
    const { members: loadedMembers } = getURLParams();
    setMembers(loadedMembers);
    setIsLoaded(true);
  }, []);

  // อัปเดต URL parameters เมื่อสมาชิกเปลี่ยน
  useEffect(() => {
    if (!isLoaded) return;

    const params = new URLSearchParams();
    params.set("members", encodeBase64(members));
    window.history.replaceState({}, "", "?" + params.toString());
  }, [members, isLoaded]);

  // handle imported questions
  const handleImport = (data: any) => {
    console.log("Imported JSON from child:", data);
    setQuestions({
      truthQuestions: data.truthQuestions || defaultTruth,
      dareTasks: data.dareTasks || defaultDare,
    });
    setImport(false);
  };

  // จัดการการลบสมาชิก
  const handleDeleteMember = (deletedMember: MemberObj) => {
    const updatedMembers = members.filter(
      (member) => member.name !== deletedMember.name
    );
    setMembers(updatedMembers);
  };

  const getRandomItem = <T,>(arr: T[]): T =>
    arr[Math.floor(Math.random() * arr.length)];

  const getRandomPlayer = (): MemberObj | null =>
    members.length > 0 ? getRandomItem(members) : null;

  const handleStartTurn = () => {
    if (members.length < 2) {
      setResult("ต้องมีผู้เล่นอย่างน้อย 2 คน!");
      return;
    }

    const player = getRandomPlayer();
    setCurrentPlayer(player);
    setResult("");
    setHasAnswered(false);
  };

  const generateQuestion = (type: "truth" | "dare") => {
    if (!currentPlayer) return "";

    const player1 = currentPlayer;
    const list =
      type === "truth" ? questions.truthQuestions : questions.dareTasks;
    let text = getRandomItem(list);

    // replace placeholders
    text = text.replace("{name1}", player1.name);

    if (text.includes("{name2}") && members.length > 1) {
      const otherPlayers = members.filter((p) => p.name !== player1.name);
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
      {isMember ? (
        <Member
          members={members}
          setMembers={setMembers}
          setIsMemberSet={setMember}
          onDeleteMember={handleDeleteMember}
        />
      ) : (
        <>
          <div className="relative flex flex-col gap-4 w-full max-w-md text-center items-center justify-center min-h-screen mx-auto">
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
            truthQuestions={questions.truthQuestions}
            dareTasks={questions.dareTasks}
            onCancel={() => setImport(false)}
          />

          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 bg-white py-5 w-full sm:w-[450px]">
            <div className="container mx-auto px-4 flex flex-col justify-center gap-3 mt-3">
              <CommonBtn
                text={members.length === 0 ? "+ เพิ่มสมาชิก" : "จัดการสมาชิก"}
                onClick={() => setMember(true)}
                className="w-full"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
