import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { supabase } from "../supabaseClient.js";

/* =========================================================
   📌 회원가입
   ========================================================= */
export const signup = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      allergies = [],
      preferred_categories = []
    } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "모든 항목을 입력해주세요." });
    }

    // 중복 이메일 검사
    const { data: existingUser, error: existingCheckErr } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingCheckErr) {
      console.error("signup: existing user check error", existingCheckErr);
      return res.status(500).json({ error: "서버 오류가 발생했습니다." });
    }

    if (existingUser) {
      return res.status(400).json({ error: "이미 존재하는 이메일입니다." });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 DB 생성
    const { data: createdUser, error: createErr } = await supabase
      .from("users")
      .insert([
        {
          username,
          email,
          password_hash: hashedPassword,
          allergies,
          preferred_categories
        }
      ])
      .select("*")
      .single();

    if (createErr) {
      console.error("signup: user create error", createErr);
      return res.status(500).json({ error: "회원가입 처리 중 오류가 발생했습니다." });
    }

    const { password_hash, ...user } = createdUser;
    res.json({ message: "회원가입 완료", user });
  } catch (err) {
    console.error("signup: unexpected error", err);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

/* =========================================================
   📌 로그인
   ========================================================= */
export const login = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password)
      return res.status(400).json({ error: "아이디(이메일)와 비밀번호를 입력해주세요." });

    // 이메일 또는 아이디로 사용자 찾기
    const { data: userData, error: userErr } = await supabase
      .from("users")
      .select("*")
      .or(`email.eq.${loginId},username.eq.${loginId}`)
      .single();

    if (userErr || !userData)
      return res.status(400).json({ error: "계정 정보를 찾을 수 없습니다." });

    // 비밀번호 비교
    const isMatch = await bcrypt.compare(password, userData.password_hash);
    if (!isMatch)
      return res.status(400).json({ error: "이메일 또는 비밀번호가 잘못되었습니다." });

    // JWT 발급
    const token = jwt.sign(
      { id: userData.id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const { password_hash, ...user } = userData;
    res.json({ message: "로그인 성공", token, user });
  } catch (err) {
    console.error("login: unexpected error", err);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

/* =========================================================
   📌 중복 확인 (아이디 & 이메일)
   ========================================================= */
export const checkUsername = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: "아이디를 입력해주세요." });

    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (error) throw error;

    res.json({ available: !data });
  } catch (err) {
    console.error("checkUsername error", err);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

export const checkEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "이메일을 입력해주세요." });

    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (error) throw error;

    res.json({ available: !data });
  } catch (err) {
    console.error("checkEmail error", err);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};
