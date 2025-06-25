import Service from "../services/service.js";

export const getValue = async (req, res) => {
  try {
    const data = await Service.get(req.params.key);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error || "Internal Server Error" });
  }
};

export const setValue = async (req, res) => {
  try {
    const { key, value } = req.body;
    const data = await Service.set(key, value);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error || "Internal Server Error" });
  }
};
