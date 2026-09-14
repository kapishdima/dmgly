"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Current from "./current";
import Studio from "./studio";
import Parcel from "./parcel";
import "./picker.css";
import "./directions.css";

const variants = [Current, Studio, Parcel];
const names = ["Current", "Studio", "Parcel"];

export default function Exploration({ initial }: { initial: number }) {
  const [current, setCurrent] = useState(initial);
  const [replay, setReplay] = useState(0);
  const picker = useRef<HTMLElement>(null);
  const highlight = useRef<HTMLSpanElement>(null);
  const select = useCallback((index: number) => {
    setCurrent(index);
    const url = new URL(location.href);
    url.searchParams.set("v", String(index + 1));
    history.replaceState(null, "", url);
  }, []);
  useLayoutEffect(() => {
    const position = () => {
      const item = picker.current?.querySelector<HTMLElement>("[data-active]");
      if (!item || !highlight.current) return;
      highlight.current.style.width = `${item.offsetWidth}px`;
      highlight.current.style.transform = `translateX(${item.offsetLeft}px)`;
    };
    position();
    window.addEventListener("resize", position);
    return () => window.removeEventListener("resize", position);
  }, [current]);
  useEffect(() => {
    let second = 0;
    const frame = requestAnimationFrame(() => {
      second = requestAnimationFrame(() =>
        picker.current?.setAttribute("data-ready", ""),
      );
    });
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(second);
    };
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey ||
        target.isContentEditable ||
        target.closest(
          "input, textarea, select, [role='slider'], [role='combobox'], [role='dialog'], .canvas-object",
        )
      )
        return;
      const number = Number(event.key);
      if (number >= 1 && number <= 3) {
        event.preventDefault();
        select(number - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        select((current + 1) % 3);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        select((current + 2) % 3);
      } else if (event.key.toLowerCase() === "r")
        setReplay((value) => value + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, select]);
  const Variant = variants[current];
  return (
    <>
      <Variant key={`${current}-${replay}`} />
      <nav
        ref={picker}
        className="proto-picker"
        aria-label="Prototype variants"
      >
        <span
          ref={highlight}
          className="proto-picker-highlight"
          aria-hidden="true"
        />
        {names.map((name, index) => (
          <button
            type="button"
            key={name}
            className="proto-picker-item"
            data-active={index === current ? "" : undefined}
            aria-current={index === current ? "true" : undefined}
            onClick={() => select(index)}
          >
            {name}
          </button>
        ))}
      </nav>
    </>
  );
}
