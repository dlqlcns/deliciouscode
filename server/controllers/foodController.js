import axios from "axios";

export const getFoodInfo = async (req, res) => {
  const keyword = req.query.q;
  const API_KEY = process.env.FOOD_API_KEY; // .env에 저장된 API KEY

  if (!keyword) {
    return res.status(400).json({ error: "검색어(q)가 필요합니다." });
  }

  const url = `http://openapi.foodsafetykorea.go.kr/api/${API_KEY}/I2710/json/1/20/DESC_KOR=${encodeURIComponent(keyword)}`;

  try {
    const response = await axios.get(url);

    // API 원본 데이터 그대로 반환 (필요하면 정제하여 보낼 수 있음)
    return res.json(response.data);
  } catch (error) {
    console.error("Food API Error:", error);
    return res.status(500).json({ error: "API 요청 실패" });
  }
};
