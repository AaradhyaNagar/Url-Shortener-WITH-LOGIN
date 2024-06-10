const shortid = require("shortid");
const URL = require("../models/url");

const generateNewShortURL = async (req, res) => {
  const body = req.body;
  const shortID = shortid();
  try {
    await URL.create({
      shortId: shortID,
      redirectURL: body.url,
      visitHistory: [],
    });
  } catch (error) {
    if (error.code === 11000) {
      const existingUrl = await URL.findOne({ redirectURL: body.url });
      if (existingUrl) {
        return res.render("application-page", {
          error: `${existingUrl.shortId}`,
        });
      }
    }
  }
  return res.render("application-page", { id: shortID });
};

const redirectToOriginalURL = async (req, res) => {
  const shortId = req.params.shortId;

  const entry = await URL.findOneAndUpdate(
    { shortId },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );

  if (entry.redirectURL.startsWith("https://")) {
    res.redirect(entry.redirectURL);
  }
  else{
    res.redirect("https://" + entry.redirectURL);
  }
};

const getAnalytics = async (req, res) => {
  const shortId = req.params.shortId;
  const result = await URL.findOne({ shortId });
  return res.json({
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
};
module.exports = {
  generateNewShortURL,
  getAnalytics,
  redirectToOriginalURL,
};
