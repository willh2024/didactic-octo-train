import React, { useEffect } from "react";
import { useSpring, animated } from "@react-spring/web";
import "./App.css";
import crown from "./crownie_from_lr.png";
import { getRankProgress } from "./ranks";

type PlayerResult = {
  ranking: string;
  current_mmr: number;
  current_lr: number;
  current_emblem: string;
};

type ApiResponse = {
  status: "success" | "error";
  results: PlayerResult[];
};

type Trend = "up" | "down" | "flat";

const POLL_INTERVAL_MS = 120000;

export default function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const ladderType = searchParams.get("ct") === null ? "rt" : "ct";
  const mmrType = searchParams.get("mmr") === null ? "lr" : "mmr";
  const name = searchParams.get("name");

  const [score, setScore] = React.useState<number | null>(null);
  const scoreRef = React.useRef<number | null>(null);
  const [rankURL, setRankURL] = React.useState("");
  const [diff, setDiff] = React.useState("");
  const [trend, setTrend] = React.useState<Trend>("flat");
  const [changeCount, setChangeCount] = React.useState(0);
  const spring = useSpring({ val: score ?? 0 });

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    const fetchData = () =>
      fetch(
        `https://www.mkwlounge.gg/api/ladderplayer.php?ladder_type=${ladderType}&player_names=${name}`
      )
        .then((response) => response.json())
        .then((res: ApiResponse) => res.results)
        .then((players) => {
          if (players.length === 0) {
            return;
          }
          const data = players[0];
          const next = mmrType === "lr" ? data.current_lr : data.current_mmr;

          if (next === scoreRef.current) {
            return;
          }

          const change = scoreRef.current !== null ? next - scoreRef.current : 0;
          setScore(next);
          setChangeCount((n) => n + 1);

          if (change > 0) {
            setTrend("up");
            setDiff("+" + change);
          } else if (change < 0) {
            setTrend("down");
            setDiff(change.toString());
          } else {
            setTrend("flat");
            setDiff("");
          }

          setRankURL(data.ranking !== "1" ? data.current_emblem : crown);
        })
        .catch((error) => {
          console.error("Error:", error);
        });

    fetchData();
    const id = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [ladderType, name, mmrType]);

  if (name === null) {
    return (
      <div>
        <p>
          no stat to display, please check the url and make sure you have
          ?name=your_name (and &ct if you want to use ct mode) in the url
        </p>
      </div>
    );
  }

  // The rank boundaries are LR values, so the next-rank info is LR mode only.
  const rank =
    mmrType === "lr" && score !== null ? getRankProgress(score) : null;

  return (
    <div className="stats">
      <div className="card">
        {rankURL && <img src={rankURL} className="emblem" alt="" />}
        <div className="info">
          <div className="main">
            <animated.span className="score">
              {spring.val.to((x: number) => Math.round(x || 0).toString())}
            </animated.span>
            {diff !== "" && (
              <span key={changeCount} className={`delta ${trend}`}>
                {diff}
              </span>
            )}
          </div>
          {rank && (
            <div className="next">
              <div className="next-text">
                {rank.next ? (
                  <>
                    <span>{rank.toNext} LR to </span>
                    <span className="next-name">{rank.next.name}</span>
                  </>
                ) : (
                  <span className="next-name">{rank.current.name} · max rank</span>
                )}
              </div>
              <div className="bar">
                <div
                  className="fill"
                  style={{ width: `${rank.progress * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
