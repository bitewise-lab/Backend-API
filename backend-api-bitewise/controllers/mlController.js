const { getPrediction } = require('../config/ml');

const getPredictionHandler = async (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ error: "Input data is required" });
    }
    const prediction = await getPrediction(input);

    res.status(200).json({ success: true, prediction });
  } catch (error) {
    console.error("Error fetching prediction:", error.message);
    res.status(500).json({ error: "Failed to fetch prediction from ML model" });
  }
};

module.exports = { getPredictionHandler };

