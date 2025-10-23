"use client";

import { useEffect, useState } from "react";
import { FaCog, FaShareAlt } from "react-icons/fa";
import CommonBtn from "@/shared/components/CommonBtn";
import CommonLoading from "@/shared/components/CommonLoading";
import Calculate from "@/shared/pages/Calculate";
import Item from "@/shared/pages/Item";
import Member from "@/shared/pages/Member";
import Summary from "@/shared/pages/Summary";
import { ItemObj, MemberObj } from "./lib/interface";
import { PuffLoader } from "react-spinners";
import { FaList, FaTable } from "react-icons/fa";
import { encodeBase64, getPrice, getShortUrl, getURLParams } from "./lib/utils";
import ItemModal from "@/shared/components/ItemModal";
import { MODE } from "./lib/constants";
import SettingsPopup, { Settings } from "@/shared/components/SettingPopup";
import SharePopup from "@/shared/components/SharedPopup";
import { dareTasks, Player, truthQuestions } from "@/shared/constants";

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMember, setMember] = useState(false);
  const [isItemModalOpen, setItemModalOpen] = useState(false);
  const [screen, setScreen] = useState<"list" | "summary">("list");
  const [members, setMembers] = useState<MemberObj[]>([]);
  const [itemArr, setItemArr] = useState<ItemObj[]>([]);
  const [copySuccess, setCopySuccess] = useState(false); // State to track copy success
  const [billName, setBillName] = useState("");
  const [mode, setMode] = useState<"EDIT" | "VIEW" | null>(null);

  const [isSettingOpen, setIsSettingOpen] = useState<boolean>(false);
  const [isSharedOpen, setIsSharedOpen] = useState<boolean>(false);

  const [settings, setSettings] = useState<Settings>({
    vat: 7,
    serviceCharge: 10,
    isVat: false,
    isService: false,
  });

  // Load from URL parameters
  useEffect(() => {
    const {
      members: loadedMembers,
      itemArr: loadedItems,
      billName: loadedBillName,
      mode: loadedMode,
      setting: loadedSetting,
    } = getURLParams();
    setBillName(loadedBillName);
    setMembers(loadedMembers);
    setItemArr(loadedItems);
    setMode(loadedMode);
    setSettings(loadedSetting);
    setIsLoaded(true);
  }, []);

  // Update URL parameters when members or itemArr change
  useEffect(() => {
    if (!isLoaded) return;

    const params = new URLSearchParams();
    params.set("billName", encodeBase64(billName));
    params.set("members", encodeBase64(members));
    params.set("itemArr", encodeBase64(itemArr));
    params.set("mode", encodeBase64(mode));
    params.set("setting", encodeBase64(settings));
    window.history.replaceState({}, "", "?" + params.toString());
  }, [members, itemArr, billName, mode, settings, isLoaded]);

  // Handle the deletion of a member
  const handleDeleteMember = (deletedMember: MemberObj) => {
    // Remove the member from the members list
    const updatedMembers = members.filter(
      (member) => member.name !== deletedMember.name
    );
    setMembers(updatedMembers);

    // Remove items that are paid by the deleted member
    const updatedItems = itemArr.filter(
      (item) => item.paidBy !== deletedMember.name
    );

    // For items where the deleted member is selected, remove them from the selectedMembers list
    updatedItems.forEach((item) => {
      item.selectedMembers = item.selectedMembers.filter(
        (selectedMember) => selectedMember.name !== deletedMember.name
      );
    });

    setItemArr(updatedItems);
  };

  const handleShareClick = (allowEdit: boolean) => {
    const shareMode = allowEdit ? "EDIT" : "VIEW";

    const params = new URLSearchParams();
    params.set("billName", encodeBase64(billName));
    params.set("members", encodeBase64(members));
    params.set("itemArr", encodeBase64(itemArr));
    params.set("mode", encodeBase64(shareMode));
    params.set("setting", encodeBase64(settings));

    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?${params.toString()}`;

    if (navigator.share) {
      getShortUrl(shareUrl)
        .then((shortUrl) => {
          return navigator.share({
            title: "📤 มาจ่ายเงินด้วยจ้า!",
            url: shortUrl,
          });
        })
        .then(() => {
          console.log("Shared successfully");
        })
        .catch((error) => {
          if (error instanceof DOMException && error.name === "AbortError") {
            console.log("User canceled the share.");
          } else {
            console.error("Share failed:", error);
          }
        });
    } else {
      console.warn("Web Share API not supported.");
    }
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

  const renderModal = () =>
    isItemModalOpen && (
      <ItemModal
        members={members}
        settings={settings}
        setItemArr={setItemArr}
        setItemModalOpen={setItemModalOpen}
      />
    );

  const calculateTotalPrice = (itemArr: ItemObj[]): number => {
    return itemArr.reduce((sum, item) => {
      if (typeof item.price === "number") {
        return sum + getPrice(item.price, item.vatRate, item.serviceChargeRate);
      } else {
        // Sum customPaid from all selectedMembers if price is undefined
        const customTotal = item.selectedMembers.reduce((subSum, member) => {
          return subSum + (member.customPaid ?? 0);
        }, 0);
        return (
          sum + getPrice(customTotal, item.vatRate, item.serviceChargeRate)
        );
      }
    }, 0);
  };

  const total = calculateTotalPrice(itemArr);
  const totalFormatted = `${total.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} `;

  const renderFooter = () => (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 bg-white py-5 w-full sm:w-[450px]">
      <div className="container mx-auto px-4 flex items-center justify-between gap-7">
        <h1 className="font-bold">ยอดรวมบิล : </h1>
        <h1 className="font-bold text-[24px]">
          {totalFormatted}
          บาท
          <span className="ml-2">
            {(() => {
              if (total >= 150_000) return "💀";
              if (total >= 100_000) return "🤯";
              if (total >= 50_000) return "😱";
              if (total >= 10_000) return "🤑";
              if (total >= 5_000) return "😵‍💫";
              if (total >= 3_000) return "🫠";
              if (total >= 1_000) return "😅";
              if (total >= 500) return "🥱";
              return "😍";
            })()}
          </span>
        </h1>
      </div>

      {mode === MODE.EDIT && (
        <div className="container mx-auto px-4 flex justify-between gap-7 mt-3">
          <CommonBtn
            text={members.length === 0 ? "+ เพิ่มสมาชิก" : "จัดการสมาชิก"}
            type="secondary"
            onClick={() => setMember(true)}
            className="!w-fit"
          />
          <CommonBtn
            text="เพิ่มรายการ"
            onClick={() => setItemModalOpen(true)}
            disabled={members.length === 0}
            className="!w-fit"
          />
        </div>
      )}
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
    const isPair = Math.random() < 0.3; // 30% chance for 2 players

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
          <div className="fixed top-[81px] left-1/2 -translate-x-1/2 z-50 bg-white w-full sm:w-[450px] pt-2">
            <div className="container mx-auto px-4 flex-col flex gap-5">
              {/* <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 whitespace-nowrap">
                  <h1 className="font-bold">ชื่อบิล : </h1>
                  {mode === MODE.EDIT ? (
                    <input
                      type="text"
                      placeholder="ใส่ชื่อบิลที่นี่"
                      className="font-bold text-[18px] input input-bordered w-full"
                      value={billName}
                      onChange={(e) => setBillName(e.target.value)}
                    />
                  ) : (
                    <div
                      className={`text-[18px] font-bold ${
                        billName === "" ? "!text-gray-400" : ""
                      }`}
                    >
                      {billName !== "" ? billName : "ไม่มีชื่อบิล"}
                    </div>
                  )}
                </div>

                {mode === MODE.EDIT && (
                  <FaCog
                    onClick={() => {
                      setIsSettingOpen(true);
                    }}
                    className="text-[24px] mr-1 cursor-pointer text-[#333333]"
                  />
                )}
              </div> */}

              {/* {renderHeader()} */}
            </div>
          </div>

          {renderBody()}
          {renderModal()}
          {renderFooter()}

          <SettingsPopup
            isOpen={isSettingOpen}
            settings={settings}
            setSettings={setSettings}
            onCancel={() => {
              setIsSettingOpen(false);
            }}
          />

          <SharePopup
            billName={billName}
            isOpen={isSharedOpen}
            onShare={handleShareClick}
            onCancel={() => {
              setIsSharedOpen(false);
            }}
          />
        </>
      )}

      {/* Share Link Button */}
      {mode === MODE.EDIT && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 w-full sm:w-[450px] z-[99]">
          <div className="flex justify-end px-4">
            <button
              onClick={() => {
                setIsSharedOpen(true);
              }}
              className="p-2 bg-[#c5c6c7] text-white rounded-full flex items-center gap-2"
              title="Share link"
            >
              {!copySuccess ? (
                <FaShareAlt className="text-xs" />
              ) : (
                <PuffLoader
                  color="white"
                  loading={true}
                  size={13}
                  aria-label="Loading Spinner"
                  data-testid="loader"
                />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
