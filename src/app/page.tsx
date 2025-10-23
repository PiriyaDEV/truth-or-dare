"use client";

import { useEffect, useState } from "react";
import CommonBtn from "@/shared/components/CommonBtn";
import CommonLoading from "@/shared/components/CommonLoading";
import Member from "@/shared/pages/Member";
import { MemberObj } from "./lib/interface";
import { encodeBase64, getURLParams } from "./lib/utils";
import { dareTasks, truthQuestions } from "@/shared/constants";

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMember, setMember] = useState(false);
  const [members, setMembers] = useState<MemberObj[]>([]);

  // Load from URL parameters
  useEffect(() => {
    const { members: loadedMembers } = getURLParams();
    setMembers(loadedMembers);
    setIsLoaded(true);
  }, []);

  // Update URL parameters when members or itemArr change
  useEffect(() => {
    if (!isLoaded) return;

    const params = new URLSearchParams();
    params.set("members", encodeBase64(members));
    window.history.replaceState({}, "", "?" + params.toString());
  }, [members, isLoaded]);

  // Handle the deletion of a member
  const handleDeleteMember = (deletedMember: MemberObj) => {
    // Remove the member from the members list
    const updatedMembers = members.filter(
      (member) => member.name !== deletedMember.name
    );
    setMembers(updatedMembers);
  };

  const renderBody = () => {
    return (
      <div className="flex flex-col gap-4 w-full mt-[190px]">
        <div
          style={{
            paddingBottom: "150px",
          }}
        >
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Truth or Dare Game</h2>
            <p>
              Players ({members.length}):{" "}
              {members.map((p) => p.name).join(", ")}
            </p>

            {members.length !== 0 && (
              <>
                <button
                  onClick={handleClick}
                  disabled={isLoading}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.6 : 1,
                  }}
                >
                  {isLoading ? "Spinning..." : "🎲 Random Truth or Dare"}
                </button>

                <div
                  style={{
                    marginTop: "30px",
                    fontWeight: "bold",
                    minHeight: "40px",
                  }}
                >
                  {isLoading ? (
                    <span style={{ fontStyle: "italic" }}>Thinking...</span>
                  ) : (
                    result
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFooter = () => (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 bg-white py-5 w-full sm:w-[450px]">
      <div className="container mx-auto px-4 flex justify-center gap-7 mt-3">
        <CommonBtn
          text={members.length === 0 ? "+ เพิ่มสมาชิก" : "จัดการสมาชิก"}
          type="secondary"
          onClick={() => setMember(true)}
          className="w-full"
        />
      </div>
    </div>
  );

  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getRandomItem = <T,>(arr: T[]): T =>
    arr[Math.floor(Math.random() * arr.length)];
  const getRandomPlayer = (): MemberObj => getRandomItem(members);

  const generateTruthOrDare = () => {
    if (members.length < 2) return "You need at least 2 players!";

    const type = Math.random() < 0.5 ? "truth" : "dare";
    const isPair = Math.random() < 0.6; // 60% chance for 2 players

    const player1 = getRandomPlayer();
    let text = "";

    if (isPair) {
      const otherPlayers = members.filter((p) => p.name !== player1.name);
      const player2 = getRandomItem(otherPlayers);
      const list = type === "truth" ? truthQuestions.pair : dareTasks.pair;

      text = getRandomItem(list)
        .replace("{name1}", player1.name)
        .replace("{name2}", player2.name);
    } else {
      const gender = player1.gender === "F" ? "F" : "M";
      const list =
        type === "truth" ? truthQuestions[gender] : dareTasks[gender];
      text = getRandomItem(list).replace("{name}", player1.name);
    }

    return `${type.toUpperCase()}: ${text}`;
  };

  const handleClick = () => {
    setIsLoading(true);
    setResult("");

    // Simulate a "thinking" delay (1.5 seconds)
    setTimeout(() => {
      const output = generateTruthOrDare();
      setResult(output);
      setIsLoading(false);
    }, 2000);
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
          {renderBody()}
          {renderFooter()}
        </>
      )}
    </div>
  );
}
