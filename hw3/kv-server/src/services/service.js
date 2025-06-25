class Service {
  static async get(key) {
    const response = await fetch(`${process.env.REDIS_URL}/get?key=${key}`);

    return await response.json();
  }

  static async set(key, value) {
    const response = await fetch(`${process.env.REDIS_URL}/set`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value })
    });

    return await response.json();
  }
}

export default Service;
