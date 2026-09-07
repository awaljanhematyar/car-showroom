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
    const sold = cars.filter((c) => c.status === "Sold"),
      sales = sold.reduce((a, c) => a + Number(c.salePrice || c.price), 0),
      expenses = ex.reduce((a, e) => a + Number(e.amount), 0),
      repairCost = rep.reduce((a, r) => a + Number(r.cost || 0), 0),
      net = sales - expenses - repairCost;

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
  function page(title, body) {
    $("#page-title").textContent = title;
    $("#breadcrumb").textContent = title;
    $("#app").innerHTML = `<div class="page-enter">${body}</div>`;
    $("#app").focus({ preventScroll: true });
  }
  function stat(label, value, support, icon) {
    return `<div class="stat-card"><div class="stat-top"><span class="stat-label">${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-support">${support}</div></div>`;
  }
  function empty(title, text, route) {
    return `<div class="empty"><div class="empty-icon">🚘</div><strong>${title}</strong><p>${text}</p>${route ? `<button class="btn btn-primary" onclick="Navigation.go('${route}')">＋ Add Car</button>` : ""}</div>`;
  }
  function repairCostForCar(carId) {
    return Storage.getRepairs()
      .filter((r) => r.carId === carId)
      .reduce((sum, r) => sum + Number(r.cost || 0), 0);
  }
  function carCards(cars) {
    if (!cars.length)
      return empty(
        "No cars found",
        "Try changing your filters or add a new vehicle.",
        "add-car",
      );
    return `<div class="car-grid">${cars
      .map((c) => {
        const repairCost = repairCostForCar(c.id),
          totalCost = Number(c.price || 0) + repairCost;
        return `<article class="car-card"><div class="car-image-wrap"><img src="${esc(c.images?.[0] || imageFallback)}" alt="${esc(c.brand + " " + c.model)}" onerror="this.src='${imageFallback}'"><span class="badge ${c.status === "Available" ? "badge-available" : "badge-sold"}">${c.status}</span><span class="image-count">${c.images?.length || 0} photo${(c.images?.length || 0) === 1 ? "" : "s"}</span></div><div class="car-card-body"><h3>${esc(c.brand)} ${esc(c.model)}</h3><div class="car-meta">${c.year} · ${Number(c.mileage || 0).toLocaleString()} km · ${esc(c.location)}</div><div class="car-price">${money(c.salePrice || c.price)}</div><div class="car-costs"><div><span>Repair Cost</span><strong>${money(repairCost)}</strong></div><div><span>Total Cost</span><strong>${money(totalCost)}</strong></div></div><div class="actions"><button class="btn btn-sm" onclick="App.viewCar('${c.id}')">View</button><button class="btn btn-sm" onclick="App.editCar('${c.id}')">Edit</button>${c.status === "Available" ? `<button class="btn btn-sm btn-success" onclick="App.sellCar('${c.id}')">Sell</button>` : ""}<button class="btn btn-sm btn-danger" onclick="App.deleteCar('${c.id}')">Delete</button></div></div></article>`;
      })
      .join("")}</div>`;
  }
  function dashboard() {
    const cars = Storage.getCars(),
      ex = Storage.getExpenses(),
      rep = Storage.getRepairs(),
      m = metric(cars, ex, rep),
      t = today(),
      soldToday = cars.filter((c) => c.soldAt?.slice(0, 10) === t),
      salesToday = soldToday.reduce((a, c) => a + Number(c.salePrice || 0), 0),
      exToday = ex
        .filter((e) => e.date === t)
        .reduce((a, e) => a + Number(e.amount), 0),
      repToday = rep
        .filter((r) => r.date === t)
        .reduce((a, r) => a + Number(r.cost), 0),
      net = salesToday - exToday - repToday,
      acts = Storage.getActivities().slice(0, 6);
    page(
      "Dashboard",
      `<div class="section-head"><div><h2>Showroom overview</h2><p>Manage inventory, sales, repairs and daily operations.</p></div><button class="btn btn-primary" onclick="Navigation.go('add-car')">＋ Add Car</button></div><div class="stats-grid">${stat("Total Cars", m.total, "All inventory records", "🚘")}${stat("Available Cars", m.available, "Ready for sale", "✓")}${stat("Sold Cars", m.sold, "Completed sales", "↗")}${stat("Total Sales", money(m.sales), "From sold vehicles", "$")}${stat("Total Expenses", money(m.expenses), "Recorded expenses", "◈")}${stat("Repair Costs", money(m.repairCost), "Workshop costs", "🔧")}${stat("Total Profit", money(m.profit), "Sales minus costs", "＋")}${stat("Total Loss", money(m.loss), "Only when costs exceed sales", "−")}</div><div class="grid-2"><div class="panel"><div class="panel-head"><h3>Today's Summary</h3><span>${date(t)}</span></div><div class="summary-grid"><div class="summary-item"><span>Cars Added</span><strong>${cars.filter((c) => c.createdAt.slice(0, 10) === t).length}</strong></div><div class="summary-item"><span>Cars Sold</span><strong>${soldToday.length}</strong></div><div class="summary-item"><span>Sales</span><strong>${money(salesToday)}</strong></div><div class="summary-item"><span>Expenses</span><strong>${money(exToday)}</strong></div><div class="summary-item"><span>Repair Costs</span><strong>${money(repToday)}</strong></div><div class="summary-item"><span>Net Result</span><strong class="${net >= 0 ? "kpi-positive" : "kpi-negative"}">${money(Math.abs(net))}</strong></div></div></div><div class="panel"><div class="panel-head"><h3>Recent Activity</h3><span>${acts.length} latest</span></div><div class="activity-list">${acts.length ? acts.map((a) => `<div class="activity"><div class="activity-icon">•</div><div class="activity-body"><strong>${esc(a.description)}</strong><span>${date(a.createdAt)}</span></div></div>`).join("") : empty("No recent activity", "Your showroom activity will appear here.")}</div></div></div><div class="panel"><div class="panel-head"><h3>Recent Cars</h3><button class="btn btn-sm" onclick="Navigation.go('cars')">View All</button></div>${carCards(
        cars
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 6),
      )}</div>`,
    );
  }
  function carsPage() {
    page(
      "Cars",
      `<div class="section-head"><div><h2>Vehicle inventory</h2><p>Simple search and practical filters.</p></div><button class="btn btn-primary" onclick="Navigation.go('add-car')">＋ Add Car</button></div><div class="panel"><div class="filters"><div class="field search-field"><label>Search</label><input id="car-search" placeholder="Brand, model or location"></div><div class="field"><label>Brand</label><select id="car-brand"><option value="">All brands</option>${["Toyota", "Honda", "Lexus", "Nissan", "Hyundai", "Kia", "Mercedes-Benz", "BMW", "Audi", "Ford"].map((x) => `<option>${x}</option>`).join("")}</select></div><div class="field"><label>Status</label><select id="car-status"><option value="">All status</option><option>Available</option><option>Sold</option></select></div><div class="field"><label>Location</label><select id="car-location"><option value="">All locations</option>${["Kabul", "Herat", "Kandahar", "Jalalabad", "Mazar-i-Sharif"].map((x) => `<option>${x}</option>`).join("")}</select></div><div class="field"><label>Max Price</label><input id="car-price" type="number" min="0" placeholder="Any"></div><button class="btn" id="clear-car-filters">Clear</button></div><div id="cars-results"></div></div>`,
    );
    const render = () => {
      let a = Storage.getCars(),
        q = $("#car-search").value.toLowerCase().trim(),
        b = $("#car-brand").value,
        s = $("#car-status").value,
        l = $("#car-location").value,
        p = Number($("#car-price").value || 0);
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
  function imageUploader(existing = []) {
    return `<div class="upload-box"><input id="image-input" type="file" accept="image/*" multiple hidden><label for="image-input" class="upload-trigger">＋ Upload Car Images</label><p>Choose multiple images. Preview them before saving.</p><div id="image-preview" class="image-preview"></div></div>`;
  }
  async function compress(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => {
        const img = new Image();
        img.onload = () => {
          const max = 1000,
            scale = Math.min(1, max / img.width),
            c = document.createElement("canvas");
          c.width = Math.round(img.width * scale);
          c.height = Math.round(img.height * scale);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL("image/jpeg", 0.72));
        };
        img.onerror = reject;
        img.src = r.result;
      };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }
  function carListPage() {
    const cars = Storage.getCars()
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const filterMarkup = `<section class="car-list-filters" id="car-list-filters" aria-label="Search and filter cars">
      <div class="car-filter-group car-search-group">
        <label for="car-search">Search</label>
        <input type="search" id="car-search" placeholder="Search VIN, model or customer name..." autocomplete="off">
      </div>
      <div class="car-filter-group"><label for="filter-vin">VIN</label><input id="filter-vin" type="text" placeholder="VIN"></div>
      <div class="car-filter-group"><label for="filter-model">Model</label><input id="filter-model" type="text" placeholder="Model"></div>
      <div class="car-filter-group"><label for="filter-status">Status</label>
        <select id="filter-status"><option value="">All Statuses</option><option>Available</option><option>Delivered</option><option>Sold</option><option>Damaged</option></select>
      </div>
      <div class="car-filter-group"><label for="filter-destination">Destination</label><input id="filter-destination" type="text" placeholder="Destination"></div>
      <div class="car-filter-group"><label for="filter-location">First Location</label><input id="filter-location" type="text" placeholder="First location"></div>
      <div class="car-filter-group"><label for="filter-date">Date</label><input id="filter-date" type="date"></div>
      <div class="car-filter-group"><label for="filter-damage">Damage</label>
        <select id="filter-damage"><option value="">All</option><option value="yes">Damaged</option><option value="no">Not Damaged</option></select>
      </div>
      <div class="car-filter-group"><label for="filter-deliver">Deliver</label>
        <select id="filter-deliver"><option value="">All</option><option value="yes">Delivered</option><option value="no">Not Delivered</option></select>
      </div>
      <div class="car-filter-actions">
        <button type="button" class="btn btn-secondary" id="clear-car-filters">Clear Filters</button>
        <button type="button" class="btn btn-primary" id="add-car-from-list">Add Car</button>
      </div>
    </section>`;

    const rowMarkup = (list) => list.length
      ? list.map((c) => {
          const repair = repairCostForCar(c.id);
          const delivered = c.delivery?.status === "Delivered" || c.status === "Delivered";
          const damaged = c.damage?.damaged === "Yes" || c.damage?.damaged === true || c.status === "Damaged";
          return `<tr class="car-list-row" tabindex="0" onclick="if(!event.target.closest('button,a')) App.viewCar('${c.id}')" onkeydown="if((event.key==='Enter'||event.key===' ')&&!event.target.closest('button,a')){event.preventDefault();App.viewCar('${c.id}')}" aria-label="View details for ${esc(c.brand)} ${esc(c.model)}">
            <td>${date(c.createdAt)}</td>
            <td><strong>${esc(c.vin || "N/A")}</strong></td>
            <td><div class="list-car"><img src="${esc(c.images?.[0] || imageFallback)}" alt="${esc(c.brand + " " + c.model)}" onerror="this.src='${imageFallback}'"><div><strong>${esc(c.brand)} ${esc(c.model)}</strong><span>${c.year || "N/A"}</span></div></div></td>
            <td><span class="badge ${c.status === "Available" ? "badge-available" : c.status === "Delivered" ? "badge-progress" : damaged ? "badge-danger" : "badge-sold"}">${esc(c.status || "Available")}</span></td>
            <td>${esc(c.destination || "N/A")}</td>
            <td>${esc(c.firstLocation || c.location || "N/A")}</td>
            <td><img class="list-image" src="${esc(c.images?.[0] || imageFallback)}" alt="Vehicle image" onerror="this.src='${imageFallback}'"></td>
            <td><span class="table-state ${delivered ? "is-yes" : "is-no"}">${delivered ? "Yes" : "No"}</span></td>
            <td><span class="table-state ${damaged ? "is-yes" : "is-no"}">${damaged ? "Yes" : "No"}</span></td>
            <td>${money(c.finance?.totalExpenditure ?? repair)}</td>
            <td><div class="actions"><button class="btn btn-sm" onclick="event.stopPropagation();App.viewCar('${c.id}')">View</button><button class="btn btn-sm" onclick="event.stopPropagation();App.editCar('${c.id}')">Edit</button><button class="btn btn-sm btn-danger" onclick="event.stopPropagation();App.deleteCar('${c.id}')">Delete</button></div></td>
          </tr>`;
        }).join("")
      : `<tr><td colspan="11"><div class="empty-state"><strong>No cars found</strong><span>Try changing your search or filters.</span><button class="btn btn-primary" onclick="Navigation.go('add-car')">＋ Add Car</button></div></td></tr>`;

    page(
      "List of Cars",
      `${filterMarkup}
      <div class="section-head"><div><h2>List of Cars</h2><p>Click anywhere on a vehicle row to open the complete vehicle record.</p></div></div>
      <div class="panel"><div class="panel-head"><h3>All Cars</h3><span id="listing-count">${cars.length} vehicle${cars.length === 1 ? "" : "s"}</span></div>
      <div class="table-wrap car-list-table-wrap"><table class="data-table car-list-table"><thead><tr><th>Date</th><th>VIN</th><th>Model</th><th>Status</th><th>Destination</th><th>First Location</th><th>Image</th><th>Deliver</th><th>Damage</th><th>Expenditure</th><th>Actions</th></tr></thead><tbody id="car-list-results">${rowMarkup(cars)}</tbody></table></div></div>`,
    );

    const state = window.carListFilterState || (window.carListFilterState = {search:"",vin:"",model:"",status:"",destination:"",firstLocation:"",date:"",damage:"",deliver:""});
    const fieldMap = {"car-search":"search","filter-vin":"vin","filter-model":"model","filter-status":"status","filter-destination":"destination","filter-location":"firstLocation","filter-date":"date","filter-damage":"damage","filter-deliver":"deliver"};
    const getField = (car, keys) => {
      for (const key of keys) {
        const value = key.split(".").reduce((obj, part) => obj && obj[part], car);
        if (value !== undefined && value !== null && value !== "") return String(value);
      }
      return "";
    };
    const matches = (car) => {
      const search = state.search.toLowerCase();
      const searchable = [getField(car,["vin","VIN"]), getField(car,["model"]), getField(car,["brand"]), getField(car,["customerName","customer.name","customer"])].join(" ").toLowerCase();
      if (search && !searchable.includes(search)) return false;
      for (const [wanted, keys] of [[state.vin,["vin","VIN"]],[state.model,["model"]],[state.destination,["destination"]],[state.firstLocation,["firstLocation","location"]]]) {
        if (wanted && !getField(car, keys).toLowerCase().includes(wanted.toLowerCase())) return false;
      }
      if (state.status && getField(car,["status"]).toLowerCase() !== state.status.toLowerCase()) return false;
      const carDate = getField(car,["date","createdAt"]).slice(0,10);
      if (state.date && carDate !== state.date) return false;
      const damaged = car.damage?.damaged === "Yes" || car.damage?.damaged === true || car.status === "Damaged";
      const delivered = car.delivery?.status === "Delivered" || car.status === "Delivered";
      if (state.damage && damaged !== (state.damage === "yes")) return false;
      if (state.deliver && delivered !== (state.deliver === "yes")) return false;
      return true;
    };
    const renderFiltered = () => {
      const filtered = cars.filter(matches);
      const results = $("#car-list-results");
      const count = $("#listing-count");
      if (results) results.innerHTML = rowMarkup(filtered);
      if (count) count.textContent = `${filtered.length} vehicle${filtered.length === 1 ? "" : "s"}`;
    };
    Object.entries(fieldMap).forEach(([id,key]) => {
      const el = $("#" + id);
      if (!el) return;
      el.value = state[key] || "";
      el.addEventListener(el.tagName === "SELECT" || el.type === "date" ? "change" : "input", () => {
        state[key] = el.value.trim();
        renderFiltered();
      });
    });
    $("#clear-car-filters").onclick = () => {
      Object.keys(state).forEach((key) => state[key] = "");
      Object.keys(fieldMap).forEach((id) => { const el = $("#" + id); if (el) el.value = ""; });
      renderFiltered();
    };
    $("#add-car-from-list").onclick = () => Navigation.go("add-car");
  }
  function formPage(editId = null) {
    const c = editId ? carById(editId) : null,
      existingRepairCost = editId ? repairCostForCar(editId) : 0;
    page(
      editId ? "Edit Car" : "Add Car",
      `<div class="section-head"><div><h2>${editId ? "Update vehicle" : "Add a vehicle"}</h2><p>Keep the car record simple. Add only important details.</p></div><button class="btn" onclick="Navigation.go('cars')">Back to Cars</button></div><form id="car-form" class="panel"><div class="form-grid"><div class="field"><label>Brand *</label><input name="brand" required value="${esc(c?.brand || "")}"></div><div class="field"><label>Model *</label><input name="model" required value="${esc(c?.model || "")}"></div><div class="field"><label>Year *</label><input name="year" type="number" min="1950" max="2100" required value="${c?.year || ""}"></div><div class="field"><label>Price *</label><input name="price" type="number" min="0" required value="${c?.price || ""}"></div><div class="field"><label>Mileage</label><input name="mileage" type="number" min="0" value="${c?.mileage || ""}"></div><div class="field"><label>Location *</label><select name="location" required>${["Kabul", "Herat", "Kandahar", "Jalalabad", "Mazar-i-Sharif"].map((x) => `<option ${c?.location === x ? "selected" : ""}>${x}</option>`).join("")}</select></div><div class="field"><label>Fuel</label><select name="fuelType"><option ${c?.fuelType === "Petrol" ? "selected" : ""}>Petrol</option><option ${c?.fuelType === "Diesel" ? "selected" : ""}>Diesel</option><option ${c?.fuelType === "Hybrid" ? "selected" : ""}>Hybrid</option><option ${c?.fuelType === "Electric" ? "selected" : ""}>Electric</option></select></div><div class="field"><label>Status</label><select name="status"><option ${!c || c.status === "Available" ? "selected" : ""}>Available</option><option ${c?.status === "Sold" ? "selected" : ""}>Sold</option></select></div><div class="field full"><label>Notes / یادښت</label><textarea name="notes" placeholder="Important notes about this car">${esc(c?.notes || "")}</textarea></div><div class="field full"><label>Photos</label>${imageUploader(c?.images || [])}<div id="existing-images" class="image-preview">${(c?.images || []).map((u, i) => `<div class="preview-item"><img src="${esc(u)}"><button type="button" class="remove-image" data-existing="${i}">×</button></div>`).join("")}</div></div><div class="field full"><div class="repair-inline-head"><div><label>Direct Repair</label><p class="field-help">If this car was repaired before adding it, record the part and repair cost here.</p></div><label class="switch"><input id="direct-repair-toggle" type="checkbox"><span class="slider"></span></label></div><div id="direct-repair-box" class="direct-repair-box" style="display:none"><div class="form-grid"><div class="field"><label>Part / Repair Work *</label><input name="repairType" placeholder="e.g. Engine oil, brake, bumper"></div><div class="field"><label>Repair Cost *</label><input name="repairCost" type="number" min="0" placeholder="0"></div><div class="field"><label>Repair Date</label><input name="repairDate" type="date" value="${today()}"></div><div class="field"><label>Status</label><select name="repairStatus"><option>Completed</option><option>In Progress</option></select></div><div class="field full"><label>Repair Note</label><textarea name="repairNotes" placeholder="Short note about the repair"></textarea></div></div></div>${editId ? `<div class="repair-total-line"><span>Existing Repair Cost</span><strong>${money(existingRepairCost)}</strong></div>` : ""}</div></div><div class="form-actions"><button type="button" class="btn" onclick="Navigation.go('cars')">Cancel</button><button class="btn btn-primary" type="submit">${editId ? "Update Car" : "Save Car"}</button></div></form>`,
    );
    let selected = [];
    $("#direct-repair-toggle").onchange = (e) => {
      $("#direct-repair-box").style.display = e.target.checked
        ? "block"
        : "none";
    };
    $("#image-input").onchange = async (e) => {
      const files = [...e.target.files];
      Toast.show("Preparing images...", "info");
      for (const f of files) {
        if (f.type.startsWith("image/")) selected.push(await compress(f));
      }
      renderPreviews();
      e.target.value = "";
    };
    function renderPreviews() {
      $("#image-preview").innerHTML = selected
        .map(
          (u, i) =>
            `<div class="preview-item"><img src="${u}"><button type="button" class="remove-image" data-new="${i}">×</button></div>`,
        )
        .join("");
    }
    document.addEventListener(
      "click",
      function handler(e) {
        if (e.target.matches("[data-new]")) {
          selected.splice(Number(e.target.dataset.new), 1);
          renderPreviews();
        }
        if (e.target.matches("[data-existing]")) {
          const i = Number(e.target.dataset.existing),
            imgs = c.images.slice();
          imgs.splice(i, 1);
          c.images = imgs;
          e.target.parentElement.remove();
        }
      },
      { once: false },
    );
    $("#car-form").onsubmit = (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target).entries());
      if (
        !d.brand.trim() ||
        !d.model.trim() ||
        !d.year ||
        !d.price ||
        !d.location
      )
        return Toast.show("Please fill the required car fields.", "error");
      const directRepair = $("#direct-repair-toggle").checked;
      if (directRepair && (!d.repairType.trim() || Number(d.repairCost) < 0))
        return Toast.show(
          "Please enter the repair part and repair cost.",
          "error",
        );
      const btn = e.target.querySelector("[type=submit]");
      btn.disabled = true;
      btn.textContent = "Saving...";
      setTimeout(() => {
        const cars = Storage.getCars(),
          imgs = [...(c?.images || []), ...selected],
          obj = {
            ...(c || {}),
            id: c?.id || uid("car"),
            brand: d.brand.trim(),
            model: d.model.trim(),
            year: Number(d.year),
            price: Number(d.price),
            mileage: Number(d.mileage || 0),
            location: d.location,
            fuelType: d.fuelType,
            status: d.status,
            notes: d.notes.trim(),
            images: imgs,
            createdAt: c?.createdAt || new Date().toISOString(),
            soldAt: c?.soldAt || null,
            salePrice: c?.salePrice || null,
          };
        if (editId) cars[cars.findIndex((x) => x.id === editId)] = obj;
        else cars.unshift(obj);
        Storage.saveCars(cars);
        if (directRepair) {
          const repairs = Storage.getRepairs();
          repairs.unshift({
            id: uid("repair"),
            carId: obj.id,
            date: d.repairDate || today(),
            type: d.repairType.trim(),
            cost: Number(d.repairCost),
            status: d.repairStatus || "Completed",
            notes: d.repairNotes.trim(),
            images: [],
            createdAt: new Date().toISOString(),
          });
          Storage.saveRepairs(repairs);
          activity(
            "repair_saved",
            `${d.repairType.trim()} repair was added for ${obj.brand} ${obj.model}`,
          );
        }
        activity(
          editId ? "car_edited" : "car_added",
          `${obj.brand} ${obj.model} was ${editId ? "updated" : "added"}`,
        );
        Toast.show(
          editId ? "Car updated successfully." : "Car added successfully.",
          "success",
        );
        Navigation.go(`car/${obj.id}`);
      }, 350);
    };
  }
  function viewCar(id) {
    const c = carById(id);
    if (!c) return Navigation.go("car-list");

    const condition = c.condition || {};
    const delivery = c.delivery || {};
    const damage = c.damage || {};
    const finance = c.finance || {};
    const totalExpenditure = Number(finance.totalExpenditure ?? repairCostForCar(c.id));
    const totalCost = Number(finance.purchaseCost ?? c.price ?? 0) + totalExpenditure;
    const salePrice = Number(c.salePrice || 0);
    const profitLoss = salePrice ? salePrice - totalCost : null;
    const delivered = delivery.status === "Delivered" || c.status === "Delivered";
    const damaged = damage.damaged === "Yes" || damage.damaged === true || c.status === "Damaged";
    const conditions = ["Pictured", "CD Player", "TV", "Front Glass", "Remote", "Battery", "Sport Wheel", "Damaged", "Head Rest", "Title Received"];

    const conditionRows = conditions.map((name) => {
      const value = condition[name] === true ? "Yes" : condition[name] === false ? "No" : (condition[name] || "No");
      return `<div class="spec"><span>${name}</span><strong>${esc(value)}</strong></div>`;
    }).join("");

    page(
      "Car Details",
      `<div class="section-head"><div><h2>${esc(c.brand || "")} ${esc(c.model || "")}</h2><p>Complete vehicle record. Every detail connected to this vehicle is shown below.</p></div><button class="btn" onclick="Navigation.go('car-list')">Back to List</button></div>

      <div class="details-grid">
        <div class="panel"><img id="main-car-image" class="gallery-main" src="${esc(c.images?.[0] || imageFallback)}" onerror="this.src='${imageFallback}'"><div class="thumbs">${(c.images?.length ? c.images : [imageFallback]).map((u, i) => `<img class="${i === 0 ? "active" : ""}" src="${esc(u)}" onclick="App.selectImage(this,'${esc(u)}')" alt="Vehicle photo ${i + 1}">`).join("")}</div></div>

        <div class="panel">
          <h2 class="detail-title">${esc(c.brand)} ${esc(c.model)}</h2>
          <span class="badge ${c.status === "Available" ? "badge-available" : delivered ? "badge-progress" : damaged ? "badge-danger" : "badge-sold"}">${esc(c.status || "Available")}</span>
          <div class="price">${money(salePrice || c.price)}</div>
          <div class="actions"><button class="btn" onclick="App.editCar('${c.id}')">Edit</button><button class="btn btn-success" onclick="App.openDelivery('${c.id}')">Deliver</button><button class="btn" onclick="App.openExpenditure('${c.id}')">Add Expenditure</button><button class="btn" onclick="App.openCondition('${c.id}')">Update Condition</button><button class="btn" onclick="window.print()">Print</button><button class="btn btn-danger" onclick="App.deleteCar('${c.id}')">Delete</button></div>
        </div>
      </div>

      <div class="detail-section-grid">
        <div class="panel"><div class="panel-head"><h3>Basic Information</h3></div><div class="spec-grid">
          <div class="spec"><span>Customer Name</span><strong>${esc(c.customerName || "N/A")}</strong></div>
          <div class="spec"><span>Location</span><strong>${esc(c.location || "N/A")}</strong></div>
          <div class="spec"><span>Action Location</span><strong>${esc(c.actionLocation || "N/A")}</strong></div>
          <div class="spec"><span>Destination</span><strong>${esc(c.destination || "N/A")}</strong></div>
          <div class="spec"><span>First Location</span><strong>${esc(c.firstLocation || c.location || "N/A")}</strong></div>
          <div class="spec"><span>VIN</span><strong>${esc(c.vin || "N/A")}</strong></div>
          <div class="spec"><span>Model</span><strong>${esc(c.brand || "")} ${esc(c.model || "")}</strong></div>
          <div class="spec"><span>Status</span><strong>${esc(c.status || "Available")}</strong></div>
          <div class="spec"><span>Date</span><strong>${date(c.createdAt)}</strong></div>
          <div class="spec"><span>Image</span><strong>${c.images?.length || 0} photo${(c.images?.length || 0) === 1 ? "" : "s"}</strong></div>
        </div></div>

        <div class="panel"><div class="panel-head"><h3>Condition</h3></div><div class="spec-grid">${conditionRows}</div></div>
      </div>

      <div class="detail-section-grid">
        <div class="panel"><div class="panel-head"><h3>Delivery</h3><span class="badge ${delivered ? "badge-available" : "badge-sold"}">${delivered ? "Delivered" : "Not Delivered"}</span></div><div class="spec-grid">
          <div class="spec"><span>Deliver Status</span><strong>${esc(delivery.status || (delivered ? "Delivered" : "Pending"))}</strong></div>
          <div class="spec"><span>Delivery Date</span><strong>${esc(delivery.date || "N/A")}</strong></div>
          <div class="spec"><span>Delivery Location</span><strong>${esc(delivery.location || "N/A")}</strong></div>
          <div class="spec"><span>Delivered To</span><strong>${esc(delivery.deliveredTo || "N/A")}</strong></div>
          <div class="spec full-spec"><span>Notes</span><strong>${esc(delivery.notes || "N/A")}</strong></div>
        </div></div>

        <div class="panel"><div class="panel-head"><h3>Damage</h3><span class="badge ${damaged ? "badge-danger" : "badge-available"}">${damaged ? "Damaged" : "No Damage"}</span></div><div class="spec-grid">
          <div class="spec"><span>Damaged</span><strong>${damaged ? "Yes" : "No"}</strong></div>
          <div class="spec"><span>Damage Type</span><strong>${esc(damage.type || "N/A")}</strong></div>
          <div class="spec"><span>Damage Description</span><strong>${esc(damage.description || "N/A")}</strong></div>
          <div class="spec"><span>Damage Location</span><strong>${esc(damage.location || "N/A")}</strong></div>
          <div class="spec"><span>Damage Cost</span><strong>${money(damage.cost || 0)}</strong></div>
          <div class="spec"><span>Damage Date</span><strong>${esc(damage.date || "N/A")}</strong></div>
        </div></div>
      </div>

      <div class="panel"><div class="panel-head"><h3>Expenditure / Finance</h3><strong>${money(totalExpenditure)} Total Expenditure</strong></div><div class="spec-grid finance-detail-grid">
        <div class="spec"><span>Purchase Cost</span><strong>${money(finance.purchaseCost ?? c.price)}</strong></div>
        <div class="spec"><span>Recovery</span><strong>${money(finance.recovery || 0)}</strong></div>
        <div class="spec"><span>Dubai to Islam Qala Expenses</span><strong>${money(finance.dubaiToIslamQala || 0)}</strong></div>
        <div class="spec"><span>Transportation</span><strong>${money(finance.transportation || 0)}</strong></div>
        <div class="spec"><span>Customs</span><strong>${money(finance.customs || 0)}</strong></div>
        <div class="spec"><span>Repair</span><strong>${money(finance.repair || 0)}</strong></div>
        <div class="spec"><span>Maintenance</span><strong>${money(finance.maintenance || 0)}</strong></div>
        <div class="spec"><span>Documentation</span><strong>${money(finance.documentation || 0)}</strong></div>
        <div class="spec"><span>Other Expenses</span><strong>${money(finance.otherExpenses || 0)}</strong></div>
        <div class="spec"><span>Total Expenditure</span><strong>${money(totalExpenditure)}</strong></div>
        <div class="spec"><span>Total Cost</span><strong>${money(totalCost)}</strong></div>
        <div class="spec"><span>Sale Price</span><strong>${salePrice ? money(salePrice) : "N/A"}</strong></div>
        <div class="spec"><span>Profit / Loss</span><strong class="${profitLoss === null ? "" : profitLoss >= 0 ? "kpi-positive" : "kpi-negative"}">${profitLoss === null ? "N/A" : `${profitLoss >= 0 ? "Profit" : "Loss"}: ${money(Math.abs(profitLoss))}`}</strong></div>
      </div></div>

      <div class="panel"><div class="panel-head"><h3>Notes</h3></div><div class="notes-box"><p>${esc(c.notes || "No notes added.")}</p></div></div>`
    );
  }
  function sellCar(id) {
    const c = carById(id);
    if (!c || c.status === "Sold") return;
    Modal.open({
      title: "Sell Vehicle",
      message: `Mark ${c.brand} ${c.model} as sold?`,
      confirmText: "Confirm Sale",
      onConfirm: () => {
        const cars = Storage.getCars(),
          i = cars.findIndex((x) => x.id === id);
        cars[i] = {
          ...cars[i],
          status: "Sold",
          soldAt: new Date().toISOString(),
          salePrice: Number(cars[i].price),
        };
        Storage.saveCars(cars);
        activity("car_sold", `${c.brand} ${c.model} was sold`);
        Toast.show("Car sold successfully.", "success");
        render();
      },
    });
  }
  function deleteCar(id) {
    const c = carById(id);
    if (!c) return;
    Modal.open({
      title: "Delete Vehicle",
      message: `Permanently delete ${c.brand} ${c.model}?`,
      confirmText: "Delete",
      danger: true,
      onConfirm: () => {
        Storage.saveCars(Storage.getCars().filter((x) => x.id !== id));
        activity("car_deleted", `${c.brand} ${c.model} was deleted`);
        Toast.show("Car deleted successfully.", "success");
        Navigation.go("cars");
      },
    });
  }
  function expensesPage() {
    const render = () => {
      const ex = Storage.getExpenses();
      page(
        "Expenses",
        `<div class="section-head"><div><h2>Expenses</h2><p>Track normal showroom operating costs.</p></div><button class="btn btn-primary" onclick="Navigation.go('add-expense')">＋ Add Expense</button></div><div class="report-cards"><div class="report-card"><span>Total Expenses</span><strong>${money(ex.reduce((a, e) => a + Number(e.amount), 0))}</strong></div><div class="report-card"><span>Today</span><strong>${money(ex.filter((e) => e.date === today()).reduce((a, e) => a + Number(e.amount), 0))}</strong></div><div class="report-card"><span>This Month</span><strong>${money(ex.filter((e) => e.date.slice(0, 7) === today().slice(0, 7)).reduce((a, e) => a + Number(e.amount), 0))}</strong></div></div><div class="panel"><div class="filters"><div class="field"><label>Search</label><input id="ex-search" placeholder="Category, description or date"></div><div class="field"><label>Category</label><select id="ex-cat"><option value="">All categories</option>${["Maintenance", "Fuel", "Transportation", "Rent", "Salaries", "Marketing", "Utilities", "Other"].map((x) => `<option>${x}</option>`).join("")}</select></div><div class="field"><label>From</label><input id="ex-from" type="date"></div><div class="field"><label>To</label><input id="ex-to" type="date"></div><button class="btn" id="ex-clear">Clear</button></div><div id="ex-list"></div></div>`,
      );
      const update = () => {
        let a = Storage.getExpenses(),
          q = $("#ex-search").value.toLowerCase(),
          cat = $("#ex-cat").value,
          from = $("#ex-from").value,
          to = $("#ex-to").value;
        a = a.filter(
          (e) =>
            (!q ||
              `${e.category} ${e.description} ${e.date}`
                .toLowerCase()
                .includes(q)) &&
            (!cat || e.category === cat) &&
            (!from || e.date >= from) &&
            (!to || e.date <= to),
        );
        $("#ex-list").innerHTML = a.length
          ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Description</th><th>Action</th></tr></thead><tbody>${a.map((e) => `<tr><td data-label="Date">${date(e.date)}</td><td data-label="Category">${esc(e.category)}</td><td data-label="Amount">${money(e.amount)}</td><td data-label="Description">${esc(e.description)}</td><td data-label="Action"><button class="btn btn-sm btn-danger" onclick="App.deleteExpense('${e.id}')">Delete</button></td></tr>`).join("")}</tbody></table></div>`
          : empty(
              "No expenses recorded",
              "Start tracking your showroom expenses.",
            );
      };
      ["ex-search", "ex-cat", "ex-from", "ex-to"].forEach((id) =>
        $("#" + id).addEventListener("input", update),
      );
      $("#ex-clear").onclick = () => {
        ["ex-search", "ex-cat", "ex-from", "ex-to"].forEach(
          (id) => ($("#" + id).value = ""),
        );
        update();
      };
      update();
    };
    render();
  }
  function addExpense() {
    page(
      "Add Expense",
      `<div class="section-head"><div><h2>Record expense</h2><p>Enter the important expense details.</p></div></div><form id="expense-form" class="panel"><div class="form-grid"><div class="field"><label>Date *</label><input name="date" type="date" required value="${today()}"></div><div class="field"><label>Category *</label><select name="category" required>${["Maintenance", "Fuel", "Transportation", "Rent", "Salaries", "Marketing", "Utilities", "Other"].map((x) => `<option>${x}</option>`).join("")}</select></div><div class="field"><label>Amount *</label><input name="amount" type="number" min="1" required></div><div class="field full"><label>Description *</label><textarea name="description" required></textarea></div></div><div class="form-actions"><button type="button" class="btn" onclick="Navigation.go('expenses')">Cancel</button><button class="btn btn-primary" type="submit">Save Expense</button></div></form>`,
    );
    $("#expense-form").onsubmit = (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target).entries());
      if (
        !d.date ||
        !d.category ||
        Number(d.amount) <= 0 ||
        !d.description.trim()
      )
        return Toast.show("Please complete the expense fields.", "error");
      Storage.saveExpenses([
        {
          id: uid("expense"),
          date: d.date,
          category: d.category,
          amount: Number(d.amount),
          description: d.description.trim(),
          createdAt: new Date().toISOString(),
        },
        ...Storage.getExpenses(),
      ]);
      activity(
        "expense_added",
        `${d.category} expense of ${money(d.amount)} was added`,
      );
      Toast.show("Expense added successfully.", "success");
      Navigation.go("expenses");
    };
  }
  function repairsPage() {
    const repairs = Storage.getRepairs(),
      cars = Storage.getCars();
    page(
      "Repairs",
      `<div class="section-head"><div><h2>Repair Management</h2><p>Track maintenance work, cost, status and notes.</p></div><button class="btn btn-primary" onclick="Navigation.go('add-repair')">＋ Add Repair</button></div><div class="report-cards"><div class="report-card"><span>Total Repairs</span><strong>${repairs.length}</strong></div><div class="report-card"><span>In Progress</span><strong>${repairs.filter((r) => r.status === "In Progress").length}</strong></div><div class="report-card"><span>Total Repair Cost</span><strong>${money(repairs.reduce((a, r) => a + Number(r.cost || 0), 0))}</strong></div></div><div class="panel">${
        repairs.length
          ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Car</th><th>Date</th><th>Repair</th><th>Cost</th><th>Status</th><th>Notes</th><th>Actions</th></tr></thead><tbody>${repairs
              .map((r) => {
                const c = cars.find((x) => x.id === r.carId);
                return `<tr><td data-label="Car">${esc(c ? c.brand + " " + c.model : "Unknown car")}</td><td data-label="Date">${date(r.date)}</td><td data-label="Repair">${esc(r.type)}</td><td data-label="Cost">${money(r.cost)}</td><td data-label="Status"><span class="badge ${r.status === "Completed" ? "badge-available" : "badge-progress"}">${r.status}</span></td><td data-label="Notes">${esc(r.notes || "")}</td><td data-label="Actions"><button class="btn btn-sm" onclick="App.editRepair('${r.id}')">Edit</button><button class="btn btn-sm btn-danger" onclick="App.deleteRepair('${r.id}')">Delete</button></td></tr>`;
              })
              .join("")}</tbody></table></div>`
          : empty(
              "No repairs recorded",
              "Add a repair when a vehicle enters the workshop.",
            )
      }</div>`,
    );
  }
  function repairForm(id = null) {
    const r = id ? Storage.getRepairs().find((x) => x.id === id) : null,
      cars = Storage.getCars();
    page(
      id ? "Edit Repair" : "Add Repair",
      `<div class="section-head"><div><h2>${id ? "Update repair" : "Record repair"}</h2><p>Record which part was repaired and how much it cost.</p></div></div><form id="repair-form" class="panel"><div class="form-grid"><div class="field"><label>Car *</label><select name="carId" required>${cars.map((c) => `<option value="${c.id}" ${r?.carId === c.id ? "selected" : ""}>${esc(c.brand + " " + c.model)} · ${c.year}</option>`).join("")}</select></div><div class="field"><label>Date *</label><input name="date" type="date" required value="${r?.date || today()}"></div><div class="field"><label>Part / Repair Work *</label><input name="type" required value="${esc(r?.type || "")}" placeholder="e.g. Brake, engine, tire"></div><div class="field"><label>Cost *</label><input name="cost" type="number" min="0" required value="${r?.cost ?? ""}"></div><div class="field"><label>Status</label><select name="status"><option ${!r || r.status === "Completed" ? "selected" : ""}>Completed</option><option ${r?.status === "In Progress" ? "selected" : ""}>In Progress</option></select></div><div class="field full"><label>Notes / یادښت</label><textarea name="notes" placeholder="Short repair note">${esc(r?.notes || "")}</textarea></div></div><div class="form-actions"><button type="button" class="btn" onclick="Navigation.go('repairs')">Cancel</button><button class="btn btn-primary" type="submit">${id ? "Update Repair" : "Save Repair"}</button></div></form>`,
    );
    $("#repair-form").onsubmit = (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target).entries());
      if (!d.carId || !d.date || !d.type.trim() || Number(d.cost) < 0)
        return Toast.show("Please complete the repair fields.", "error");
      const a = Storage.getRepairs(),
        obj = {
          ...(r || {}),
          id: r?.id || uid("repair"),
          carId: d.carId,
          date: d.date,
          type: d.type.trim(),
          cost: Number(d.cost),
          status: d.status,
          notes: d.notes.trim(),
          images: [],
          createdAt: r?.createdAt || new Date().toISOString(),
        };
      if (r) a[a.findIndex((x) => x.id === id)] = obj;
      else a.unshift(obj);
      Storage.saveRepairs(a);
      activity(
        "repair_saved",
        `${obj.type} repair was ${r ? "updated" : "added"}`,
      );
      Toast.show(
        r ? "Repair updated successfully." : "Repair added successfully.",
        "success",
      );
      Navigation.go("repairs");
    };
  }
  function deleteRepair(id) {
    Modal.open({
      title: "Delete Repair",
      message: "Delete this repair record?",
      confirmText: "Delete",
      danger: true,
      onConfirm: () => {
        Storage.saveRepairs(Storage.getRepairs().filter((r) => r.id !== id));
        activity("repair_deleted", "A repair record was deleted");
        Toast.show("Repair deleted successfully.", "success");
        repairsPage();
      },
    });
  }
  function deleteExpense(id) {
    Modal.open({
      title: "Delete Expense",
      message: "Delete this expense record?",
      confirmText: "Delete",
      danger: true,
      onConfirm: () => {
        Storage.saveExpenses(Storage.getExpenses().filter((e) => e.id !== id));
        activity("expense_deleted", "An expense record was deleted");
        Toast.show("Expense deleted successfully.", "success");
        expensesPage();
      },
    });
  }
  function reports() {
    page(
      "Reports",
      `<div class="section-head"><div><h2>Business reports</h2><p>Simple totals only. No Sales vs Expenses or category charts.</p></div><div class="range-buttons"><button class="btn btn-sm active" data-range="month">This Month</button><button class="btn btn-sm" data-range="week">This Week</button><button class="btn btn-sm" data-range="today">Today</button><button class="btn btn-sm" data-range="custom">Custom</button></div></div><div id="custom-range" class="panel" style="display:none"><div class="form-grid"><div class="field"><label>Start Date</label><input id="report-start" type="date"></div><div class="field"><label>End Date</label><input id="report-end" type="date"></div></div><span id="report-error" class="error"></span></div><div id="report-content"></div>`,
    );
    let range = "month";
    const getRange = () => {
      const n = new Date(),
        end = today();
      if (range === "today") return [end, end];
      if (range === "week") {
        const s = new Date(n.getTime() - 6 * 86400000);
        return [s.toISOString().slice(0, 10), end];
      }
      if (range === "month")
        return [
          `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-01`,
          end,
        ];
      const s = $("#report-start").value,
        e = $("#report-end").value;
      if (!s || !e) return null;
      if (s > e) {
        $("#report-error").textContent =
          "Start Date must not be after End Date.";
        return null;
      }
      $("#report-error").textContent = "";
      return [s, e];
    };
    const render = () => {
      const r = getRange();
      if (!r) return;
      const [s, e] = r,
        cars = Storage.getCars(),
        sold = cars.filter(
          (c) =>
            c.status === "Sold" &&
            c.soldAt?.slice(0, 10) >= s &&
            c.soldAt?.slice(0, 10) <= e,
        ),
        ex = Storage.getExpenses().filter((x) => x.date >= s && x.date <= e),
        rep = Storage.getRepairs().filter((x) => x.date >= s && x.date <= e),
        sales = sold.reduce((a, c) => a + Number(c.salePrice || c.price), 0),
        expenses = ex.reduce((a, x) => a + Number(x.amount), 0),
        repairs = rep.reduce((a, x) => a + Number(x.cost), 0),
        net = sales - expenses - repairs;
      $("#report-content").innerHTML =
        `<div class="report-cards"><div class="report-card"><span>Total Sales</span><strong>${money(sales)}</strong></div><div class="report-card"><span>Expenses</span><strong>${money(expenses)}</strong></div><div class="report-card"><span>Repair Costs</span><strong>${money(repairs)}</strong></div><div class="report-card"><span>Profit</span><strong class="kpi-positive">${money(Math.max(0, net))}</strong></div><div class="report-card"><span>Loss</span><strong class="kpi-negative">${money(Math.max(0, -net))}</strong></div><div class="report-card"><span>Cars Sold</span><strong>${sold.length}</strong></div></div><div class="panel"><div class="panel-head"><h3>Period Summary</h3><span>${date(s)} to ${date(e)}</span></div><div class="summary-grid"><div class="summary-item"><span>Cars Sold</span><strong>${sold.length}</strong></div><div class="summary-item"><span>Expenses</span><strong>${money(expenses)}</strong></div><div class="summary-item"><span>Repair Costs</span><strong>${money(repairs)}</strong></div><div class="summary-item"><span>Net Result</span><strong class="${net >= 0 ? "kpi-positive" : "kpi-negative"}">${money(Math.abs(net))}</strong></div></div></div>`;
    };
    document.querySelectorAll("[data-range]").forEach(
      (b) =>
        (b.onclick = () => {
          document
            .querySelectorAll("[data-range]")
            .forEach((x) => x.classList.remove("active"));
          b.classList.add("active");
          range = b.dataset.range;
          $("#custom-range").style.display =
            range === "custom" ? "block" : "none";
          render();
        }),
    );
    $("#report-start").value = today();
    $("#report-end").value = today();
    $("#report-start").oninput = render;
    $("#report-end").oninput = render;
    render();
  }
  function settings() {
    const s = Storage.getSettings();
    page(
      "Settings",
      `<div class="section-head"><div><h2>Showroom settings</h2><p>Update the showroom information and theme.</p></div></div><form id="settings-form" class="panel"><div class="form-grid"><div class="field"><label>Showroom Name</label><input name="showroomName" value="${esc(s.showroomName || "Jan Motor Showroom")}"></div><div class="field"><label>Phone</label><input name="phone" value="${esc(s.phone || "")}"></div><div class="field"><label>Email</label><input name="email" type="email" value="${esc(s.email || "")}"></div><div class="field"><label>Address</label><input name="address" value="${esc(s.address || "")}"></div><div class="field"><label>Theme</label><select name="theme"><option value="light" ${s.theme === "light" ? "selected" : ""}>Light</option><option value="dark" ${s.theme === "dark" ? "selected" : ""}>Dark</option><option value="system" ${s.theme === "system" ? "selected" : ""}>System</option></select></div><div class="field"><label>Admin Name</label><input name="userName" value="${esc(s.userName || "Showroom Admin")}"></div></div><div class="form-actions"><button type="button" class="btn" onclick="Navigation.go('dashboard')">Back</button><button class="btn btn-primary">Save Changes</button></div></form><div class="panel danger-zone"><div class="panel-head"><div><h3>Demo Data</h3><span>Restore original demo records.</span></div><button class="btn btn-danger" id="reset-demo">Reset Demo Data</button></div></div>`,
    );
    $("#settings-form").onsubmit = (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target).entries());
      Storage.saveSettings({ ...s, ...d });
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
  function applyTheme(t) {
    document.documentElement.classList.toggle(
      "dark",
      t === "dark" ||
        (t === "system" && matchMedia("(prefers-color-scheme: dark)").matches),
    );
  }
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
  function showLogin() {
    document.getElementById("app-shell").classList.add("hidden");
    const root = $("#login-screen");
    root.classList.remove("hidden");
    root.innerHTML = `<div class="login-card"><div class="login-logo">JM</div><h1>Jan Motor Showroom</h1><p>Administrator Login</p><form id="login-form"><div class="field"><label>Admin Username</label><input name="username" autocomplete="username" required></div><div class="field"><label>Password</label><input name="password" type="password" autocomplete="current-password" required></div><button class="btn btn-primary login-btn">Login as Admin</button><div class="login-demo">Demo credentials: admin / admin123</div><span id="login-error" class="error"></span></form></div>`;
    $("#login-form").onsubmit = (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target).entries());
      if (d.username === "admin" && d.password === "admin123") {
        Storage.login();
        root.classList.add("hidden");
        $("#app-shell").classList.remove("hidden");
        render();
      } else
        $("#login-error").textContent = "Invalid admin username or password.";
    };
  }
  function openVehicleUpdateModal(id, type) {
    const c = carById(id);
    if (!c) return;
    const labels = {
      delivery: "Delivery information",
      condition: "Vehicle condition",
      finance: "Expenditure / Finance",
    };
    const existing = type === "delivery" ? (c.delivery || {}) : type === "condition" ? (c.condition || {}) : (c.finance || {});
    let body = "";
    if (type === "delivery") {
      body = `<form id="vehicle-update-form" class="form-grid"><div class="field"><label>Deliver Status</label><select name="status"><option ${existing.status !== "Delivered" ? "selected" : ""}>Pending</option><option ${existing.status === "Delivered" ? "selected" : ""}>Delivered</option></select></div><div class="field"><label>Delivery Date</label><input name="date" type="date" value="${esc(existing.date || today())}"></div><div class="field"><label>Delivery Location</label><input name="location" value="${esc(existing.location || "")}"></div><div class="field"><label>Delivered To</label><input name="deliveredTo" value="${esc(existing.deliveredTo || "")}"></div><div class="field full"><label>Notes</label><textarea name="notes">${esc(existing.notes || "")}</textarea></div></form>`;
    } else if (type === "condition") {
      const names = ["Pictured", "CD Player", "TV", "Front Glass", "Remote", "Battery", "Sport Wheel", "Damaged", "Head Rest", "Title Received"];
      body = `<form id="vehicle-update-form" class="form-grid">${names.map(n => `<div class="field"><label>${n}</label><select name="${n}"><option value="No" ${existing[n] !== "Yes" ? "selected" : ""}>No</option><option value="Yes" ${existing[n] === "Yes" ? "selected" : ""}>Yes</option></select></div>`).join("")}</form>`;
    } else {
      const f = existing;
      body = `<form id="vehicle-update-form" class="form-grid">${[["purchaseCost","Purchase Cost"],["recovery","Recovery"],["dubaiToIslamQala","Dubai to Islam Qala Expenses"],["transportation","Transportation"],["customs","Customs"],["repair","Repair"],["maintenance","Maintenance"],["documentation","Documentation"],["otherExpenses","Other Expenses"]].map(([n,l]) => `<div class="field"><label>${l}</label><input name="${n}" type="number" min="0" step="0.01" value="${Number(f[n] || (n === "purchaseCost" ? c.price : 0))}"></div>`).join("")}<div class="field full"><label>Total Expenditure</label><input id="modal-total-expenditure" readonly value="${Number(f.totalExpenditure || 0)}"></div></form>`;
    }
    Modal.open({ title: labels[type], message: body, confirmText: "Save Changes", onConfirm: () => {
      const form = document.getElementById("vehicle-update-form");
      if (!form) return;
      const d = Object.fromEntries(new FormData(form).entries());
      const cars = Storage.getCars();
      const index = cars.findIndex(x => x.id === id);
      if (index < 0) return;
      const updated = { ...cars[index] };
      if (type === "delivery") {
        updated.delivery = { status: d.status, date: d.status === "Delivered" ? d.date : null, location: d.location.trim(), deliveredTo: d.deliveredTo.trim(), notes: d.notes.trim() };
        if (d.status === "Delivered") updated.status = "Delivered";
      } else if (type === "condition") {
        updated.condition = d;
        if (d.Damaged === "Yes") updated.status = "Damaged";
      } else {
        const fields = ["purchaseCost","recovery","dubaiToIslamQala","transportation","customs","repair","maintenance","documentation","otherExpenses"];
        updated.finance = { ...updated.finance, ...Object.fromEntries(fields.map(n => [n, Number(d[n] || 0)])) };
        updated.finance.totalExpenditure = fields.filter(n => n !== "purchaseCost").reduce((sum,n) => sum + Number(updated.finance[n] || 0), 0);
      }
      cars[index] = updated;
      Storage.saveCars(cars);
      Toast.show("Vehicle information updated successfully.", "success");
      viewCar(id);
    }});
  }

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
