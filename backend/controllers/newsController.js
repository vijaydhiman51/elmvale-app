const News = require("../models/News.js");

exports.getAllNews = async (req, res) => {
  try {
    const news = await News.find({}).sort({ date: -1 });
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: "Error fetching news", error });
  }
};

exports.AddNews = async (req, res) => {
  try {
    const { title, content, date } = req.body;
    const news = new News({ title, content, date });
    await news.save();
    res.status(201).json(news);
  } catch (error) {
    res.status(500).json({ message: "Error adding news", error });
  }
};

exports.DeleteNews = async (req, res) => {
  try {
    const { id } = req.query;
    await News.findByIdAndDelete(id);
    res.status(200).json({ message: "News deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting news", error });
  }
};
