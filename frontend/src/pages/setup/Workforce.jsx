export default function ImportWorkforcePage() {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`Uploaded: ${file.name}`);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      alert(`Dropped: ${file.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#4e4e4e] flex items-center justify-center p-5">
      <div className="w-full max-w-[1360px] min-h-[768px] bg-[#f8f8f8] shadow-xl relative overflow-hidden">
        {/* Header */}
        <div className="px-[58px] pt-[28px] flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer text-[#5e5e5e] text-[15px] font-medium">
            <span className="text-[20px]">←</span>
            <span>Go Back</span>
          </div>

          <div className="flex items-center gap-3 text-[14px] text-[#777777]">
            <span>Already have an account?</span>
            <button className="border border-[#d4d4d4] rounded px-4 py-[6px] bg-white text-[#666666] hover:bg-gray-50 transition">
              Sign In
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="px-[58px] mt-5">
          <div className="flex justify-end text-[15px] text-[#5f5f5f] mb-3 font-medium">
            Step 2 / 4
          </div>

          <div className="w-full h-[6px] bg-[#ededed] rounded-full overflow-hidden">
            <div className="w-[53%] h-full bg-[#0d3b96] rounded-full"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center mt-[68px]">
          <h1 className="text-[38px] leading-none font-semibold text-[#1b1b1b]">
            Import Your Workforce
          </h1>

          <p className="mt-4 text-center text-[17px] text-[#666666] leading-7">
            Add employees individually or upload
            <br />
            your staff list in bulk.
          </p>

          {/* Radio Buttons */}
          <div className="flex items-center gap-10 mt-10 text-[16px] text-[#5a5a5a]">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="upload"
                defaultChecked
                className="w-[16px] h-[16px] accent-[#0d3b96]"
              />
              Upload CSV
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="upload"
                className="w-[16px] h-[16px] accent-[#0d3b96]"
              />
              Add Manually
            </label>
          </div>

          {/* Upload Box */}
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="mt-12 w-[620px] h-[250px] border border-dashed border-[#d7d7d7] rounded-sm bg-[#fbfbfb] flex flex-col items-center justify-center cursor-pointer hover:bg-white transition"
          >
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Folder Icon */}
            <div className="relative mb-7">
              <div className="w-[68px] h-[44px] rounded-b-[10px] rounded-tr-[10px] bg-gradient-to-b from-[#2150b2] to-[#0d3484] shadow-lg"></div>
              <div className="absolute -top-[10px] left-[6px] w-[34px] h-[16px] rounded-t-[6px] bg-[#2150b2]"></div>
            </div>

            <div className="text-[28px] font-semibold text-[#222222]">
              Select a CSV file to upload
            </div>

            <div className="mt-2 text-[15px] text-[#8a8a8a]">
              or drag and drop it here
            </div>
          </label>

          {/* URL Upload */}
          <div className="w-[620px] mt-8">
            <div className="text-[14px] text-[#5d5d5d] mb-3">
              Or upload from a URL
            </div>

            <div className="flex items-center border border-[#dddddd] rounded-md overflow-hidden h-[46px] bg-white">
              <input
                type="text"
                placeholder="Add the file URL"
                className="flex-1 px-4 h-full outline-none text-[14px] text-[#444444]"
              />

              <button className="h-[34px] px-5 mr-2 border border-[#d8d8d8] rounded text-[13px] text-[#666666] hover:bg-gray-50 transition">
                Upload
              </button>
            </div>
          </div>

          {/* Continue Button */}
          <button className="mt-14 w-[380px] h-[52px] bg-[#0d3b96] hover:bg-[#0a3280] rounded-md text-white text-[16px] font-medium shadow-md transition">
            Continue
          </button>
        </div>

        {/* Footer */}
        <div className="absolute bottom-5 left-0 right-0 text-center text-[12px] text-[#8a8a8a]">
          © 2025 All Rights Reserved Track.
        </div>
      </div>
    </div>
  );
}
