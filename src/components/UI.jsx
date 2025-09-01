import { atom, useAtom } from "jotai";
import { useEffect } from "react";

const pictures = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
];

export const pageAtom = atom(0);
export const pages = [
  {
    front: "book-cover",
    back: pictures[0],
  },
];
for (let i = 1; i < pictures.length - 1; i += 2) {
  pages.push({
    front: pictures[i % pictures.length],
    back: pictures[(i + 1) % pictures.length],
  });
}

pages.push({
  front: pictures[pictures.length - 1],
  back: "book-back",
});

export const UI = () => {
  const [page, setPage] = useAtom(pageAtom);

  useEffect(() => {
    const audio = new Audio("/audios/page-flip-01a.mp3");
    audio.play().catch((error) => {
      // Silently handle the error - audio will play on subsequent user interactions
      console.log(
        "Audio play failed (requires user interaction):",
        error.message
      );
    });
  }, [page]);

  return (
    <>
      <main className="pointer-events-none select-none z-10 fixed inset-0 flex justify-end flex-col">
        <div className="w-full overflow-auto pointer-events-auto flex justify-center">
          <div className="overflow-auto flex items-center gap-2 sm:gap-4 max-w-full p-4 lg:p-10">
            {[...pages].map((_, index) => (
              <button
                key={index}
                className={`whitespace-nowrap py-2 lg:py-3 px-6 lg:px-8 border border-white rounded-full text-white hover:cursor-pointer hover:text-white font-poppins text-base lg:text-lg tracking-wide hover:scale-105 transition-all duration-300 ${
                  index === page
                    ? "bg-white !text-black "
                    : "bg-black/30 text-white"
                }`}
                onClick={() => setPage(index)}
              >
                {index === 0 ? "Cover" : `Page ${index}`}
              </button>
            ))}
            <button
              className={`whitespace-nowrap py-2 lg:py-3 px-6 lg:px-8 border border-white rounded-full text-white hover:cursor-pointer hover:text-white font-poppins  text-base lg:text-lg tracking-wide hover:scale-105 transition-all duration-300 ${
                page === pages.length
                  ? "bg-white !text-black "
                  : "bg-black/30 text-white"
              }`}
              onClick={() => setPage(pages.length)}
            >
              Back Cover
            </button>
          </div>
        </div>
      </main>

      <div className="fixed items-center select-none w-full text-center">
        <h1 className="shrink-0 text-white text-5xl lg:text-9xl font-poppins font-semibold pt-4">
          Your Flipbook Title
        </h1>
      </div>
    </>
  );
};
