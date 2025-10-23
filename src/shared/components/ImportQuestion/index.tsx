import React, { useState, useEffect } from "react";
import CommonBtn from "../CommonBtn";

interface ImportQuestionsPopupProps {
  isOpen: boolean;
  onImport: (data: any) => void; // callback ส่ง JSON กลับ parent
  onCancel: () => void;
}

const ImportQuestionsPopup: React.FC<ImportQuestionsPopupProps> = ({
  isOpen,
  onImport,
  onCancel,
}) => {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setJsonInput("");
      setError("");
    }
  }, [isOpen]);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      onImport(parsed); // ส่ง JSON กลับ parent
      onCancel();
    } catch (e) {
      setError("JSON ไม่ถูกต้อง โปรดตรวจสอบอีกครั้ง");
    }
  };

  const handleCancel = () => {
    setJsonInput("");
    setError("");
    onCancel();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[100]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCancel();
            }
          }}
        >
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg m-4">
            <h3 className="font-bold text-lg text-center mb-4">
              นำเข้าคำถาม JSON
            </h3>

            <textarea
              className="w-full h-64 p-2 border rounded mb-2"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="วาง JSON ของ truthQuestions หรือ dareTasks ที่นี่"
            />
            {error && <p className="text-red-500 mb-2">{error}</p>}

            <div className="flex flex-col gap-2 mt-4">
              <CommonBtn
                text="ยกเลิก"
                type="secondary"
                onClick={handleCancel}
                className="w-full max-w-none"
              />
              <CommonBtn
                text="บันทึก"
                // type="secondary"
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
