"use client";

import { useState } from "react";
import { TiDelete } from "react-icons/ti";

import CommonBtn from "@/shared/components/CommonBtn";
import { MemberObj } from "@/app/game/truth-or-dare/lib/interface";
import ConfirmPopup from "@/shared/components/ConfirmPopup";

interface MemberProps {
  members: MemberObj[];
  setMembers: React.Dispatch<React.SetStateAction<MemberObj[]>>;
  setIsMemberSet: React.Dispatch<React.SetStateAction<boolean>>;
  onDeleteMember: (memberToDelete: MemberObj) => void;
}

export default function Member({
  members,
  setMembers,
  setIsMemberSet,
  onDeleteMember,
}: MemberProps) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"M" | "F" | "">("");
  const [error, setError] = useState(false);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(
    null
  );

  const addMember = () => {
    const trimmed = name.trim();
    if (!trimmed || !gender) {
      setError(true);
      return;
    }

    const isDuplicate = members.some(
      (member) => member.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      alert("ชื่อสมาชิกนี้มีอยู่แล้ว");
      return;
    }

    setMembers([
      ...members,
      {
        name: trimmed,
        gender,
        color: getColorByGender(gender),
      },
    ]);
    setName("");
    setGender("");
    setError(false);
  };

  const getColorByGender = (g: "M" | "F") => {
    return g === "M" ? "#3B82F6" : "#EC4899";
  };

  const renderFooter = () => (
    <div className="container mx-auto px-4 flex flex-col gap-5">
      <div className="flex flex-col gap-4 w-full mt-4">
        <CommonBtn
          text="เพิ่ม"
          className="w-full max-w-none"
          onClick={addMember}
        />

        <CommonBtn
          text="กลับ >"
          type="secondary"
          className="w-full max-w-none mt-8"
          onClick={() => setIsMemberSet(false)}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-10 pb-20 mt-[140px]">
      <div className="fixed z-[50] top-[105px] left-1/2 -translate-x-1/2 bg-white w-full sm:w-[450px] px-4">
        <h1 className="font-bold mt-3 pb-2">
          สมาชิกมีใครบ้าง ?{" "}
          <span className="!text-gray-400">({members.length} คน)</span>
        </h1>
      </div>

      <div
        className={`flex gap-4 flex-wrap w-full ${
          members.length > 4 ? "justify-center" : ""
        }`}
        style={{
          padding: "5px",
          paddingBottom: "120px",
        }}
      >
        {members.length ? (
          members.map((m, i) => (
            <div
              key={i}
              className="relative w-16 h-16 rounded-full flex justify-center items-center"
              style={{ backgroundColor: m.color }}
            >
              <span className="text-xs font-semibold truncate text-white text-center">
                {m.name}
                <br />
                <span className="text-[10px]">
                  {m.gender === "M" ? "♂" : "♀"}
                </span>
              </span>

              <div
                className="bg-white rounded-full absolute -top-1 -right-1 h-5 w-5 flex justify-center items-center cursor-pointer"
                onClick={() => setConfirmDeleteIndex(i)}
              >
                <TiDelete className="text-red text-xl" />
              </div>

              {confirmDeleteIndex === i && (
                <ConfirmPopup
                  isOpen={true}
                  title={`ยืนยันการลบ "${m.name}" ?`}
                  onConfirm={() => {
                    onDeleteMember(m);
                    setConfirmDeleteIndex(null);
                  }}
                  onCancel={() => setConfirmDeleteIndex(null)}
                />
              )}
            </div>
          ))
        ) : (
          <div className="text-center w-full">
            <p className="!font-bold text-sm">ยังไม่มีสมาชิก</p>
            <p className="mt-1 !text-gray-400 text-sm">
              กรุณาเพิ่มสมาชิกด้านล่าง
            </p>
          </div>
        )}
      </div>

      {/* Fixed Bottom Section */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 bg-white py-5 w-full sm:w-[450px] z-10">
        <div className="container mx-auto px-4 flex flex-col gap-5">
          <div className="flex items-center justify-center gap-2">
            <input
              type="text"
              placeholder="ใส่ชื่อสมาชิก"
              className={`input input-bordered w-full ${
                error && !name ? "border-red-500" : ""
              }`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(false);
              }}
            />
          </div>

          {/* Gender Selector */}
          <div className="flex justify-center gap-4">
            <button
              className={`px-4 py-2 rounded-full border w-full ${
                gender === "M"
                  ? "bg-blue-500 text-white border-blue-500"
                  : "border-gray-300"
              }`}
              onClick={() => setGender("M")}
            >
              ชาย
            </button>
            <button
              className={`px-4 py-2 rounded-full border w-full ${
                gender === "F"
                  ? "bg-pink-500 text-white border-pink-500"
                  : "border-gray-300"
              }`}
              onClick={() => setGender("F")}
            >
              หญิง
            </button>
          </div>
          {error && !gender && (
            <p className="text-red-500 text-center text-sm">
              กรุณาเลือกเพศด้วย
            </p>
          )}
        </div>

        {renderFooter()}
      </div>
    </div>
  );
}
