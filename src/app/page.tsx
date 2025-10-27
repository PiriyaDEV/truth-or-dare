"use client";

import { useEffect, useState } from "react";
import CommonBtn from "@/shared/components/CommonBtn";
import { MemberObj } from "./lib/interface";
import Member from "@/shared/pages/Member";
import { encodeBase64, getURLParams } from "./lib/utils";
import TruthOrDare from "./game/truth-or-dare";
import CommonLoading from "@/shared/components/CommonLoading";
import RandomLight from "./game/random-light";
import BombGame from "./game/bomb";

export default function MainPage() {
  const [isMember, setMember] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [members, setMembers] = useState<MemberObj[]>([]);
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const games = [
    { name: "Truth or Dare", minMembers: 2 },
    { name: "สุ่มโดนใคร คนนั้นกิน!", minMembers: 2 },
    { name: "Bomb!", minMembers: 2 },
  ];

  useEffect(() => {
    const { members: loadedMembers } = getURLParams();
    setMembers(loadedMembers);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const params = new URLSearchParams();
    params.set("members", encodeBase64(members));
    window.history.replaceState({}, "", "?" + params.toString());
  }, [members, isLoaded]);

  const handleDeleteMember = (deletedMember: MemberObj) => {
    setMembers(members.filter((m) => m.name !== deletedMember.name));
  };

  const renderGameComponent = () => {
    switch (activeGame) {
      case "Truth or Dare":
        return <TruthOrDare members={members} />;
      case "สุ่มโดนใคร คนนั้นกิน!":
        return <RandomLight members={members} />;
      case "Bomb!":
        return <BombGame members={members} />;
      default:
        return null;
    }
  };

  if (!isLoaded) return <CommonLoading />;

  return (
    <div className="relative flex flex-col min-h-screen justify-between p-4 items-center">
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center w-full max-w-md justify-center">
        {isMember ? (
          <Member
            members={members}
            setMembers={setMembers}
            setIsMemberSet={setMember}
            onDeleteMember={handleDeleteMember}
          />
        ) : (
          <>
            {!activeGame && (
              <div className="w-full rounded-md h-[calc(100vh-300px)] flex flex-col gap-2 items-center">
                <h1 className="text-3xl font-bold mb-6 text-center">
                  🎮 เลือกเกม
                </h1>
                <div className="grid grid-cols-2 gap-4">
                  {games.map((game) => (
                    <div
                      key={game.name}
                      onClick={() => setActiveGame(game.name)}
                      className={`aspect-square p-4 break-words whitespace-normal flex items-center justify-center rounded-2xl text-white text-lg font-semibold cursor-pointer text-center transition-all ${
                        members.length < game.minMembers
                          ? "bg-[#c5c6c7] pointer-events-none"
                          : "bg-[#DE3163] hover:bg-blue-700"
                      }`}
                    >
                      {game.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeGame && (
              <div className="relative w-full rounded-md h-[calc(100vh-300px)] flex items-center justify-center">
                {renderGameComponent()}
              </div>
            )}

            {/* Bottom bar */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 bg-white py-5 w-full sm:w-[450px] border-t-[1px]">
              <div className="container mx-auto px-4 flex flex-col justify-center gap-3">
                {activeGame ? (
                  <CommonBtn
                    text="กลับไปเลือกเกม"
                    type="secondary"
                    onClick={() => setActiveGame(null)}
                    className="w-full"
                  />
                ) : (
                  <CommonBtn
                    text={
                      members.length === 0 ? "+ เพิ่มสมาชิก" : "จัดการสมาชิก"
                    }
                    onClick={() => setMember(true)}
                    className="w-full"
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
