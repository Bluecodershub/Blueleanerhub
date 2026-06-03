// Stub pool for legacy code
export const pool = {
  query: async (_sql: string, _params?: any[]) => ({ rows: [], rowCount: 0 }),
  end: async () => {},
};

export default pool;