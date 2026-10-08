import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  getMovie,
  getWishlist,
  putVote,
  addToWishlist,
  removeFromWishlist,
} from "../api/backend";
// TODO ขั้นที่ 5 (Lab): import { putVote, addToWishlist, removeFromWishlist } from '../api/backend';

// แถบปุ่มใต้ชื่อหนัง: ให้คะแนน 1 ถึง 10 และปุ่มเพิ่มเข้า wishlist (ต้อง login)
function MovieActions({ movieId }) {
  const { isLoggedIn, token } = useAuth(); // TODO ขั้นที่ 5 (Lab): ดึง token มาด้วย เพื่อส่งให้ putVote / addToWishlist
  const [myScore, setMyScore] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!isLoggedIn || !token) return;

    async function loadMyData() {
      try {
        const [movieData, wishlistData] = await Promise.all([
          getMovie(movieId),
          getWishlist(token),
        ]);

        // โหลดคะแนนที่เคยโหวตไว้จาก server
        const vote = movieData.vote;
        const score = typeof vote === "number" ? vote : (vote?.score ?? null);
        setMyScore(score);

        // เช็กว่าหนังเรื่องนี้อยู่ใน wishlist หรือไม่
        const exists = wishlistData.items?.some(
          (item) => String(item.id ?? item.movieId) === String(movieId),
        );

        setInWishlist(exists);
      } catch (err) {
        setMessage(err.message);
      }
    }

    loadMyData();
  }, [movieId, isLoggedIn, token]);

  if (!isLoggedIn) {
    return (
      <p className="mt-4 text-sm text-slate-500">
        <Link to="/login" className="text-emerald-600 hover:underline">
          เข้าสู่ระบบ
        </Link>{" "}
        เพื่อให้คะแนนและเพิ่มเข้ารายการที่อยากดู
      </p>
    );
  }

  async function handleVote(score) {
    // TODO ขั้นที่ 5 (Lab): await putVote(movieId, score, token) ก่อน แล้วค่อย setMyScore ถ้าพลาดให้ setMessage(err.message)
    try {
      setMessage(null);
      await putVote(movieId, score, token);
      setMyScore(score);
      setMessage("บันทึกคะแนนสำเร็จ");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleWishlist() {
    // TODO ขั้นที่ 5 (Lab): ถ้า inWishlist ให้ await removeFromWishlist ไม่งั้น await addToWishlist แล้วค่อยสลับค่า
    try {
      setMessage(null);
      if (inWishlist) {
        await removeFromWishlist(movieId, token);
        setMessage("ลบออกจากรายการที่อยากดูแล้ว");
      } else {
        await addToWishlist(movieId, token);
        setMessage("เพิ่มเข้ารายการที่อยากดูแล้ว");
      }
      setInWishlist(!inWishlist);
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-2 text-sm text-slate-500">ให้คะแนน</span>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => handleVote(n)}
            className={
              "h-8 w-8 rounded-lg border text-sm " +
              (myScore === n
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-emerald-200 bg-white text-slate-600 hover:bg-emerald-50")
            }
          >
            {n}
          </button>
        ))}
      </div>
      <button
        onClick={handleWishlist}
        className={
          "rounded-lg border px-4 py-2 text-sm " +
          (inWishlist
            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
            : "border-emerald-200 bg-white text-slate-600 hover:bg-emerald-50")
        }
      >
        {inWishlist
          ? "❤️ อยู่ในรายการที่อยากดูแล้ว"
          : "🤍 เพิ่มเข้ารายการที่อยากดู"}
      </button>
      {message && <p className="text-sm text-slate-500">{message}</p>}
    </div>
  );
}

export default MovieActions;