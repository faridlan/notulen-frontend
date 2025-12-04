import { useState } from "react";

interface Props {
  onUpload: (files: File[]) => void;
}

export default function FileUploader({ onUpload }: Props) {
  const [selected, setSelected] = useState<File[]>([]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setSelected(files);
    onUpload(files);
  }

  return (
    <div className="border rounded-lg p-4">
      <label className="block text-sm font-medium mb-1">Upload Meeting Attendance </label>
      <input type="file" multiple onChange={handleChange} />
      <p className="text-xs text-gray-500 mt-1">
        {selected.length} file(s) selected
      </p>
    </div>
  );
}
