const App = (() => {
  const $ = (s) => document.querySelector(s),
    esc = (v) =>
      String(v ?? "").replace(
        /[&<>"']/g,
        (m) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;",
          })[m],
      );

  const money = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(n) || 0);

  const date = (d) =>
    d
      ? new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(new Date(d))
      : "N/A";

  const today = () => new Date().toISOString().slice(0, 10);

  const uid = (p) =>
    `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const activity = (type, text) => {
    const a = Storage.getActivities();

    a.unshift({
      id: uid("activity"),
      type,
      description: text,
      createdAt: new Date().toISOString(),
    });

    Storage.saveActivities(a.slice(0, 100));
  };

  const carById = (id) => Storage.getCars().find((c) => c.id === id);

  const imageFallback =
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80";

  const metric = (
    cars = Storage.getCars(),
    ex = Storage.getExpenses(),
    rep = Storage.getRepairs(),
  ) => {
    const sold = cars.filter((c) => c.status === "Sold");

    const sales = sold.reduce((a, c) => a + Number(c.salePrice || c.price), 0);

    const expenses = ex.reduce((a, e) => a + Number(e.amount), 0);

    const repairCost = rep.reduce((a, r) => a + Number(r.cost || 0), 0);

    const net = sales - expenses - repairCost;

    return {
      total: cars.length,

      available: cars.filter((c) => c.status === "Available").length,

      sold: sold.length,

      sales,

      expenses,

      repairCost,

      profit: Math.max(0, net),

      loss: Math.max(0, -net),
    };
  };

  /* ==========================================
     PAGE
  ========================================== */

  function page(title, body) {
    $("#page-title").textContent = title;

    $("#breadcrumb").textContent = title;

    $("#app").innerHTML = `<div class="page-enter">${body}</div>`;

    $("#app").focus({
      preventScroll: true,
    });
  }

  /* ==========================================
     STAT CARD
  ========================================== */

  function stat(label, value, support, icon) {
    return `
      <div class="stat-card">

        <div class="stat-top">
          <span class="stat-label">
            ${label}
          </span>

          <span class="stat-icon">
            ${icon}
          </span>
        </div>

        <div class="stat-value">
          ${value}
        </div>

        <div class="stat-support">
          ${support}
        </div>

      </div>
    `;
  }

  /* ==========================================
     EMPTY STATE
  ========================================== */

  function empty(title, text, route) {
    return `
      <div class="empty">

        <div class="empty-icon">
          🚘
        </div>

        <strong>
          ${title}
        </strong>

        <p>
          ${text}
        </p>

        ${
          route
            ? `
              <button
                class="btn btn-primary"
                onclick="
                  Navigation.go('${route}')
                "
              >
                ＋ Add Car
              </button>
            `
            : ""
        }

      </div>
    `;
  }

  /* ==========================================
     REPAIR COST
  ========================================== */

  function repairCostForCar(carId) {
    return Storage.getRepairs()
      .filter((r) => r.carId === carId)
      .reduce((sum, r) => sum + Number(r.cost || 0), 0);
  }

  /* ==========================================
     CAR CARDS
  ========================================== */

  function carCards(cars) {
    if (!cars.length) {
      return empty(
        "No cars found",
        "Try changing your filters or add a new vehicle.",
        "add-car",
      );
    }

    return `
      <div class="car-grid">

        ${cars
          .map((c) => {
            const repairCost = repairCostForCar(c.id);

            const totalCost = Number(c.price || 0) + repairCost;

            return `
              <article class="car-card">

                <div class="car-image-wrap">

                  <img
                    src="${esc(c.images?.[0] || imageFallback)}"
                    alt="${esc(c.brand + " " + c.model)}"
                    onerror="
                      this.src='${imageFallback}'
                    "
                  >

                  <span
                    class="
                      badge
                      ${
                        c.status === "Available"
                          ? "badge-available"
                          : "badge-sold"
                      }
                    "
                  >
                    ${c.status}
                  </span>

                  <span class="image-count">
                    ${c.images?.length || 0}
                    photo${(c.images?.length || 0) === 1 ? "" : "s"}
                  </span>

                </div>


                <div class="car-card-body">

                  <h3>
                    ${esc(c.brand)}
                    ${esc(c.model)}
                  </h3>

                  <div class="car-meta">
                    ${c.year}
                    ·
                    ${Number(c.mileage || 0).toLocaleString()}
                    km
                    ·
                    ${esc(c.location)}
                  </div>

                  <div class="car-price">
                    ${money(c.salePrice || c.price)}
                  </div>

                  <div class="car-costs">

                    <div>
                      <span>
                        Repair Cost
                      </span>

                      <strong>
                        ${money(repairCost)}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Total Cost
                      </span>

                      <strong>
                        ${money(totalCost)}
                      </strong>
                    </div>

                  </div>

                  <div class="actions">

                    <button
                      class="btn btn-sm"
                      onclick="
                        App.viewCar('${c.id}')
                      "
                    >
                      View
                    </button>

                    <button
                      class="btn btn-sm"
                      onclick="
                        App.editCar('${c.id}')
                      "
                    >
                      Edit
                    </button>

                    ${
                      c.status === "Available"
                        ? `
                          <button
                            class="
                              btn
                              btn-sm
                              btn-success
                            "
                            onclick="
                              App.sellCar('${c.id}')
                            "
                          >
                            Sell
                          </button>
                        `
                        : ""
                    }

                    <button
                      class="
                        btn
                        btn-sm
                        btn-danger
                      "
                      onclick="
                        App.deleteCar('${c.id}')
                      "
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </article>
            `;
          })
          .join("")}

      </div>
    `;
  }

  /* ==========================================
     DASHBOARD
  ========================================== */

  function dashboard() {
    const cars = Storage.getCars();

    const ex = Storage.getExpenses();

    const rep = Storage.getRepairs();

    const m = metric(cars, ex, rep);

    const t = today();

    const soldToday = cars.filter((c) => c.soldAt?.slice(0, 10) === t);

    const salesToday = soldToday.reduce(
      (a, c) => a + Number(c.salePrice || 0),
      0,
    );

    const exToday = ex
      .filter((e) => e.date === t)
      .reduce((a, e) => a + Number(e.amount), 0);

    const repToday = rep
      .filter((r) => r.date === t)
      .reduce((a, r) => a + Number(r.cost), 0);

    const net = salesToday - exToday - repToday;

    const acts = Storage.getActivities().slice(0, 6);

    page(
      "Dashboard",

      `
        <div class="section-head">

          <div>

            <h2>
              Showroom overview
            </h2>

            <p>
              Manage inventory, sales, repairs and daily operations.
            </p>

          </div>

          <button
            class="btn btn-primary"
            onclick="
              Navigation.go('add-car')
            "
          >
            ＋ Add Car
          </button>

        </div>


        <div class="stats-grid">

          ${stat("Total Cars", m.total, "All inventory records", "🚘")}

          ${stat("Available Cars", m.available, "Ready for sale", "✓")}

          ${stat("Sold Cars", m.sold, "Completed sales", "↗")}

          ${stat("Total Sales", money(m.sales), "From sold vehicles", "$")}

          ${stat("Total Expenses", money(m.expenses), "Recorded expenses", "◈")}

          ${stat("Repair Costs", money(m.repairCost), "Workshop costs", "🔧")}

          ${stat("Total Profit", money(m.profit), "Sales minus costs", "＋")}

          ${stat(
            "Total Loss",
            money(m.loss),
            "Only when costs exceed sales",
            "−",
          )}

        </div>


        <div class="grid-2">

          <div class="panel">

            <div class="panel-head">

              <h3>
                Today's Summary
              </h3>

              <span>
                ${date(t)}
              </span>

            </div>


            <div class="summary-grid">

              <div class="summary-item">
                <span>Cars Added</span>
                <strong>
                  ${cars.filter((c) => c.createdAt.slice(0, 10) === t).length}
                </strong>
              </div>


              <div class="summary-item">
                <span>Cars Sold</span>
                <strong>
                  ${soldToday.length}
                </strong>
              </div>


              <div class="summary-item">
                <span>Sales</span>
                <strong>
                  ${money(salesToday)}
                </strong>
              </div>


              <div class="summary-item">
                <span>Expenses</span>
                <strong>
                  ${money(exToday)}
                </strong>
              </div>


              <div class="summary-item">
                <span>Repair Costs</span>
                <strong>
                  ${money(repToday)}
                </strong>
              </div>


              <div class="summary-item">

                <span>
                  Net Result
                </span>

                <strong
                  class="${net >= 0 ? "kpi-positive" : "kpi-negative"}"
                >
                  ${money(Math.abs(net))}
                </strong>

              </div>

            </div>

          </div>


          <div class="panel">

            <div class="panel-head">

              <h3>
                Recent Activity
              </h3>

              <span>
                ${acts.length} latest
              </span>

            </div>


            <div class="activity-list">

              ${
                acts.length
                  ? acts
                      .map(
                        (a) => `
                          <div class="activity">

                            <div class="activity-icon">
                              •
                            </div>

                            <div class="activity-body">

                              <strong>
                                ${esc(a.description)}
                              </strong>

                              <span>
                                ${date(a.createdAt)}
                              </span>

                            </div>

                          </div>
                        `,
                      )
                      .join("")
                  : empty(
                      "No recent activity",
                      "Your showroom activity will appear here.",
                    )
              }

            </div>

          </div>

        </div>


        <div class="panel">

          <div class="panel-head">

            <h3>
              Recent Cars
            </h3>

            <button
              class="btn btn-sm"
              onclick="
                Navigation.go('cars')
              "
            >
              View All
            </button>

          </div>


          ${carCards(
            cars
              .slice()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 6),
          )}

        </div>
      `,
    );
  }

  /* ==========================================
     CARS PAGE
  ========================================== */

  function carsPage() {
    page(
      "Cars",

      `
        <div class="section-head">

          <div>

            <h2>
              Vehicle inventory
            </h2>

            <p>
              Simple search and practical filters.
            </p>

          </div>

          <button
            class="btn btn-primary"
            onclick="
              Navigation.go('add-car')
            "
          >
            ＋ Add Car
          </button>

        </div>


        <div class="panel">

          <div class="filters">

            <div class="field search-field">

              <label>
                Search
              </label>

              <input
                id="car-search"
                placeholder="
                  Brand, model or location
                "
              >

            </div>


            <div class="field">

              <label>
                Brand
              </label>

              <select id="car-brand">

                <option value="">
                  All brands
                </option>

                ${[
                  "Toyota",
                  "Honda",
                  "Lexus",
                  "Nissan",
                  "Hyundai",
                  "Kia",
                  "Mercedes-Benz",
                  "BMW",
                  "Audi",
                  "Ford",
                ]
                  .map((x) => `<option>${x}</option>`)
                  .join("")}

              </select>

            </div>


            <div class="field">

              <label>
                Status
              </label>

              <select id="car-status">

                <option value="">
                  All status
                </option>

                <option>
                  Available
                </option>

                <option>
                  Sold
                </option>

              </select>

            </div>


            <div class="field">

              <label>
                Location
              </label>

              <select id="car-location">

                <option value="">
                  All locations
                </option>

                ${["Kabul", "Herat", "Kandahar", "Jalalabad", "Mazar-i-Sharif"]
                  .map((x) => `<option>${x}</option>`)
                  .join("")}

              </select>

            </div>


            <div class="field">

              <label>
                Max Price
              </label>

              <input
                id="car-price"
                type="number"
                min="0"
                placeholder="Any"
              >

            </div>


            <button
              class="btn"
              id="clear-car-filters"
            >
              Clear
            </button>

          </div>


          <div id="cars-results"></div>

        </div>
      `,
    );

    const render = () => {
      let a = Storage.getCars();

      const q = $("#car-search").value.toLowerCase().trim();

      const b = $("#car-brand").value;

      const s = $("#car-status").value;

      const l = $("#car-location").value;

      const p = Number($("#car-price").value || 0);

      a = a.filter(
        (c) =>
          (!q ||
            `${c.brand} ${c.model} ${c.location}`.toLowerCase().includes(q)) &&
          (!b || c.brand === b) &&
          (!s || c.status === s) &&
          (!l || c.location === l) &&
          (!p || Number(c.price) <= p),
      );

      $("#cars-results").innerHTML = carCards(a);
    };

    [
      "car-search",
      "car-brand",
      "car-status",
      "car-location",
      "car-price",
    ].forEach((id) => $("#" + id).addEventListener("input", render));

    $("#clear-car-filters").onclick = () => {
      [
        "car-search",
        "car-brand",
        "car-status",
        "car-location",
        "car-price",
      ].forEach((id) => ($("#" + id).value = ""));

      render();
    };

    render();
  }

  /* ==========================================
     IMAGE UPLOADER
  ========================================== */

  function imageUploader(existing = []) {
    return `
      <div class="upload-box">

        <input
          id="image-input"
          type="file"
          accept="image/*"
          multiple
        >

        <div
          id="image-preview"
          class="image-preview"
        >

          ${
            existing.length
              ? existing
                  .map(
                    (url) => `
                      <img
                        src="${esc(url)}"
                        alt="Vehicle image"
                      >
                    `,
                  )
                  .join("")
              : ""
          }

        </div>

      </div>
    `;
  }

  /* ==========================================
     FORM PAGE
  ========================================== */

  function formPage(id = null) {
    const editing = Boolean(id);

    const existing = editing ? carById(id) : null;

    if (editing && !existing) {
      Navigation.go("cars");
      return;
    }

    const c = existing || {
      id: uid("car"),
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      price: "",
      mileage: "",
      fuelType: "Petrol",
      transmission: "Automatic",
      color: "",
      location: "Kabul",
      destination: "",
      firstLocation: "",
      vin: "",
      customerName: "",
      date: today(),
      status: "Available",
      description: "",
      images: [],
      notes: "",
      salePrice: "",
      soldAt: null,
      condition: {},
      delivery: {},
      damage: {},
      finance: {},
      createdAt: new Date().toISOString(),
    };

    const f = c.finance || {};

    const condition = c.condition || {};

    const delivery = c.delivery || {};

    const damage = c.damage || {};

    page(
      editing ? "Edit Car" : "Add Car",

      `
        <div class="section-head">

          <div>

            <h2>
              ${editing ? "Edit vehicle" : "Add a new vehicle"}
            </h2>

            <p>
              ${
                editing
                  ? "Update all vehicle information."
                  : "Create a complete vehicle record."
              }
            </p>

          </div>

        </div>


        <form
          id="car-form"
          class="panel"
        >

          <div class="form-section">

            <div class="form-section-title">
              Basic Information
            </div>


            <div class="form-grid">

              <div class="field">

                <label>
                  Customer Name
                </label>

                <input
                  name="customerName"
                  value="${esc(c.customerName || "")}"
                >

              </div>


              <div class="field">

                <label>
                  VIN
                </label>

                <input
                  name="vin"
                  value="${esc(c.vin || "")}"
                >

              </div>


              <div class="field">

                <label>
                  Brand
                </label>

                <select name="brand">

                  ${[
                    "Toyota",
                    "Honda",
                    "Lexus",
                    "Nissan",
                    "Hyundai",
                    "Kia",
                    "Mercedes-Benz",
                    "BMW",
                    "Audi",
                    "Ford",
                  ]
                    .map(
                      (x) =>
                        `
                            <option
                              ${c.brand === x ? "selected" : ""}
                            >
                              ${x}
                            </option>
                          `,
                    )
                    .join("")}

                </select>

              </div>


              <div class="field">

                <label>
                  Model
                </label>

                <input
                  name="model"
                  required
                  value="${esc(c.model || "")}"
                >

              </div>


              <div class="field">

                <label>
                  Year
                </label>

                <input
                  name="year"
                  type="number"
                  value="${c.year || ""}"
                >

              </div>


              <div class="field">

                <label>
                  Purchase Cost
                </label>

                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value="${Number(c.price || 0)}"
                >

              </div>


              <div class="field">

                <label>
                  Mileage
                </label>

                <input
                  name="mileage"
                  type="number"
                  min="0"
                  value="${Number(c.mileage || 0)}"
                >

              </div>


              <div class="field">

                <label>
                  Fuel Type
                </label>

                <select name="fuelType">

                  ${["Petrol", "Diesel", "Hybrid", "Electric"]
                    .map(
                      (x) =>
                        `
                            <option
                              ${c.fuelType === x ? "selected" : ""}
                            >
                              ${x}
                            </option>
                          `,
                    )
                    .join("")}

                </select>

              </div>


              <div class="field">

                <label>
                  Transmission
                </label>

                <select name="transmission">

                  ${["Automatic", "Manual"]
                    .map(
                      (x) =>
                        `
                            <option
                              ${c.transmission === x ? "selected" : ""}
                            >
                              ${x}
                            </option>
                          `,
                    )
                    .join("")}

                </select>

              </div>


              <div class="field">

                <label>
                  Color
                </label>

                <input
                  name="color"
                  value="${esc(c.color || "")}"
                >

              </div>


              <div class="field">

                <label>
                  Location
                </label>

                <input
                  name="location"
                  value="${esc(c.location || "")}"
                >

              </div>


              <div class="field">

                <label>
                  First Location
                </label>

                <input
                  name="firstLocation"
                  value="${esc(c.firstLocation || "")}"
                >

              </div>


              <div class="field">

                <label>
                  Destination
                </label>

                <input
                  name="destination"
                  value="${esc(c.destination || "")}"
                >

              </div>


              <div class="field">

                <label>
                  Date
                </label>

                <input
                  name="date"
                  type="date"
                  value="${esc(c.date || c.createdAt?.slice(0, 10) || today())}"
                >

              </div>


              <div class="field">

                <label>
                  Status
                </label>

                <select name="status">

                  ${["Available", "Delivered", "Sold", "Damaged"]
                    .map(
                      (x) =>
                        `
                            <option
                              ${c.status === x ? "selected" : ""}
                            >
                              ${x}
                            </option>
                          `,
                    )
                    .join("")}

                </select>

              </div>


              <div class="field full">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                >${esc(c.description || "")}</textarea>

              </div>


              <div class="field full">

                <label>
                  Notes
                </label>

                <textarea
                  name="notes"
                >${esc(c.notes || "")}</textarea>

              </div>

            </div>

          </div>


          <div class="form-section">

            <div class="form-section-title">
              Vehicle Images
            </div>

            ${imageUploader(c.images || [])}

          </div>


          <div class="form-section">

            <div class="form-section-title">
              Vehicle Condition
            </div>

            <div class="form-grid">

              ${[
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
              ]
                .map(
                  (name) => `
                      <div class="field">

                        <label>
                          ${name}
                        </label>

                        <select
                          name="condition.${name}"
                        >

                          <option
                            value="No"
                            ${condition[name] !== "Yes" ? "selected" : ""}
                          >
                            No
                          </option>

                          <option
                            value="Yes"
                            ${condition[name] === "Yes" ? "selected" : ""}
                          >
                            Yes
                          </option>

                        </select>

                      </div>
                    `,
                )
                .join("")}

            </div>

          </div>


          <div class="form-section">

            <div class="form-section-title">
              Delivery Information
            </div>

            <div class="form-grid">

              <div class="field">

                <label>
                  Deliver Status
                </label>

                <select
                  name="delivery.status"
                >

                  <option
                    value="Pending"
                    ${delivery.status !== "Delivered" ? "selected" : ""}
                  >
                    Pending
                  </option>

                  <option
                    value="Delivered"
                    ${delivery.status === "Delivered" ? "selected" : ""}
                  >
                    Delivered
                  </option>

                </select>

              </div>


              <div class="field">

                <label>
                  Delivery Date
                </label>

                <input
                  name="delivery.date"
                  type="date"
                  value="${esc(delivery.date || "")}"
                >

              </div>


              <div class="field">

                <label>
                  Delivery Location
                </label>

                <input
                  name="delivery.location"
                  value="${esc(delivery.location || "")}"
                >

              </div>


              <div class="field">

                <label>
                  Delivered To
                </label>

                <input
                  name="delivery.deliveredTo"
                  value="${esc(delivery.deliveredTo || "")}"
                >

              </div>


              <div class="field full">

                <label>
                  Delivery Notes
                </label>

                <textarea
                  name="delivery.notes"
                >${esc(delivery.notes || "")}</textarea>

              </div>

            </div>

          </div>


          <div class="form-section">

            <div class="form-section-title">
              Damage Information
            </div>

            <div class="form-grid">

              <div class="field">

                <label>
                  Damaged
                </label>

                <select
                  name="damage.damaged"
                >

                  <option
                    value="No"
                    ${damage.damaged !== "Yes" ? "selected" : ""}
                  >
                    No
                  </option>

                  <option
                    value="Yes"
                    ${damage.damaged === "Yes" ? "selected" : ""}
                  >
                    Yes
                  </option>

                </select>

              </div>


              <div class="field">

                <label>
                  Damage Type
                </label>

                <input
                  name="damage.type"
                  value="${esc(damage.type || "")}"
                >

              </div>


              <div class="field">

                <label>
                  Damage Location
                </label>

                <input
                  name="damage.location"
                  value="${esc(damage.location || "")}"
                >

              </div>


              <div class="field">

                <label>
                  Damage Cost
                </label>

                <input
                  name="damage.cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value="${Number(damage.cost || 0)}"
                >

              </div>


              <div class="field">

                <label>
                  Damage Date
                </label>

                <input
                  name="damage.date"
                  type="date"
                  value="${esc(damage.date || "")}"
                >

              </div>


              <div class="field full">

                <label>
                  Damage Description
                </label>

                <textarea
                  name="damage.description"
                >${esc(damage.description || "")}</textarea>

              </div>

            </div>

          </div>


          <div class="form-section">

            <div class="form-section-title">
              Finance & Expenditure
            </div>

            <div class="form-grid">

              ${[
                ["purchaseCost", "Purchase Cost", c.price],
                ["recovery", "Recovery", 0],
                ["dubaiToIslamQala", "Dubai to Islam Qala Expenses", 0],
                ["transportation", "Transportation", 0],
                ["customs", "Customs", 0],
                ["repair", "Repair", 0],
                ["maintenance", "Maintenance", 0],
                ["documentation", "Documentation", 0],
                ["otherExpenses", "Other Expenses", 0],
              ]
                .map(
                  ([name, label, fallback]) =>
                    `
                        <div class="field">

                          <label>
                            ${label}
                          </label>

                          <input
                            name="finance.${name}"
                            type="number"
                            min="0"
                            step="0.01"
                            value="${Number(f[name] ?? fallback ?? 0)}"
                          >

                        </div>
                      `,
                )
                .join("")}

            </div>

          </div>


          <div class="form-actions">

            <button
              type="button"
              class="btn"
              onclick="
                Navigation.go('car-list')
              "
            >
              Back
            </button>

            <button
              type="submit"
              class="btn btn-primary"
            >
              ${editing ? "Save Changes" : "Add Car"}
            </button>

          </div>

        </form>
      `,
    );

    const imageInput = $("#image-input");

    const imagePreview = $("#image-preview");

    if (imageInput) {
      imageInput.addEventListener("change", (e) => {
        const files = Array.from(e.target.files);

        imagePreview.innerHTML = "";

        files.forEach((file) => {
          const reader = new FileReader();

          reader.onload = () => {
            const img = document.createElement("img");

            img.src = reader.result;

            img.alt = "Vehicle image";

            imagePreview.appendChild(img);
          };

          reader.readAsDataURL(file);
        });
      });
    }

    $("#car-form").onsubmit = (e) => {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(e.target).entries());

      const cars = Storage.getCars();

      const index = editing ? cars.findIndex((x) => x.id === id) : -1;

      const old = editing ? cars[index] : c;

      const updated = {
        ...old,

        id: old.id || uid("car"),

        customerName: data.customerName.trim(),

        vin: data.vin.trim(),

        brand: data.brand,

        model: data.model.trim(),

        year: Number(data.year),

        price: Number(data.price || 0),

        mileage: Number(data.mileage || 0),

        fuelType: data.fuelType,

        transmission: data.transmission,

        color: data.color.trim(),

        location: data.location.trim(),

        firstLocation: data.firstLocation.trim(),

        destination: data.destination.trim(),

        date: data.date,

        status: data.status,

        description: data.description.trim(),

        notes: data.notes.trim(),

        createdAt: old.createdAt || new Date().toISOString(),

        images: old.images || [],

        condition: {},

        delivery: {},

        damage: {},

        finance: {},
      };

      /* ======================================
           CONDITION
        ====================================== */

      [
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
      ].forEach((name) => {
        updated.condition[name] = data[`condition.${name}`] || "No";
      });

      /* ======================================
           DELIVERY
        ====================================== */

      updated.delivery = {
        status: data["delivery.status"] || "Pending",

        date: data["delivery.date"] || null,

        location: (data["delivery.location"] || "").trim(),

        deliveredTo: (data["delivery.deliveredTo"] || "").trim(),

        notes: (data["delivery.notes"] || "").trim(),
      };

      /* ======================================
           DAMAGE
        ====================================== */

      updated.damage = {
        damaged: data["damage.damaged"] || "No",

        type: (data["damage.type"] || "").trim(),

        description: (data["damage.description"] || "").trim(),

        location: (data["damage.location"] || "").trim(),

        cost: Number(data["damage.cost"] || 0),

        date: data["damage.date"] || null,
      };

      /* ======================================
           FINANCE
        ====================================== */

      const financeFields = [
        "purchaseCost",
        "recovery",
        "dubaiToIslamQala",
        "transportation",
        "customs",
        "repair",
        "maintenance",
        "documentation",
        "otherExpenses",
      ];

      financeFields.forEach((name) => {
        updated.finance[name] = Number(data[`finance.${name}`] || 0);
      });

      updated.finance.totalExpenditure = financeFields
        .filter((name) => name !== "purchaseCost")
        .reduce((sum, name) => sum + Number(updated.finance[name] || 0), 0);

      /* ======================================
           STATUS RULES
        ====================================== */

      if (updated.condition.Damaged === "Yes") {
        updated.status = "Damaged";
      }

      if (updated.delivery.status === "Delivered") {
        updated.status = "Delivered";
      }

      /* ======================================
           IMAGE DATA
        ====================================== */

      const files = Array.from(imageInput?.files || []);

      if (files.length) {
        const readers = files.map(
          (file) =>
            new Promise((resolve) => {
              const reader = new FileReader();

              reader.onload = () => resolve(reader.result);

              reader.readAsDataURL(file);
            }),
        );

        Promise.all(readers).then((newImages) => {
          updated.images = [...(old.images || []), ...newImages];

          saveCar();
        });
      } else {
        saveCar();
      }

      function saveCar() {
        if (editing) {
          cars[index] = updated;

          activity(
            "car_updated",
            `${updated.brand} ${updated.model} was updated`,
          );
        } else {
          cars.unshift(updated);

          activity("car_added", `${updated.brand} ${updated.model} was added`);
        }

        Storage.saveCars(cars);

        Toast.show(
          editing
            ? "Vehicle updated successfully."
            : "Vehicle added successfully.",
          "success",
        );

        Navigation.go("car-list");
      }
    };
  }

  /* ==========================================
     CAR LIST PAGE
     MOBILE FIRST LISTING
  ========================================== */

  function carListPage() {
    const cars = Storage.getCars()
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    /* ==========================================
       SEARCH & FILTERS
    ========================================== */

    const filterMarkup = `

      <section
        class="car-list-filters"
        id="car-list-filters"
      >

        <div
          class="
            car-filter-group
            car-search-group
          "
        >

          <label
            for="car-search"
          >
            Search
          </label>

          <input
            type="search"
            id="car-search"
            placeholder="
              Search VIN, model or customer name...
            "
            autocomplete="off"
          >

        </div>


        <div class="car-filter-group">

          <label
            for="filter-vin"
          >
            VIN
          </label>

          <input
            type="text"
            id="filter-vin"
            placeholder="VIN"
          >

        </div>


        <div class="car-filter-group">

          <label
            for="filter-model"
          >
            Model
          </label>

          <input
            type="text"
            id="filter-model"
            placeholder="Model"
          >

        </div>


        <div class="car-filter-group">

          <label
            for="filter-status"
          >
            Status
          </label>

          <select
            id="filter-status"
          >

            <option value="">
              All Statuses
            </option>

            <option value="Available">
              Available
            </option>

            <option value="Delivered">
              Delivered
            </option>

            <option value="Sold">
              Sold
            </option>

            <option value="Damaged">
              Damaged
            </option>

          </select>

        </div>


        <div class="car-filter-group">

          <label
            for="filter-destination"
          >
            Destination
          </label>

          <input
            type="text"
            id="filter-destination"
            placeholder="Destination"
          >

        </div>


        <div class="car-filter-group">

          <label
            for="filter-location"
          >
            First Location
          </label>

          <input
            type="text"
            id="filter-location"
            placeholder="First Location"
          >

        </div>


        <div class="car-filter-group">

          <label
            for="filter-date"
          >
            Date
          </label>

          <input
            type="date"
            id="filter-date"
          >

        </div>


        <div class="car-filter-group">

          <label
            for="filter-damage"
          >
            Damage
          </label>

          <select
            id="filter-damage"
          >

            <option value="">
              All
            </option>

            <option value="yes">
              Damaged
            </option>

            <option value="no">
              Not Damaged
            </option>

          </select>

        </div>


        <div class="car-filter-group">

          <label
            for="filter-deliver"
          >
            Deliver
          </label>

          <select
            id="filter-deliver"
          >

            <option value="">
              All
            </option>

            <option value="yes">
              Delivered
            </option>

            <option value="no">
              Not Delivered
            </option>

          </select>

        </div>


        <div class="car-filter-actions">

          <button
            type="button"
            class="
              btn
              btn-secondary
            "
            id="clear-car-filters"
          >
            Clear Filters
          </button>


          <button
            type="button"
            class="
              btn
              btn-primary
            "
            id="add-car-from-list"
          >
            Add Car
          </button>

        </div>

      </section>
    `;

    /* ==========================================
       ROW MARKUP
    ========================================== */

    const rowMarkup = (list) => {
      if (!list.length) {
        return `
            <tr>

              <td colspan="11">

                <div class="empty-state">

                  <strong>
                    No cars found
                  </strong>

                  <span>
                    Try changing your search or filters.
                  </span>

                </div>

              </td>

            </tr>
          `;
      }

      return list
        .map((c) => {
          const delivered =
            c.delivery?.status === "Delivered" || c.status === "Delivered";

          const damaged =
            c.damage?.damaged === "Yes" ||
            c.damage?.damaged === true ||
            c.status === "Damaged";

          return `
              <tr
                class="car-list-row"
                tabindex="0"

                onclick="
                  if (
                    !event.target.closest(
                      'button,a'
                    )
                  ) {
                    App.viewCar(
                      '${c.id}'
                    );
                  }
                "

                onkeydown="
                  if (
                    (
                      event.key === 'Enter' ||
                      event.key === ' '
                    ) &&
                    !event.target.closest(
                      'button,a'
                    )
                  ) {

                    event.preventDefault();

                    App.viewCar(
                      '${c.id}'
                    );

                  }
                "
              >


                <td data-label="Date">

                  ${date(c.date || c.createdAt)}

                </td>


                <td data-label="VIN">

                  <strong>
                    ${esc(c.vin || "N/A")}
                  </strong>

                </td>


                <td data-label="Model">

                  <div class="list-car">

                    <img
                      src="${esc(c.images?.[0] || imageFallback)}"
                      alt="${esc(c.brand + " " + c.model)}"

                      onerror="
                        this.src='${imageFallback}'
                      "
                    >


                    <div>

                      <strong>
                        ${esc(c.brand || "")}
                        ${esc(c.model || "")}
                      </strong>

                      <span>
                        ${c.year || "N/A"}
                      </span>

                    </div>

                  </div>

                </td>


                <td data-label="Status">

                  <span
                    class="
                      badge
                      ${
                        c.status === "Available"
                          ? "badge-available"
                          : c.status === "Delivered"
                            ? "badge-progress"
                            : damaged
                              ? "badge-danger"
                              : "badge-sold"
                      }
                    "
                  >
                    ${esc(c.status || "Available")}
                  </span>

                </td>


                <td data-label="Destination">

                  ${esc(c.destination || "N/A")}

                </td>


                <td data-label="First Location">

                  ${esc(c.firstLocation || c.location || "N/A")}

                </td>


                <td data-label="Image">

                  <img
                    class="list-image"
                    src="${esc(c.images?.[0] || imageFallback)}"
                    alt="Vehicle image"

                    onerror="
                      this.src='${imageFallback}'
                    "
                  >

                </td>


                <td data-label="Deliver">

                  <span
                    class="
                      table-state
                      ${delivered ? "is-yes" : "is-no"}
                    "
                  >
                    ${delivered ? "Delivered" : "Not Delivered"}
                  </span>

                </td>


                <td data-label="Damage">

                  <span
                    class="
                      table-state
                      ${damaged ? "is-yes" : "is-no"}
                    "
                  >
                    ${damaged ? "Damaged" : "Not Damaged"}
                  </span>

                </td>


                <td data-label="Expenditure">

                  ${money(
                    c.finance?.totalExpenditure || repairCostForCar(c.id),
                  )}

                </td>


                <td data-label="Actions">

                  <div class="actions">

                    <button
                      class="
                        btn
                        btn-sm
                      "
                      onclick="
                        event.stopPropagation();
                        App.viewCar(
                          '${c.id}'
                        );
                      "
                    >
                      View
                    </button>


                    <button
                      class="
                        btn
                        btn-sm
                      "
                      onclick="
                        event.stopPropagation();
                        App.editCar(
                          '${c.id}'
                        );
                      "
                    >
                      Edit
                    </button>


                    <button
                      class="
                        btn
                        btn-sm
                        btn-danger
                      "
                      onclick="
                        event.stopPropagation();
                        App.deleteCar(
                          '${c.id}'
                        );
                      "
                    >
                      Delete
                    </button>

                  </div>

                </td>

              </tr>
            `;
        })
        .join("");
    };

    /* ==========================================
       PAGE
    ========================================== */

    page(
      "List of Cars",

      `
        ${filterMarkup}


        <div class="section-head">

          <div>

            <h2>
              List of Cars
            </h2>

            <p>
              Click anywhere on a vehicle row
              to open the complete vehicle record.
            </p>

          </div>

        </div>


        <div class="panel">

          <div class="panel-head">

            <h3>
              All Cars
            </h3>

            <span id="listing-count">

              ${cars.length}
              vehicle${cars.length === 1 ? "" : "s"}

            </span>

          </div>


          <div
            class="
              table-wrap
              car-list-table-wrap
            "
          >

            <table
              class="
                data-table
                car-list-table
              "
            >

              <thead>

                <tr>

                  <th>
                    Date
                  </th>

                  <th>
                    VIN
                  </th>

                  <th>
                    Model
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Destination
                  </th>

                  <th>
                    First Location
                  </th>

                  <th>
                    Image
                  </th>

                  <th>
                    Deliver
                  </th>

                  <th>
                    Damage
                  </th>

                  <th>
                    Expenditure
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody
                id="car-list-results"
              >
                ${rowMarkup(cars)}
              </tbody>

            </table>

          </div>

        </div>
      `,
    );

    /* ==========================================
       FILTER STATE
    ========================================== */

    const state = {
      search: "",

      vin: "",

      model: "",

      status: "",

      destination: "",

      firstLocation: "",

      date: "",

      damage: "",

      deliver: "",
    };

    /* ==========================================
       FILTER FIELD MAP
    ========================================== */

    const fields = {
      "car-search": "search",

      "filter-vin": "vin",

      "filter-model": "model",

      "filter-status": "status",

      "filter-destination": "destination",

      "filter-location": "firstLocation",

      "filter-date": "date",

      "filter-damage": "damage",

      "filter-deliver": "deliver",
    };

    /* ==========================================
       GET VALUE
    ========================================== */

    function getValue(car, keys) {
      for (const key of keys) {
        const value = key.split(".").reduce((obj, part) => obj?.[part], car);

        if (value !== undefined && value !== null && value !== "") {
          return String(value);
        }
      }

      return "";
    }

    /* ==========================================
       MATCH FILTERS
       AND LOGIC
    ========================================== */

    function matches(car) {
      const search = state.search.toLowerCase();

      const searchable = [
        getValue(car, ["vin"]),

        getValue(car, ["model"]),

        getValue(car, ["brand"]),

        getValue(car, ["customerName", "customer.name", "customer"]),
      ]
        .join(" ")
        .toLowerCase();

      if (search && !searchable.includes(search)) {
        return false;
      }

      if (
        state.vin &&
        !getValue(car, ["vin"]).toLowerCase().includes(state.vin.toLowerCase())
      ) {
        return false;
      }

      if (
        state.model &&
        !getValue(car, ["model"])
          .toLowerCase()
          .includes(state.model.toLowerCase())
      ) {
        return false;
      }

      if (
        state.destination &&
        !getValue(car, ["destination"])
          .toLowerCase()
          .includes(state.destination.toLowerCase())
      ) {
        return false;
      }

      if (
        state.firstLocation &&
        !getValue(car, ["firstLocation", "location"])
          .toLowerCase()
          .includes(state.firstLocation.toLowerCase())
      ) {
        return false;
      }

      if (
        state.status &&
        getValue(car, ["status"]).toLowerCase() !== state.status.toLowerCase()
      ) {
        return false;
      }

      const carDate = getValue(car, ["date", "createdAt"]).slice(0, 10);

      if (state.date && carDate !== state.date) {
        return false;
      }

      const damaged =
        car.damage?.damaged === "Yes" ||
        car.damage?.damaged === true ||
        car.status === "Damaged";

      const delivered =
        car.delivery?.status === "Delivered" || car.status === "Delivered";

      if (state.damage && damaged !== (state.damage === "yes")) {
        return false;
      }

      if (state.deliver && delivered !== (state.deliver === "yes")) {
        return false;
      }

      return true;
    }

    /* ==========================================
       RENDER FILTERED RESULTS
    ========================================== */

    function renderResults() {
      const filtered = cars.filter(matches);

      const results = document.getElementById("car-list-results");

      const count = document.getElementById("listing-count");

      if (results) {
        results.innerHTML = rowMarkup(filtered);
      }

      if (count) {
        count.textContent = `${filtered.length} vehicle${
          filtered.length === 1 ? "" : "s"
        }`;
      }
    }

    /* ==========================================
       CONNECT FILTER INPUTS
    ========================================== */

    Object.entries(fields).forEach(([id, stateKey]) => {
      const input = document.getElementById(id);

      if (!input) {
        return;
      }

      input.addEventListener(
        input.tagName === "SELECT" || input.type === "date"
          ? "change"
          : "input",

        () => {
          state[stateKey] = input.value.trim();

          renderResults();
        },
      );
    });

    /* ==========================================
       CLEAR FILTERS
    ========================================== */

    const clearButton = document.getElementById("clear-car-filters");

    if (clearButton) {
      clearButton.addEventListener("click", () => {
        Object.keys(state).forEach((key) => (state[key] = ""));

        Object.keys(fields).forEach((id) => {
          const input = document.getElementById(id);

          if (input) {
            input.value = "";
          }
        });

        renderResults();
      });
    }

    /* ==========================================
       ADD CAR
    ========================================== */

    const addButton = document.getElementById("add-car-from-list");

    if (addButton) {
      addButton.addEventListener("click", () => Navigation.go("add-car"));
    }
  }

  /* ==========================================
     VIEW CAR
  ========================================== */

  function viewCar(id) {
    const c = carById(id);

    if (!c) {
      Navigation.go("car-list");

      return;
    }

    const repairCost = repairCostForCar(c.id);

    const finance = c.finance || {};

    const totalExpenditure = Number(finance.totalExpenditure || 0);

    const purchaseCost = Number(finance.purchaseCost ?? c.price ?? 0);

    const totalCost = purchaseCost + totalExpenditure;

    const salePrice = Number(c.salePrice || 0);

    const result = salePrice - totalCost;

    const delivery = c.delivery || {};

    const condition = c.condition || {};

    const damage = c.damage || {};

    page(
      "Vehicle Details",

      `
        <div class="section-head">

          <div>

            <h2>
              ${esc(c.brand)}
              ${esc(c.model)}
            </h2>

            <p>
              Complete vehicle record
            </p>

          </div>


          <div class="actions">

            <button
              class="btn"
              onclick="
                Navigation.go('car-list')
              "
            >
              Back
            </button>

            <button
              class="btn"
              onclick="
                App.editCar('${c.id}')
              "
            >
              Edit
            </button>

            <button
              class="
                btn
                btn-danger
              "
              onclick="
                App.deleteCar('${c.id}')
              "
            >
              Delete
            </button>

          </div>

        </div>


        <div class="grid-2">

          <div class="panel">

            <div class="vehicle-gallery">

              <img
                id="main-car-image"
                class="main-car-image"
                src="${esc(c.images?.[0] || imageFallback)}"
                alt="${esc(c.brand + " " + c.model)}"

                onerror="
                  this.src='${imageFallback}'
                "
              >


              <div class="thumbs">

                ${(c.images?.length ? c.images : [imageFallback])
                  .map(
                    (url, i) => `
                        <img
                          class="${i === 0 ? "active" : ""}"
                          src="${esc(url)}"
                          alt="Vehicle thumbnail"
                          onclick="
                            App.selectImage(
                              this,
                              '${esc(url)}'
                            )
                          "
                        >
                      `,
                  )
                  .join("")}

              </div>

            </div>

          </div>


          <div class="panel">

            <div class="panel-head">

              <h3>
                Basic Information
              </h3>

              <span
                class="badge"
              >
                ${esc(c.status || "Available")}
              </span>

            </div>


            <div class="detail-grid">

              <div>
                <span>
                  Customer Name
                </span>
                <strong>
                  ${esc(c.customerName || "N/A")}
                </strong>
              </div>


              <div>
                <span>
                  Location
                </span>
                <strong>
                  ${esc(c.location || "N/A")}
                </strong>
              </div>


              <div>
                <span>
                  Action Location
                </span>
                <strong>
                  ${esc(c.actionLocation || "N/A")}
                </strong>
              </div>


              <div>
                <span>
                  Destination
                </span>
                <strong>
                  ${esc(c.destination || "N/A")}
                </strong>
              </div>


              <div>
                <span>
                  First Location
                </span>
                <strong>
                  ${esc(c.firstLocation || "N/A")}
                </strong>
              </div>


              <div>
                <span>
                  VIN
                </span>
                <strong>
                  ${esc(c.vin || "N/A")}
                </strong>
              </div>


              <div>
                <span>
                  Model
                </span>
                <strong>
                  ${esc(c.brand + " " + c.model)}
                </strong>
              </div>


              <div>
                <span>
                  Status
                </span>
                <strong>
                  ${esc(c.status || "Available")}
                </strong>
              </div>


              <div>
                <span>
                  Date
                </span>
                <strong>
                  ${date(c.date || c.createdAt)}
                </strong>
              </div>

            </div>

          </div>

        </div>


        <div class="panel">

          <div class="panel-head">

            <h3>
              Vehicle Condition
            </h3>

          </div>


          <div class="detail-grid">

            ${[
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
            ]
              .map(
                (name) => `
                    <div>

                      <span>
                        ${name}
                      </span>

                      <strong>
                        ${condition[name] || "No"}
                      </strong>

                    </div>
                  `,
              )
              .join("")}

          </div>

        </div>


        <div class="panel">

          <div class="panel-head">

            <h3>
              Delivery
            </h3>

          </div>


          <div class="detail-grid">

            <div>
              <span>
                Deliver Status
              </span>
              <strong>
                ${esc(delivery.status || "Pending")}
              </strong>
            </div>


            <div>
              <span>
                Delivery Date
              </span>
              <strong>
                ${delivery.date ? date(delivery.date) : "N/A"}
              </strong>
            </div>


            <div>
              <span>
                Delivery Location
              </span>
              <strong>
                ${esc(delivery.location || "N/A")}
              </strong>
            </div>


            <div>
              <span>
                Delivered To
              </span>
              <strong>
                ${esc(delivery.deliveredTo || "N/A")}
              </strong>
            </div>


            <div class="full">
              <span>
                Notes
              </span>
              <strong>
                ${esc(delivery.notes || "N/A")}
              </strong>
            </div>

          </div>

        </div>


        <div class="panel">

          <div class="panel-head">

            <h3>
              Damage
            </h3>

          </div>


          <div class="detail-grid">

            <div>
              <span>
                Damaged
              </span>
              <strong>
                ${esc(damage.damaged || "No")}
              </strong>
            </div>


            <div>
              <span>
                Damage Type
              </span>
              <strong>
                ${esc(damage.type || "N/A")}
              </strong>
            </div>


            <div>
              <span>
                Damage Description
              </span>
              <strong>
                ${esc(damage.description || "N/A")}
              </strong>
            </div>


            <div>
              <span>
                Damage Location
              </span>
              <strong>
                ${esc(damage.location || "N/A")}
              </strong>
            </div>


            <div>
              <span>
                Damage Cost
              </span>
              <strong>
                ${money(damage.cost || 0)}
              </strong>
            </div>


            <div>
              <span>
                Damage Date
              </span>
              <strong>
                ${damage.date ? date(damage.date) : "N/A"}
              </strong>
            </div>

          </div>

        </div>


        <div class="panel">

          <div class="panel-head">

            <h3>
              Finance
            </h3>

          </div>


          <div class="detail-grid">

            <div>
              <span>
                Purchase Cost
              </span>
              <strong>
                ${money(purchaseCost)}
              </strong>
            </div>


            <div>
              <span>
                Recovery
              </span>
              <strong>
                ${money(finance.recovery || 0)}
              </strong>
            </div>


            <div>
              <span>
                Dubai to Islam Qala Expenses
              </span>
              <strong>
                ${money(finance.dubaiToIslamQala || 0)}
              </strong>
            </div>


            <div>
              <span>
                Transportation
              </span>
              <strong>
                ${money(finance.transportation || 0)}
              </strong>
            </div>


            <div>
              <span>
                Customs
              </span>
              <strong>
                ${money(finance.customs || 0)}
              </strong>
            </div>


            <div>
              <span>
                Repair
              </span>
              <strong>
                ${money(finance.repair || repairCost || 0)}
              </strong>
            </div>


            <div>
              <span>
                Maintenance
              </span>
              <strong>
                ${money(finance.maintenance || 0)}
              </strong>
            </div>


            <div>
              <span>
                Documentation
              </span>
              <strong>
                ${money(finance.documentation || 0)}
              </strong>
            </div>


            <div>
              <span>
                Other Expenses
              </span>
              <strong>
                ${money(finance.otherExpenses || 0)}
              </strong>
            </div>


            <div>
              <span>
                Total Expenditure
              </span>
              <strong>
                ${money(totalExpenditure)}
              </strong>
            </div>

          </div>

        </div>


        <div class="panel">

          <div class="panel-head">

            <h3>
              Profit / Loss
            </h3>

          </div>


          <div class="detail-grid">

            <div>
              <span>
                Sale Price
              </span>
              <strong>
                ${money(salePrice)}
              </strong>
            </div>


            <div>
              <span>
                Total Cost
              </span>
              <strong>
                ${money(totalCost)}
              </strong>
            </div>


            <div>
              <span>
                Result
              </span>

              <strong
                class="${result >= 0 ? "kpi-positive" : "kpi-negative"}"
              >
                ${result >= 0 ? "Profit: " : "Loss: "}

                ${money(Math.abs(result))}
              </strong>

            </div>

          </div>

        </div>


        <div class="form-actions">

          <button
            class="btn"
            onclick="
              Navigation.go('car-list')
            "
          >
            Back to List
          </button>


          <button
            class="btn btn-primary"
            onclick="
              App.openDelivery('${c.id}')
            "
          >
            Update Delivery
          </button>


          <button
            class="btn"
            onclick="
              App.openCondition('${c.id}')
            "
          >
            Update Condition
          </button>


          <button
            class="btn"
            onclick="
              App.openExpenditure('${c.id}')
            "
          >
            Add Expenditure
          </button>

        </div>
      `,
    );
  }

  /* ==========================================
     SELL CAR
  ========================================== */

  function sellCar(id) {
    const c = carById(id);

    if (!c) return;

    Modal.open({
      title: "Sell Vehicle",

      message: `
        <form
          id="sell-form"
          class="form-grid"
        >

          <div class="field">

            <label>
              Sale Price
            </label>

            <input
              name="salePrice"
              type="number"
              min="0"
              step="0.01"
              required
              value="${Number(c.salePrice || c.price || 0)}"
            >

          </div>

        </form>
      `,

      confirmText: "Confirm Sale",

      onConfirm: () => {
        const form = document.getElementById("sell-form");

        if (!form) return;

        const data = Object.fromEntries(new FormData(form).entries());

        const cars = Storage.getCars();

        const index = cars.findIndex((x) => x.id === id);

        if (index < 0) return;

        cars[index] = {
          ...cars[index],

          status: "Sold",

          salePrice: Number(data.salePrice || 0),

          soldAt: new Date().toISOString(),
        };

        Storage.saveCars(cars);

        activity("car_sold", `${c.brand} ${c.model} was sold`);

        Toast.show("Vehicle sold successfully.", "success");

        render();
      },
    });
  }

  /* ==========================================
     DELETE CAR
  ========================================== */

  function deleteCar(id) {
    const c = carById(id);

    if (!c) return;

    Modal.open({
      title: "Delete Vehicle?",

      message: `Are you sure you want to delete ${esc(
        c.brand + " " + c.model,
      )}? This action cannot be undone.`,

      confirmText: "Delete Vehicle",

      danger: true,

      onConfirm: () => {
        const cars = Storage.getCars().filter((x) => x.id !== id);

        Storage.saveCars(cars);

        activity("car_deleted", `${c.brand} ${c.model} was deleted`);

        Toast.show("Vehicle deleted successfully.", "success");

        render();
      },
    });
  }

  /* ==========================================
     REPAIRS PAGE
  ========================================== */

  function repairsPage() {
    const repairs = Storage.getRepairs();

    page(
      "Repairs",

      `
        <div class="section-head">

          <div>

            <h2>
              Vehicle repairs
            </h2>

            <p>
              Track workshop work and repair costs.
            </p>

          </div>


          <button
            class="
              btn
              btn-primary
            "
            onclick="
              Navigation.go('add-repair')
            "
          >
            ＋ Add Repair
          </button>

        </div>


        <div class="panel">

          ${
            repairs.length
              ? `
                <div class="table-wrap">

                  <table
                    class="data-table"
                  >

                    <thead>

                      <tr>
                        <th>Date</th>
                        <th>Vehicle</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Cost</th>
                        <th>Actions</th>
                      </tr>

                    </thead>


                    <tbody>

                      ${repairs
                        .map((r) => {
                          const car = carById(r.carId);

                          return `
                                <tr>

                                  <td>
                                    ${date(r.date)}
                                  </td>

                                  <td>
                                    ${
                                      car
                                        ? esc(car.brand + " " + car.model)
                                        : "Unknown"
                                    }
                                  </td>

                                  <td>
                                    ${esc(r.type || "N/A")}
                                  </td>

                                  <td>
                                    ${esc(r.description || "")}
                                  </td>

                                  <td>
                                    ${money(r.cost)}
                                  </td>

                                  <td>

                                    <div
                                      class="actions"
                                    >

                                      <button
                                        class="btn btn-sm"
                                        onclick="
                                          App.editRepair(
                                            '${r.id}'
                                          )
                                        "
                                      >
                                        Edit
                                      </button>

                                      <button
                                        class="
                                          btn
                                          btn-sm
                                          btn-danger
                                        "
                                        onclick="
                                          App.deleteRepair(
                                            '${r.id}'
                                          )
                                        "
                                      >
                                        Delete
                                      </button>

                                    </div>

                                  </td>

                                </tr>
                              `;
                        })
                        .join("")}

                    </tbody>

                  </table>

                </div>
              `
              : empty(
                  "No repairs",
                  "No repair records have been added yet.",
                  "add-repair",
                )
          }

        </div>
      `,
    );
  }

  /* ==========================================
     REPAIR FORM
  ========================================== */

  function repairForm(id = null) {
    const editing = Boolean(id);

    const repairs = Storage.getRepairs();

    const existing = editing ? repairs.find((r) => r.id === id) : null;

    if (editing && !existing) {
      Navigation.go("repairs");
      return;
    }

    const cars = Storage.getCars();

    const r = existing || {
      id: uid("repair"),

      carId: cars[0]?.id || "",

      date: today(),

      type: "Maintenance",

      description: "",

      cost: 0,

      createdAt: new Date().toISOString(),
    };

    page(
      editing ? "Edit Repair" : "Add Repair",

      `
        <div class="section-head">

          <div>

            <h2>
              ${editing ? "Edit repair" : "Add repair"}
            </h2>

          </div>

        </div>


        <form
          id="repair-form"
          class="panel"
        >

          <div class="form-grid">

            <div class="field">

              <label>
                Vehicle
              </label>

              <select
                name="carId"
                required
              >

                ${cars
                  .map(
                    (c) =>
                      `
                          <option
                            value="${c.id}"
                            ${r.carId === c.id ? "selected" : ""}
                          >
                            ${esc(c.brand + " " + c.model)}
                          </option>
                        `,
                  )
                  .join("")}

              </select>

            </div>


            <div class="field">

              <label>
                Date
              </label>

              <input
                name="date"
                type="date"
                value="${esc(r.date || today())}"
                required
              >

            </div>


            <div class="field">

              <label>
                Type
              </label>

              <select name="type">

                ${["Maintenance", "Repair", "Body Work", "Electrical", "Other"]
                  .map(
                    (x) =>
                      `
                          <option
                            ${r.type === x ? "selected" : ""}
                          >
                            ${x}
                          </option>
                        `,
                  )
                  .join("")}

              </select>

            </div>


            <div class="field">

              <label>
                Cost
              </label>

              <input
                name="cost"
                type="number"
                min="0"
                step="0.01"
                value="${Number(r.cost || 0)}"
                required
              >

            </div>


            <div class="field full">

              <label>
                Description
              </label>

              <textarea
                name="description"
              >${esc(r.description || "")}</textarea>

            </div>

          </div>


          <div class="form-actions">

            <button
              type="button"
              class="btn"
              onclick="
                Navigation.go('repairs')
              "
            >
              Back
            </button>

            <button
              class="
                btn
                btn-primary
              "
            >
              ${editing ? "Save Changes" : "Add Repair"}
            </button>

          </div>

        </form>
      `,
    );

    $("#repair-form").onsubmit = (e) => {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(e.target).entries());

      const all = Storage.getRepairs();

      const updated = {
        ...r,

        carId: data.carId,

        date: data.date,

        type: data.type,

        description: data.description.trim(),

        cost: Number(data.cost || 0),

        createdAt: r.createdAt || new Date().toISOString(),
      };

      if (editing) {
        const index = all.findIndex((x) => x.id === id);

        if (index >= 0) {
          all[index] = updated;
        }
      } else {
        all.unshift(updated);
      }

      Storage.saveRepairs(all);

      activity(
        editing ? "repair_updated" : "repair_added",

        editing
          ? "A repair record was updated"
          : "A new repair record was added",
      );

      Toast.show(
        editing ? "Repair updated successfully." : "Repair added successfully.",
        "success",
      );

      Navigation.go("repairs");
    };
  }

  /* ==========================================
     DELETE REPAIR
  ========================================== */

  function deleteRepair(id) {
    const repair = Storage.getRepairs().find((r) => r.id === id);

    if (!repair) return;

    Modal.open({
      title: "Delete Repair?",

      message: "Are you sure you want to delete this repair record?",

      confirmText: "Delete Repair",

      danger: true,

      onConfirm: () => {
        Storage.saveRepairs(Storage.getRepairs().filter((r) => r.id !== id));

        activity("repair_deleted", "A repair record was deleted");

        Toast.show("Repair deleted successfully.", "success");

        render();
      },
    });
  }

  /* ==========================================
     EXPENSES PAGE
  ========================================== */

  function expensesPage() {
    const expenses = Storage.getExpenses();

    page(
      "Expenses",

      `
        <div class="section-head">

          <div>

            <h2>
              Expenses
            </h2>

            <p>
              Track showroom operating expenses.
            </p>

          </div>


          <button
            class="
              btn
              btn-primary
            "
            onclick="
              Navigation.go('add-expense')
            "
          >
            ＋ Add Expense
          </button>

        </div>


        <div class="panel">

          ${
            expenses.length
              ? `
                <div class="table-wrap">

                  <table
                    class="data-table"
                  >

                    <thead>

                      <tr>

                        <th>
                          Date
                        </th>

                        <th>
                          Category
                        </th>

                        <th>
                          Description
                        </th>

                        <th>
                          Amount
                        </th>

                        <th>
                          Actions
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      ${expenses
                        .map(
                          (e) =>
                            `
                                <tr>

                                  <td>
                                    ${date(e.date)}
                                  </td>

                                  <td>
                                    ${esc(e.category)}
                                  </td>

                                  <td>
                                    ${esc(e.description || "")}
                                  </td>

                                  <td>
                                    ${money(e.amount)}
                                  </td>

                                  <td>

                                    <button
                                      class="
                                        btn
                                        btn-sm
                                        btn-danger
                                      "
                                      onclick="
                                        App.deleteExpense(
                                          '${e.id}'
                                        )
                                      "
                                    >
                                      Delete
                                    </button>

                                  </td>

                                </tr>
                              `,
                        )
                        .join("")}

                    </tbody>

                  </table>

                </div>
              `
              : empty(
                  "No expenses",
                  "No expense records have been added yet.",
                  "add-expense",
                )
          }

        </div>
      `,
    );
  }

  /* ==========================================
     ADD EXPENSE
  ========================================== */

  function addExpense() {
    page(
      "Add Expense",

      `
        <div class="section-head">

          <div>

            <h2>
              Add Expense
            </h2>

          </div>

        </div>


        <form
          id="expense-form"
          class="panel"
        >

          <div class="form-grid">

            <div class="field">

              <label>
                Date
              </label>

              <input
                name="date"
                type="date"
                value="${today()}"
                required
              >

            </div>


            <div class="field">

              <label>
                Category
              </label>

              <select
                name="category"
              >

                <option>
                  Maintenance
                </option>

                <option>
                  Transportation
                </option>

                <option>
                  Customs
                </option>

                <option>
                  Documentation
                </option>

                <option>
                  Utilities
                </option>

                <option>
                  Other
                </option>

              </select>

            </div>


            <div class="field">

              <label>
                Amount
              </label>

              <input
                name="amount"
                type="number"
                min="0"
                step="0.01"
                required
              >

            </div>


            <div class="field full">

              <label>
                Description
              </label>

              <textarea
                name="description"
              ></textarea>

            </div>

          </div>


          <div class="form-actions">

            <button
              type="button"
              class="btn"
              onclick="
                Navigation.go('expenses')
              "
            >
              Back
            </button>

            <button
              class="
                btn
                btn-primary
              "
            >
              Add Expense
            </button>

          </div>

        </form>
      `,
    );

    $("#expense-form").onsubmit = (e) => {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(e.target).entries());

      const expenses = Storage.getExpenses();

      expenses.unshift({
        id: uid("expense"),

        date: data.date,

        category: data.category,

        amount: Number(data.amount || 0),

        description: data.description.trim(),

        createdAt: new Date().toISOString(),
      });

      Storage.saveExpenses(expenses);

      activity("expense_added", `New ${data.category} expense was added`);

      Toast.show("Expense added successfully.", "success");

      Navigation.go("expenses");
    };
  }

  /* ==========================================
     DELETE EXPENSE
  ========================================== */

  function deleteExpense(id) {
    const expense = Storage.getExpenses().find((e) => e.id === id);

    if (!expense) return;

    Modal.open({
      title: "Delete Expense?",

      message: "Are you sure you want to delete this expense?",

      confirmText: "Delete Expense",

      danger: true,

      onConfirm: () => {
        Storage.saveExpenses(Storage.getExpenses().filter((e) => e.id !== id));

        activity("expense_deleted", "An expense was deleted");

        Toast.show("Expense deleted successfully.", "success");

        render();
      },
    });
  }

  /* ==========================================
     REPORTS
  ========================================== */

  function reports() {
    const cars = Storage.getCars();

    const expenses = Storage.getExpenses();

    const repairs = Storage.getRepairs();

    const m = metric(cars, expenses, repairs);

    page(
      "Reports",

      `
        <div class="section-head">

          <div>

            <h2>
              Business Reports
            </h2>

            <p>
              Review showroom performance and financial results.
            </p>

          </div>

        </div>


        <div class="stats-grid">

          ${stat("Total Cars", m.total, "All inventory", "🚘")}

          ${stat("Available", m.available, "Current stock", "✓")}

          ${stat("Sold", m.sold, "Completed sales", "↗")}

          ${stat("Sales", money(m.sales), "Vehicle sales", "$")}

          ${stat("Expenses", money(m.expenses), "Operating expenses", "◈")}

          ${stat("Repair Costs", money(m.repairCost), "Repair costs", "🔧")}

          ${stat("Profit", money(m.profit), "Net positive result", "＋")}

          ${stat("Loss", money(m.loss), "Net negative result", "−")}

        </div>


        <div class="grid-2">

          <div class="panel">

            <div class="panel-head">

              <h3>
                Sales
              </h3>

            </div>


            <div class="report-value">
              ${money(m.sales)}
            </div>

          </div>


          <div class="panel">

            <div class="panel-head">

              <h3>
                Total Costs
              </h3>

            </div>


            <div class="report-value">
              ${money(m.expenses + m.repairCost)}
            </div>

          </div>

        </div>
      `,
    );
  }

  /* ==========================================
     SETTINGS
  ========================================== */

  function settings() {
    const s = Storage.getSettings();

    page(
      "Settings",

      `
        <div class="section-head">

          <div>

            <h2>
              Showroom Settings
            </h2>

            <p>
              Update the showroom information and theme.
            </p>

          </div>

        </div>


        <form
          id="settings-form"
          class="panel"
        >

          <div class="form-grid">

            <div class="field">

              <label>
                Showroom Name
              </label>

              <input
                name="showroomName"
                value="${esc(s.showroomName || "Jan Motor Showroom")}"
              >

            </div>


            <div class="field">

              <label>
                Phone
              </label>

              <input
                name="phone"
                value="${esc(s.phone || "")}"
              >

            </div>


            <div class="field">

              <label>
                Email
              </label>

              <input
                name="email"
                type="email"
                value="${esc(s.email || "")}"
              >

            </div>


            <div class="field">

              <label>
                Address
              </label>

              <input
                name="address"
                value="${esc(s.address || "")}"
              >

            </div>


            <div class="field">

              <label>
                Theme
              </label>

              <select
                name="theme"
              >

                <option
                  value="light"
                  ${s.theme === "light" ? "selected" : ""}
                >
                  Light
                </option>

                <option
                  value="dark"
                  ${s.theme === "dark" ? "selected" : ""}
                >
                  Dark
                </option>

                <option
                  value="system"
                  ${s.theme === "system" ? "selected" : ""}
                >
                  System
                </option>

              </select>

            </div>


            <div class="field">

              <label>
                Admin Name
              </label>

              <input
                name="userName"
                value="${esc(s.userName || "Showroom Admin")}"
              >

            </div>

          </div>


          <div class="form-actions">

            <button
              type="button"
              class="btn"
              onclick="
                Navigation.go('dashboard')
              "
            >
              Back
            </button>

            <button
              class="
                btn
                btn-primary
              "
            >
              Save Changes
            </button>

          </div>

        </form>


        <div
          class="
            panel
            danger-zone
          "
        >

          <div class="panel-head">

            <div>

              <h3>
                Demo Data
              </h3>

              <span>
                Restore original demo records.
              </span>

            </div>


            <button
              class="
                btn
                btn-danger
              "
              id="reset-demo"
            >
              Reset Demo Data
            </button>

          </div>

        </div>
      `,
    );

    $("#settings-form").onsubmit = (e) => {
      e.preventDefault();

      const d = Object.fromEntries(new FormData(e.target).entries());

      Storage.saveSettings({
        ...s,
        ...d,
      });

      applyTheme(d.theme);

      $("#sidebar-showroom-name").textContent = d.showroomName;

      activity("settings_updated", "Showroom settings were updated");

      Toast.show("Settings saved successfully.", "success");
    };

    $("#reset-demo").onclick = () =>
      Modal.open({
        title: "Reset Demo Data?",

        message:
          "This removes your changes and restores the original demo records.",

        confirmText: "Reset Demo",

        danger: true,

        onConfirm: () => {
          Storage.clearData();

          DemoData.seed(true);

          DemoData.seed();

          Toast.show("Demo data restored successfully.", "success");

          render();
        },
      });
  }

  /* ==========================================
     THEME
  ========================================== */

  function applyTheme(t) {
    document.documentElement.classList.toggle(
      "dark",

      t === "dark" ||
        (t === "system" && matchMedia("(prefers-color-scheme: dark)").matches),
    );
  }

  /* ==========================================
     VEHICLE UPDATE MODAL
  ========================================== */

  function openVehicleUpdateModal(id, type) {
    const c = carById(id);

    if (!c) return;

    const labels = {
      delivery: "Delivery information",

      condition: "Vehicle condition",

      finance: "Expenditure / Finance",
    };

    const existing =
      type === "delivery"
        ? c.delivery || {}
        : type === "condition"
          ? c.condition || {}
          : c.finance || {};

    let body = "";

    /* ======================================
       DELIVERY
    ====================================== */

    if (type === "delivery") {
      body = `

        <form
          id="vehicle-update-form"
          class="form-grid"
        >

          <div class="field">

            <label>
              Deliver Status
            </label>

            <select
              name="status"
            >

              <option
                ${existing.status !== "Delivered" ? "selected" : ""}
              >
                Pending
              </option>

              <option
                ${existing.status === "Delivered" ? "selected" : ""}
              >
                Delivered
              </option>

            </select>

          </div>


          <div class="field">

            <label>
              Delivery Date
            </label>

            <input
              name="date"
              type="date"
              value="${esc(existing.date || today())}"
            >

          </div>


          <div class="field">

            <label>
              Delivery Location
            </label>

            <input
              name="location"
              value="${esc(existing.location || "")}"
            >

          </div>


          <div class="field">

            <label>
              Delivered To
            </label>

            <input
              name="deliveredTo"
              value="${esc(existing.deliveredTo || "")}"
            >

          </div>


          <div class="field full">

            <label>
              Notes
            </label>

            <textarea
              name="notes"
            >${esc(existing.notes || "")}</textarea>

          </div>

        </form>
      `;
    } else if (type === "condition") {
      /* ======================================
       CONDITION
    ====================================== */
      const names = [
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

      body = `

        <form
          id="vehicle-update-form"
          class="form-grid"
        >

          ${names
            .map(
              (n) => `

                <div class="field">

                  <label>
                    ${n}
                  </label>

                  <select
                    name="${n}"
                  >

                    <option
                      value="No"
                      ${existing[n] !== "Yes" ? "selected" : ""}
                    >
                      No
                    </option>

                    <option
                      value="Yes"
                      ${existing[n] === "Yes" ? "selected" : ""}
                    >
                      Yes
                    </option>

                  </select>

                </div>

              `,
            )
            .join("")}

        </form>
      `;
    } else {
      /* ======================================
       FINANCE
    ====================================== */
      const f = existing;

      const fields = [
        ["purchaseCost", "Purchase Cost"],

        ["recovery", "Recovery"],

        ["dubaiToIslamQala", "Dubai to Islam Qala Expenses"],

        ["transportation", "Transportation"],

        ["customs", "Customs"],

        ["repair", "Repair"],

        ["maintenance", "Maintenance"],

        ["documentation", "Documentation"],

        ["otherExpenses", "Other Expenses"],
      ];

      body = `

        <form
          id="vehicle-update-form"
          class="form-grid"
        >

          ${fields
            .map(
              ([n, l]) => `

                <div class="field">

                  <label>
                    ${l}
                  </label>

                  <input
                    name="${n}"
                    type="number"
                    min="0"
                    step="0.01"
                    value="${Number(
                      f[n] || (n === "purchaseCost" ? c.price : 0),
                    )}"
                  >

                </div>

              `,
            )
            .join("")}


          <div class="field full">

            <label>
              Total Expenditure
            </label>

            <input
              id="modal-total-expenditure"
              readonly
              value="${Number(f.totalExpenditure || 0)}"
            >

          </div>

        </form>
      `;
    }

    /* ======================================
       MODAL
    ====================================== */

    Modal.open({
      title: labels[type],

      message: body,

      confirmText: "Save Changes",

      onConfirm: () => {
        const form = document.getElementById("vehicle-update-form");

        if (!form) return;

        const d = Object.fromEntries(new FormData(form).entries());

        const cars = Storage.getCars();

        const index = cars.findIndex((x) => x.id === id);

        if (index < 0) return;

        const updated = {
          ...cars[index],
        };

        /* ====================================
           DELIVERY UPDATE
        ==================================== */

        if (type === "delivery") {
          updated.delivery = {
            status: d.status,

            date: d.status === "Delivered" ? d.date : null,

            location: d.location.trim(),

            deliveredTo: d.deliveredTo.trim(),

            notes: d.notes.trim(),
          };

          if (d.status === "Delivered") {
            updated.status = "Delivered";
          }
        } else if (type === "condition") {
          /* ====================================
           CONDITION UPDATE
        ==================================== */
          updated.condition = d;

          if (d.Damaged === "Yes") {
            updated.status = "Damaged";
          }
        } else {
          /* ====================================
           FINANCE UPDATE
        ==================================== */
          const fields = [
            "purchaseCost",

            "recovery",

            "dubaiToIslamQala",

            "transportation",

            "customs",

            "repair",

            "maintenance",

            "documentation",

            "otherExpenses",
          ];

          updated.finance = {
            ...updated.finance,

            ...Object.fromEntries(fields.map((n) => [n, Number(d[n] || 0)])),
          };

          updated.finance.totalExpenditure = fields

            .filter((n) => n !== "purchaseCost")

            .reduce(
              (sum, n) => sum + Number(updated.finance[n] || 0),

              0,
            );
        }

        cars[index] = updated;

        Storage.saveCars(cars);

        Toast.show("Vehicle information updated successfully.", "success");

        viewCar(id);
      },
    });
  }

  /* ==========================================
     RENDER
  ========================================== */

  function render() {
    if (!Storage.isLoggedIn()) {
      showLogin();

      return;
    }

    const route = location.hash.replace("#", "") || "dashboard";

    Navigation.setActive(route.split("/")[0]);

    applyTheme(Storage.getSettings().theme || "light");

    switch (true) {
      case route === "dashboard":
        dashboard();

        break;

      case route === "cars":
        carsPage();

        break;

      case route === "car-list":
        carListPage();

        break;

      case route === "add-car":
        formPage();

        break;

      case route.startsWith("edit-car/"):
        formPage(route.split("/")[1]);

        break;

      case route.startsWith("car/"):
        viewCar(route.split("/")[1]);

        break;

      case route === "repairs":
        repairsPage();

        break;

      case route === "add-repair":
        repairForm();

        break;

      case route.startsWith("edit-repair/"):
        repairForm(route.split("/")[1]);

        break;

      case route === "expenses":
        expensesPage();

        break;

      case route === "add-expense":
        addExpense();

        break;

      case route === "reports":
        reports();

        break;

      case route === "settings":
        settings();

        break;

      default:
        Navigation.go("dashboard");
    }
  }

  /* ==========================================
     LOGIN
  ========================================== */

  function showLogin() {
    document.getElementById("app-shell").classList.add("hidden");

    const root = $("#login-screen");

    root.classList.remove("hidden");

    root.innerHTML = `

      <div class="login-card">

        <div class="login-logo">
          JM
        </div>

        <h1>
          Jan Motor Showroom
        </h1>

        <p>
          Administrator Login
        </p>


        <form
          id="login-form"
        >

          <div class="field">

            <label>
              Admin Username
            </label>

            <input
              name="username"
              autocomplete="username"
              required
            >

          </div>


          <div class="field">

            <label>
              Password
            </label>

            <input
              name="password"
              type="password"
              autocomplete="current-password"
              required
            >

          </div>


          <button
            class="
              btn
              btn-primary
              login-btn
            "
          >
            Login as Admin
          </button>


          <div class="login-demo">
            Demo credentials:
            admin / admin123
          </div>


          <span
            id="login-error"
            class="error"
          ></span>

        </form>

      </div>
    `;

    $("#login-form").onsubmit = (e) => {
      e.preventDefault();

      const d = Object.fromEntries(new FormData(e.target).entries());

      if (d.username === "admin" && d.password === "admin123") {
        Storage.login();

        root.classList.add("hidden");

        $("#app-shell").classList.remove("hidden");

        render();
      } else {
        $("#login-error").textContent = "Invalid admin username or password.";
      }
    };
  }

  /* ==========================================
     PUBLIC API
  ========================================== */

  return {
    init: () => {
      DemoData.seed();

      Navigation.init();

      document.getElementById("logout-btn").onclick = () => {
        Storage.logout();

        showLogin();

        Toast.show("Admin logged out.", "info");
      };

      if (Storage.isLoggedIn()) {
        $("#app-shell").classList.remove("hidden");

        $("#login-screen").classList.add("hidden");
      }

      render();
    },

    render,

    viewCar,

    editCar: (id) => Navigation.go(`edit-car/${id}`),

    openDelivery: (id) => openVehicleUpdateModal(id, "delivery"),

    openCondition: (id) => openVehicleUpdateModal(id, "condition"),

    openExpenditure: (id) => openVehicleUpdateModal(id, "finance"),

    selectImage: (el, url) => {
      $("#main-car-image").src = url;

      document
        .querySelectorAll(".thumbs img")
        .forEach((x) => x.classList.remove("active"));

      el.classList.add("active");
    },

    sellCar,

    deleteCar,

    deleteExpense,

    editRepair: (id) => Navigation.go(`edit-repair/${id}`),

    deleteRepair,
  };
})();

document.addEventListener("DOMContentLoaded", App.init);
