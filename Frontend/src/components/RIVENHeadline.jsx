"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_SEQUENCES = [
  { text: "ASK RIVEN", deleteAfter: true, pauseAfter: 1400 },
  { text: "KNOW TRIVENTS", deleteAfter: true, pauseAfter: 1400 },
  { text: "EXPLORE MORE", deleteAfter: false, pauseAfter: 1800 },
];

export default function RIVENHeadline({
  sequences = DEFAULT_SEQUENCES,
  typingSpeed = 70,
  deleteSpeed = 35,
  startDelay = 350,
  loopDelay = 1200,
}) {
  const [displayText, setDisplayText] = useState("");

  const sequenceIndex = useRef(0);
  const characterIndex = useRef(0);
  const deleting = useRef(false);
  const timer = useRef(null);

  useEffect(() => {
    const run = () => {
      const current =
        sequences[sequenceIndex.current] || sequences[0];

      if (!current) return;

      if (!deleting.current) {
        if (characterIndex.current < current.text.length) {
          characterIndex.current += 1;

          setDisplayText(
            current.text.slice(0, characterIndex.current)
          );

          timer.current = setTimeout(run, typingSpeed);
          return;
        }

        if (current.deleteAfter) {
          timer.current = setTimeout(() => {
            deleting.current = true;
            run();
          }, current.pauseAfter ?? 1200);

          return;
        }

        timer.current = setTimeout(() => {
          sequenceIndex.current = 0;
          characterIndex.current = 0;
          setDisplayText("");
          deleting.current = false;
          run();
        }, current.pauseAfter ?? loopDelay);

        return;
      }

      if (characterIndex.current > 0) {
        characterIndex.current -= 1;

        setDisplayText(
          current.text.slice(0, characterIndex.current)
        );

        timer.current = setTimeout(run, deleteSpeed);
        return;
      }

      deleting.current = false;

      const nextIndex =
        (sequenceIndex.current + 1) % sequences.length;

      sequenceIndex.current = nextIndex;

      timer.current = setTimeout(run, 180);
    };

    timer.current = setTimeout(run, startDelay);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [
    sequences,
    typingSpeed,
    deleteSpeed,
    startDelay,
    loopDelay,
  ]);

  return (
    <div className="RIVEN-headline">
      <div className="RIVEN-headline-main">
        R I V E N
      </div>

      <div className="RIVEN-headline-type">
        <span>{displayText}</span>
        <span
          className="RIVEN-cursor"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}