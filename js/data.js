const DemoData = (() => {
  const carImages = {
    Toyota:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=80",
    Honda:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80",
    Lexus:
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=900&q=80",
    Nissan:
      "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=900&q=80",
    Hyundai:
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=900&q=80",
    Kia: "https://images.unsplash.com/photo-1607853202273-797f1c22a2c5?auto=format&fit=crop&w=900&q=80",
    "Mercedes-Benz":
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80",
    BMW: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80",
    Audi: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80",
    Ford: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80",
  };
  const locations = [
    "Kabul",
    "Herat",
    "Kandahar",
    "Jalalabad",
    "Mazar-i-Sharif",
  ];
  const specs = [
    [
      "Toyota",
      "Camry",
      2022,
      25000,
      42000,
      "Petrol",
      "Automatic",
      "White",
      "Kabul",
    ],
    [
      "Honda",
      "Civic",
      2023,
      23800,
      21000,
      "Petrol",
      "Automatic",
      "Black",
      "Herat",
    ],
    [
      "Lexus",
      "RX 350",
      2021,
      46500,
      33000,
      "Petrol",
      "Automatic",
      "Pearl White",
      "Kabul",
    ],
    [
      "Nissan",
      "Patrol",
      2020,
      52000,
      68000,
      "Petrol",
      "Automatic",
      "Silver",
      "Kandahar",
    ],
    [
      "Hyundai",
      "Tucson",
      2022,
      28500,
      29000,
      "Petrol",
      "Automatic",
      "Blue",
      "Jalalabad",
    ],
    [
      "Kia",
      "Sportage",
      2023,
      31500,
      18000,
      "Petrol",
      "Automatic",
      "Gray",
      "Mazar-i-Sharif",
    ],
    [
      "Mercedes-Benz",
      "C 200",
      2021,
      48500,
      26000,
      "Petrol",
      "Automatic",
      "Black",
      "Kabul",
    ],
    ["BMW", "X3", 2022, 54500, 24000, "Petrol", "Automatic", "White", "Kabul"],
    ["Audi", "A6", 2020, 41000, 51000, "Petrol", "Automatic", "Gray", "Herat"],
    [
      "Ford",
      "Ranger",
      2021,
      36500,
      44000,
      "Diesel",
      "Automatic",
      "Black",
      "Kandahar",
    ],
    [
      "Toyota",
      "Land Cruiser",
      2019,
      62500,
      79000,
      "Diesel",
      "Automatic",
      "White",
      "Kabul",
    ],
    [
      "Honda",
      "CR-V",
      2022,
      33000,
      35000,
      "Petrol",
      "Automatic",
      "Silver",
      "Herat",
    ],
    [
      "Nissan",
      "X-Trail",
      2021,
      29800,
      39000,
      "Petrol",
      "Automatic",
      "Red",
      "Jalalabad",
    ],
    [
      "Hyundai",
      "Elantra",
      2023,
      22000,
      14000,
      "Petrol",
      "Automatic",
      "White",
      "Kabul",
    ],
    [
      "Kia",
      "Sorento",
      2020,
      34200,
      56000,
      "Petrol",
      "Automatic",
      "Black",
      "Mazar-i-Sharif",
    ],
    [
      "Toyota",
      "Corolla",
      2021,
      20500,
      47000,
      "Petrol",
      "Automatic",
      "Silver",
      "Kabul",
    ],
    [
      "Lexus",
      "ES 350",
      2020,
      39000,
      48000,
      "Petrol",
      "Automatic",
      "Black",
      "Herat",
    ],
    [
      "Mercedes-Benz",
      "E 200",
      2019,
      44500,
      61000,
      "Petrol",
      "Automatic",
      "Silver",
      "Kabul",
    ],
  ];
  const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
  const origins = [
    "Dubai, UAE",
    "Tokyo, Japan",
    "Yokohama, Japan",
    "Sharjah, UAE",
    "Bandar Abbas, Iran",
  ];
  const destinations = [
    "Kabul",
    "Herat",
    "Kandahar",
    "Jalalabad",
    "Mazar-i-Sharif",
  ];
  const conditionFields = [
    "Pictured",
    "CD Player",
    "TV",
    "Front Glass",
    "Remote",
    "Battery",
    "Sport Wheel",
    "Damaged",
    "Head Rest",
    "Title Received",
  ];
  const customerNames = [
    "Ahmad Zubair",
    "Fahim Rahimi",
    "Naseer Ahmadzai",
    "Sayed Karimi",
    "Rohullah Noori",
  ];
  const vinFor = (s, i) =>
    `${s[0].slice(0, 3).toUpperCase()}${s[2]}${String(100000 + i * 37).padStart(6, "0")}AF`;
  const chassisFor = (s, i) =>
    `CH-${s[2]}-${String(1000 + i * 13).padStart(4, "0")}`;
  const containerFor = (i) =>
    `MSKU${String(4000000 + i * 8123).padStart(7, "0")}`;
  const financeFor = (s, i) => {
    const purchaseCost = s[3];
    const recovery = 150 + (i % 4) * 40;
    const dubaiToIslamQala = 300 + (i % 5) * 60;
    const transportation = 120 + (i % 3) * 35;
    const customs = 400 + (i % 6) * 70;
    const repair = 80 + (i % 4) * 45;
    const maintenance = 60 + (i % 3) * 30;
    const documentation = 40 + (i % 2) * 25;
    const otherExpenses = 30 + (i % 5) * 15;
    const totalExpenditure =
      recovery +
      dubaiToIslamQala +
      transportation +
      customs +
      repair +
      maintenance +
      documentation +
      otherExpenses;
    return {
      purchaseCost,
      recovery,
      dubaiToIslamQala,
      transportation,
      customs,
      repair,
      maintenance,
      documentation,
      otherExpenses,
      totalExpenditure,
    };
  };
  const cars = specs.map((s, i) => {
    const delivered = i % 3 === 0;
    const damaged = i % 5 === 0;
    const titleReceived = i % 2 === 0;
    const condition = Object.fromEntries(
      conditionFields.map((f, fi) => {
        if (f === "Damaged") return [f, damaged ? "Yes" : "No"];
        if (f === "Title Received") return [f, titleReceived ? "Yes" : "No"];
        return [f, (i + fi) % 3 === 0 ? "No" : "Yes"];
      }),
    );
    return {
      id: `car-${String(i + 1).padStart(3, "0")}`,
      brand: s[0],
      model: s[1],
      year: s[2],
      price: s[3],
      mileage: s[4],
      fuelType: s[5],
      transmission: s[6],
      color: s[7],
      location: s[8],
      description: `Well maintained ${s[0]} ${s[1]} with documented showroom inspection. Suitable for city and long-distance driving.`,
      images: [carImages[s[0]]],
      status: i < 4 ? "Sold" : "Available",
      createdAt: daysAgo(i % 9),
      soldAt: i < 4 ? daysAgo((i % 6) + 1) : null,
      salePrice: i < 4 ? s[3] + (i % 2 ? 700 : 1200) : null,
      notes:
        i % 3 === 0
          ? "Recently inspected. Documents are available at the showroom."
          : "",
      date: daysAgo(i % 9).slice(0, 10),
      vin: vinFor(s, i),
      chassisNumber: chassisFor(s, i),
      firstLocation: origins[i % origins.length],
      destination: destinations[i % destinations.length],
      container: containerFor(i),
      customerName: delivered ? customerNames[i % customerNames.length] : "",
      delivery: {
        status: delivered ? "Delivered" : "Pending",
        date: delivered ? daysAgo((i % 6) + 1).slice(0, 10) : "",
        location: destinations[i % destinations.length],
        deliveredTo: delivered ? customerNames[i % customerNames.length] : "",
        notes: delivered ? "Handed over after final inspection." : "",
      },
      condition,
      damage: { damaged: damaged ? "Yes" : "No" },
      finance: financeFor(s, i),
    };
  });
  const expenses = [
    ["2026-09-04", "Maintenance", 480, "Routine vehicle maintenance"],
    ["2026-09-03", "Fuel", 220, "Showroom and test-drive fuel"],
    ["2026-09-02", "Utilities", 180, "Showroom electricity and water"],
    ["2026-09-01", "Marketing", 350, "Digital advertising"],
    ["2026-08-30", "Transportation", 160, "Vehicle transport within Kabul"],
    ["2026-08-28", "Maintenance", 620, "Brake and tire service"],
    ["2026-08-25", "Rent", 1200, "Monthly showroom rent"],
    ["2026-08-22", "Salaries", 2100, "Staff salaries"],
    ["2026-08-18", "Fuel", 190, "Fuel for inventory movement"],
    ["2026-08-14", "Other", 130, "Office supplies"],
    ["2026-08-10", "Maintenance", 390, "Air conditioning service"],
    ["2026-08-05", "Marketing", 275, "Printed showroom materials"],
  ].map((e, i) => ({
    id: `expense-${i + 1}`,
    date: e[0],
    category: e[1],
    amount: e[2],
    description: e[3],
    createdAt: new Date(`${e[0]}T10:00:00`).toISOString(),
  }));
  const activities = [
    {
      id: "activity-1",
      type: "car_sold",
      description: "Toyota Land Cruiser was sold",
      createdAt: daysAgo(0),
    },
    {
      id: "activity-2",
      type: "expense_added",
      description: "Maintenance expense added",
      createdAt: daysAgo(0),
    },
    {
      id: "activity-3",
      type: "car_added",
      description: "Hyundai Elantra was added",
      createdAt: daysAgo(1),
    },
    {
      id: "activity-4",
      type: "car_edited",
      description: "BMW X3 details were updated",
      createdAt: daysAgo(2),
    },
    {
      id: "activity-5",
      type: "car_sold",
      description: "Honda Civic was sold",
      createdAt: daysAgo(2),
    },
    {
      id: "activity-6",
      type: "settings_updated",
      description: "Showroom settings were updated",
      createdAt: daysAgo(3),
    },
  ];
  const settings = {
    showroomName: "Jan Motor Showroom",
    phone: "+93 700 123 456",
    email: "info@janmotorshowroom.demo",
    address: "Kabul, Afghanistan",
    theme: "light",
    userName: "Showroom Manager",
    role: "Administrator",
  };
  const repairs = [
    {
      id: "repair-1",
      carId: "car-005",
      date: "2026-09-03",
      type: "Oil & Filter",
      cost: 120,
      status: "Completed",
      notes: "Oil, filter and inspection completed.",
      images: [],
      createdAt: "2026-09-03T11:00:00.000Z",
    },
    {
      id: "repair-2",
      carId: "car-007",
      date: "2026-09-02",
      type: "Brake Service",
      cost: 380,
      status: "In Progress",
      notes: "Front brake pads being replaced.",
      images: [],
      createdAt: "2026-09-02T12:00:00.000Z",
    },
    {
      id: "repair-3",
      carId: "car-010",
      date: "2026-08-30",
      type: "Tire Replacement",
      cost: 620,
      status: "Completed",
      notes: "Four tires replaced.",
      images: [],
      createdAt: "2026-08-30T10:00:00.000Z",
    },
  ];
  function seed(force = false) {
    if (force) Storage.clearAll();
    if (!localStorage.getItem(Storage.KEYS.cars)) Storage.saveCars(cars);
    if (!localStorage.getItem(Storage.KEYS.expenses))
      Storage.saveExpenses(expenses);
    if (!localStorage.getItem(Storage.KEYS.activities))
      Storage.saveActivities(activities);
    if (!localStorage.getItem(Storage.KEYS.repairs))
      Storage.saveRepairs(repairs);
    if (!localStorage.getItem(Storage.KEYS.settings))
      Storage.saveSettings(settings);
  }
  return { seed, original: { cars, expenses, repairs, activities, settings } };
})();
