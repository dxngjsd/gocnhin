export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { ticker } = req.body;
  if (!ticker) return res.status(400).json({ error: 'Missing ticker' });

  const prompt = `Bạn là một chuyên gia phân tích chứng khoán Việt Nam với 10 năm kinh nghiệm, chuyên áp dụng phương pháp CANSLIM và phân tích cơ bản.

Hãy viết một báo cáo phân tích ngắn gọn (1 trang) cho cổ phiếu ${ticker} niêm yết trên thị trường chứng khoán Việt Nam.

Báo cáo cần có các phần sau, mỗi phần 2-3 câu súc tích:

## Tổng quan doanh nghiệp
Mô tả ngắn về công ty, ngành nghề, vị thế thị trường.

## Điểm nổi bật tài chính
Nhận xét về tăng trưởng doanh thu, lợi nhuận, EPS trong 1-2 năm gần đây. Đề cập biên lợi nhuận và ROE nếu đáng chú ý.

## Phân tích theo CANSLIM
Đánh giá ngắn gọn các tiêu chí C (EPS hiện tại), A (tăng trưởng hàng năm), N (catalyst mới), S (cung cầu cổ phiếu).

## Định giá & Kỹ thuật
Nhận xét về mức định giá hiện tại (P/E, P/B so với ngành), xu hướng giá và các mức hỗ trợ/kháng cự đáng chú ý.

## Rủi ro chính
2-3 rủi ro cụ thể nhất cần theo dõi với cổ phiếu này.

Viết bằng tiếng Việt, chuyên nghiệp nhưng dễ hiểu.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text;
    if (!text) return res.status(500).json({ error: data.error?.message || 'No response' });
    return res.status(200).json({ text });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
