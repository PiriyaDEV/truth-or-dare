import React, { useState, useEffect } from "react";
import CommonBtn from "../CommonBtn";

interface ImportQuestionsPopupProps {
  isOpen: boolean;
  truthQuestions: string[];
  dareTasks: string[];
  onImport: (data: { truthQuestions: string[]; dareTasks: string[] }) => void;
  onCancel: () => void;
}

const ImportQuestionsPopup: React.FC<ImportQuestionsPopupProps> = ({
  isOpen,
  truthQuestions,
  dareTasks,
  onImport,
  onCancel,
}) => {
  const [truthInput, setTruthInput] = useState("");
  const [dareInput, setDareInput] = useState("");
  const [error, setError] = useState("");

  // Set default values when popup opens
  useEffect(() => {
    if (isOpen) {
      setTruthInput(JSON.stringify(truthQuestions, null, 2));
      setDareInput(JSON.stringify(dareTasks, null, 2));
      setError("");
    } else {
      setTruthInput("");
      setDareInput("");
      setError("");
    }
  }, [isOpen, truthQuestions, dareTasks]);

  const handleSave = () => {
    try {
      const parsedTruth = JSON.parse(truthInput);
      const parsedDare = JSON.parse(dareInput);

      if (!Array.isArray(parsedTruth) || !Array.isArray(parsedDare)) {
        throw new Error("JSON ต้องเป็น array");
      }

      onImport({
        truthQuestions: parsedTruth,
        dareTasks: parsedDare,
      });

      handleCancel();
    } catch (e) {
      setError("JSON ไม่ถูกต้อง โปรดตรวจสอบอีกครั้ง");
    }
  };

  const handleCancel = () => {
    setError("");
    onCancel();
  };

  const handleClearAll = () => {
    setTruthInput("");
    setDareInput("");
    setError("");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[100]"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCancel();
          }}
        >
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg m-4">
            <h3 className="font-bold text-lg text-center mb-4">
              นำเข้าคำถาม JSON
            </h3>

            <label className="font-semibold mb-1">
              Truth Questions (JSON Array)
            </label>
            <textarea
              className="w-full h-32 p-2 border rounded mb-4"
              value={truthInput}
              onChange={(e) => setTruthInput(e.target.value)}
              placeholder='เช่น ["{name1} ...", "{name1} และ {name2} ..."]'
            />

            <label className="font-semibold mb-1">
              Dare Tasks (JSON Array)
            </label>
            <textarea
              className="w-full h-32 p-2 border rounded mb-2"
              value={dareInput}
              onChange={(e) => setDareInput(e.target.value)}
              placeholder='เช่น ["{name1} ...", "{name1} และ {name2} ..."]'
            />

            {error && <p className="text-red-500 mb-2">{error}</p>}

            <div className="flex flex-col gap-2 mt-4">
              <CommonBtn
                text="ลบทั้งหมด"
                type="secondary"
                onClick={handleClearAll}
                className="w-full max-w-none mb-6"
              />

              <CommonBtn
                text="ยกเลิก"
                type="secondary"
                onClick={handleCancel}
                className="w-full max-w-none"
              />
              <CommonBtn
                text="บันทึก"
                onClick={handleSave}
                className="w-full max-w-none"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImportQuestionsPopup;
