export const now = () => Date.now() - process.env.DAY_OFFSET * 24 * 60 * 60 * 1000;
