const Storage = (() => {
  const KEYS = {
    cars: "jan_showroom_cars",
    expenses: "jan_showroom_expenses",
    repairs: "jan_showroom_repairs",
    activities: "jan_showroom_activities",
    settings: "jan_showroom_settings",
    auth: "jan_showroom_admin_auth",
  };
  const read = (k, f) => {
    try {
      const r = localStorage.getItem(k);
      return r ? JSON.parse(r) : f;
    } catch (e) {
      return f;
    }
  };
  const write = (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
      return true;
    } catch (e) {
      Toast?.show?.(
        "Storage limit reached. Try fewer or smaller images.",
        "error",
      );
      return false;
    }
  };
  return {
    KEYS,
    getCars: () => read(KEYS.cars, []),
    saveCars: (v) => write(KEYS.cars, v),
    getExpenses: () => read(KEYS.expenses, []),
    saveExpenses: (v) => write(KEYS.expenses, v),
    getRepairs: () => read(KEYS.repairs, []),
    saveRepairs: (v) => write(KEYS.repairs, v),
    getActivities: () => read(KEYS.activities, []),
    saveActivities: (v) => write(KEYS.activities, v),
    getSettings: () => read(KEYS.settings, {}),
    saveSettings: (v) => write(KEYS.settings, v),
    isLoggedIn: () => localStorage.getItem(KEYS.auth) === "1",
    login: () => localStorage.setItem(KEYS.auth, "1"),
    logout: () => localStorage.removeItem(KEYS.auth),
    clearData: () =>
      [
        KEYS.cars,
        KEYS.expenses,
        KEYS.repairs,
        KEYS.activities,
        KEYS.settings,
      ].forEach((k) => localStorage.removeItem(k)),
  };
})();
