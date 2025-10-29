import express from 'express';
const router = express.Router();

// Example endpoint: GET /api/calendar/test
router.get('/test', (req, res) => {
  res.json({ message: 'Calendar route is working!' });
});

export default router;