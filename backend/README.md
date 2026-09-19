# HJ Earnings Custom Backend

Firebase nahi hai. Stack: Node.js + Express + MySQL + JWT + bcrypt.

1. MySQL/phpMyAdmin me `schema.sql` run karo.
2. `.env.example` ko `.env` banao aur MySQL details + JWT_SECRET set karo.
3. `npm install`
4. `(optional) npm run admin` se admin account create/promote karo.
5. `npm run dev`
6. Health: http://localhost:5000/api/health

Protected API requests me `Authorization: Bearer TOKEN` bhejna hai.

Routes:
POST /api/auth/register
POST /api/auth/login
GET /api/user/me
GET /api/user/history
POST /api/earning/daily-bonus
POST /api/earning/spin
POST /api/withdrawals
GET /api/withdrawals
GET /api/admin/withdrawals
PATCH /api/admin/withdrawals/:id

Withdrawal reject hone par reserved points automatically user ko refund hote hain.

IMPORTANT: `.env` ko frontend me mat rakhna. MySQL password/JWT secret kabhi public JS me nahi dalna.
