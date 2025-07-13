const API_BASE_URL = "http://localhost:3001/api";
let lastUsedParams = new URLSearchParams();

const loginView = document.getElementById("login-view");
const dashboardView = document.getElementById("dashboard-view");
const loginForm = document.getElementById("login-form");
const logoutButton = document.getElementById("logout-button");
const tabCoupons = document.getElementById("tab-coupons");
const tabUpload = document.getElementById("tab-upload");
const tabContentCoupons = document.getElementById("tab-content-coupons");
const tabContentUpload = document.getElementById("tab-content-upload");
const filterForm = document.getElementById("filter-form");
const clearFiltersBtn = document.getElementById("clear-filters-btn");
const applyFiltersBtn = document.getElementById("apply-filters-btn");
const couponsDisplay = document.getElementById("coupons-display");
const couponSummary = document.getElementById("coupon-summary");
const uploadForm = document.getElementById("upload-form");
const menuFileInput = document.getElementById("menuFile");
const previewDisplay = document.getElementById("preview-display");
const finalUploadBtn = document.getElementById("final-upload-btn");
const currentMenuDisplay = document.getElementById("current-menu-display");

const statusContainer = document.getElementById("status-message-container");

const showView = (view) => {
  loginView.classList.toggle("hidden", view !== "login");
  dashboardView.classList.toggle("hidden", view !== "dashboard");
};

const setActiveTab = (tabName) => {
  const tabs = { coupons: tabCoupons, upload: tabUpload };
  const contents = {
    coupons: tabContentCoupons,
    upload: tabContentUpload,
  };
  Object.values(tabs).forEach((tab) => tab.classList.remove("active"));
  Object.values(contents).forEach((content) => content.classList.add("hidden"));
  tabs[tabName].classList.add("active");
  contents[tabName].classList.remove("hidden");
  if (tabName === "upload") {
    fetchCurrentMenu();
  }
};

const displayStatus = (message, isError = false) => {
  const bgColor = isError ? "bg-red-500" : "bg-green-500";
  const statusDiv = document.createElement("div");
  statusDiv.className = `p-4 rounded-md text-white ${bgColor} mb-2 transition-all duration-300 transform translate-x-full`;
  statusDiv.textContent = message;
  statusContainer.appendChild(statusDiv);
  setTimeout(() => statusDiv.classList.remove("translate-x-full"), 10);
  setTimeout(() => {
    statusDiv.classList.add("opacity-0");
    statusDiv.addEventListener("transitionend", () => statusDiv.remove());
  }, 4000);
};

const setMealFilterByTime = () => {
  const mealTypeFilter = document.getElementById("meal-type-filter");
  const currentHour = new Date().getHours();
  if (currentHour >= 6 && currentHour < 12) mealTypeFilter.value = "Breakfast";
  else if (currentHour >= 12 && currentHour < 17)
    mealTypeFilter.value = "Lunch";
  else mealTypeFilter.value = "Dinner";
};

const handleLogin = async (event) => {
  event.preventDefault();
  const username = loginForm.username.value;
  const password = loginForm.password.value;
  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Login failed");
    localStorage.setItem("authToken", data.token);
    await checkLoginStatus();
  } catch (error) {
    displayStatus(error.message, true);
  }
};

const handleLogout = () => {
  localStorage.removeItem("authToken");
  showView("login");
  loginForm.reset();
};

const handleFinalUpload = async () => {
  if (!menuFileInput.files.length) {
    displayStatus("Please select a file to upload.", true);
    return;
  }
  const formData = new FormData();
  formData.append("menuFile", menuFileInput.files[0]);
  const token = localStorage.getItem("authToken");
  try {
    finalUploadBtn.disabled = true;
    finalUploadBtn.textContent = "Uploading...";
    const response = await fetch(`${API_BASE_URL}/admin/menu/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Upload failed");
    displayStatus(data.message);
    uploadForm.reset();
    previewDisplay.innerHTML =
      '<p class="text-gray-500 text-center p-4">Select a file to see the menu data.</p>';
    fetchCurrentMenu();
  } catch (error) {
    displayStatus(error.message, true);
  } finally {
    finalUploadBtn.disabled = true;
    finalUploadBtn.textContent = "3. Confirm & Upload";
  }
};

const fetchCoupons = async (params) => {
  lastUsedParams = params;
  const token = localStorage.getItem("authToken");
  couponsDisplay.innerHTML =
    '<p class="text-gray-500 text-center p-4">Loading coupons...</p>';
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/coupons/all?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to fetch coupons");
    renderCoupons(data.coupons);
  } catch (error) {
    displayStatus(error.message, true);
    couponsDisplay.innerHTML = `<p class="text-red-500 text-center p-4">${error.message}</p>`;
  }
};

const fetchTodaysSummary = async () => {
  const token = localStorage.getItem("authToken");
  try {
    const response = await fetch(`${API_BASE_URL}/admin/coupons/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    renderSummary(data.summary, data.upcomingMeal);
  } catch (error) {
    console.error("Failed to fetch today's summary:", error);
  }
};

const fetchCurrentMenu = async () => {
  const token = localStorage.getItem("authToken");
  currentMenuDisplay.innerHTML =
    '<p class="text-gray-500 text-center p-4">Loading current menu...</p>';
  try {
    const response = await fetch(`${API_BASE_URL}/admin/menu/current`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to fetch current menu");
    renderMenuAsTable(data.menu, currentMenuDisplay);
  } catch (error) {
    displayStatus(error.message, true);
    currentMenuDisplay.innerHTML = `<p class="text-red-500 text-center p-4">${error.message}</p>`;
  }
};

const handleFilterSearch = (event) => {
  event.preventDefault();
  const params = new URLSearchParams();
  const search = document.getElementById("search-input").value;
  const mealType = document.getElementById("meal-type-filter").value;
  const status = document.getElementById("status-filter").value;
  const date = document.getElementById("date-filter").value;
  if (search) params.append("search", search);
  if (mealType) params.append("meal_type", mealType);
  if (status) params.append("status", status);
  if (date) params.append("date", date);
  fetchCoupons(params);
};

const handleMarkAsUsed = async (couponId) => {
  const token = localStorage.getItem("authToken");
  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/coupons/mark-used/${couponId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    displayStatus(data.message);
    fetchCoupons(lastUsedParams);
    fetchTodaysSummary();
  } catch (error) {
    displayStatus(error.message, true);
  }
};

const renderSummary = (summary, upcomingMeal) => {
  const meals = [
    { type: "Breakfast", color: "blue" },
    { type: "Lunch", color: "green" },
    { type: "Dinner", color: "orange" },
  ];

  couponSummary.innerHTML = meals
    .map((meal) => {
      const isUpcoming = upcomingMeal === meal.type;
      const bgColor = isUpcoming
        ? `bg-${meal.color}-100 border-4 border-${meal.color}-500 shadow-lg`
        : `bg-${meal.color}-50 border border-${meal.color}-200`;
      const textColor = `text-${meal.color}-900`;
      const titleColor = `text-${meal.color}-800`;
      return `
        <div class="p-4 rounded-lg ${bgColor} m-2 flex-1 transition-all duration-300">
          <div class="flex items-center mb-2 justify-between">
        <p class="text-sm ${titleColor} font-medium">${meal.type} Coupons</p>
        ${
          isUpcoming
            ? `<span class="ml-2 px-2 py-1 rounded bg-${meal.color}-500 text-white text-xs font-semibold">Upcoming</span>`
            : ""
        }
          </div>
          <div class="border-t border-gray-300 my-3"></div>
          <p class="text-xs ${titleColor} font-medium">Active / Used</p>
          <p class="text-3xl font-bold ${textColor}">${
        summary[meal.type].Active || 0
      } <span class="text-base font-normal text-gray-500">/</span> ${
        summary[meal.type].Used || 0
      }</p>
        </div>
      `;
    })
    .join("");
};

const renderCoupons = (coupons) => {
  if (!coupons || coupons.length === 0) {
    couponsDisplay.innerHTML =
      '<p class="text-gray-500 text-center p-4">No coupons found.</p>';
    return;
  }
  const table = `
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-100"><tr>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Meal</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr></thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${coupons
                          .map(
                            (c) => `<tr>
                            <td class="px-4 py-2 text-sm font-medium text-gray-900">${
                              c.id
                            }</td>
                            <td class="px-4 py-2 text-sm text-gray-500">${
                              c.customer_name
                            } (${c.customer_phone})</td>
                            <td class="px-4 py-2 text-sm text-gray-500">${new Date(
                              c.meal_date
                            ).toLocaleDateString()}</td>
                            <td class="px-4 py-2 text-sm text-gray-500">${
                              c.meal_type
                            }</td>
                            <td class="px-4 py-2 text-sm font-semibold ${
                              c.status === "Active"
                                ? "text-green-600"
                                : "text-gray-500"
                            }">${c.status}</td>
                            <td class="px-4 py-2 text-sm">
                                ${
                                  c.status === "Active"
                                    ? `<button onclick="handleMarkAsUsed('${c.id}')" class="font-medium text-indigo-600 hover:text-indigo-800">Mark Used</button>`
                                    : `<span class="text-gray-400">-</span>`
                                }
                            </td>
                        </tr>`
                          )
                          .join("")}
                    </tbody>
                </table>`;
  couponsDisplay.innerHTML = table;
};

const renderMenuAsTable = (menuItems, targetElement) => {
  if (!menuItems || menuItems.length === 0) {
    targetElement.innerHTML =
      '<p class="text-gray-500 text-center p-4">No menu items to display.</p>';
    return;
  }
  const groupedByDay = menuItems.reduce((acc, item) => {
    (acc[item.day_of_week] = acc[item.day_of_week] || []).push(item);
    return acc;
  }, {});
  const daysOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const tableRows = daysOrder
    .map((day) => {
      const dayItems = groupedByDay[day] || [];
      const breakfast = dayItems.find((i) => i.meal_type === "Breakfast");
      const lunch = dayItems.find((i) => i.meal_type === "Lunch");
      const dinner = dayItems.find((i) => i.meal_type === "Dinner");
      return {
        DayOfWeek: day,
        BreakfastItem: breakfast ? breakfast.description : "",
        BreakfastPrice: breakfast ? breakfast.price : "",
        LunchItem: lunch ? lunch.description : "",
        LunchPrice: lunch ? lunch.price : "",
        DinnerItem: dinner ? dinner.description : "",
        DinnerPrice: dinner ? dinner.price : "",
      };
    })
    .filter((row) => groupedByDay[row.DayOfWeek]);

  if (tableRows.length === 0) {
    targetElement.innerHTML =
      '<p class="text-gray-500 text-center p-4">No active menu found.</p>';
    return;
  }

  const headers = [
    "Day",
    "Breakfast",
    "Price",
    "Lunch",
    "Price",
    "Dinner",
    "Price",
  ];
  const headerKeys = [
    "DayOfWeek",
    "BreakfastItem",
    "BreakfastPrice",
    "LunchItem",
    "LunchPrice",
    "DinnerItem",
    "DinnerPrice",
  ];
  let html = '<table class="min-w-full divide-y divide-gray-200 text-xs">';
  html += '<thead class="bg-gray-100"><tr>';
  headers.forEach(
    (h) =>
      (html += `<th class="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">${h}</th>`)
  );
  html += "</tr></thead>";
  html += '<tbody class="bg-white divide-y divide-gray-200">';
  tableRows.forEach((row) => {
    html += "<tr>";
    headerKeys.forEach((key) => {
      const value = row[key];
      const isDay = key === "DayOfWeek";
      html += `<td class="px-2 py-2 whitespace-normal ${
        isDay ? "font-semibold text-gray-900" : "text-gray-600"
      }">${value || ""}</td>`;
    });
    html += "</tr>";
  });
  html += "</tbody></table>";
  targetElement.innerHTML = html;
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (!file) {
    previewDisplay.innerHTML =
      '<p class="text-gray-500 text-center p-4">Select a file to see the menu data.</p>';
    finalUploadBtn.disabled = true;
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        throw new Error("The file is empty or has no data rows.");
      }

      const menuToPreview = [];
      const mealKeys = {
        Breakfast: {
          item: "BreakfastItem",
          price: "BreakfastPrice",
        },
        Lunch: { item: "LunchItem", price: "LunchPrice" },
        Dinner: {
          item: "DinnerItem",
          price: "DinnerPrice",
        },
      };
      for (const row of jsonData) {
        const day = row.DayOfWeek;
        if (!day) continue;
        for (const mealType in mealKeys) {
          const description = row[mealKeys[mealType].item];
          const price = row[mealKeys[mealType].price];
          if (description && String(description).trim() !== "" && price) {
            menuToPreview.push({
              day_of_week: day,
              meal_type: mealType,
              description: String(description).trim(),
              price: parseFloat(price),
            });
          }
        }
      }

      if (menuToPreview.length === 0) {
        throw new Error(
          "No valid menu items found in the file. Check your headers and data."
        );
      }

      renderMenuAsTable(menuToPreview, previewDisplay);
      finalUploadBtn.disabled = false;
    } catch (error) {
      console.log(error);
      previewDisplay.innerHTML = `<p class="text-red-500 text-center p-4">${error.message}</p>`;
      finalUploadBtn.disabled = true;
    }
  };
  reader.readAsArrayBuffer(file);
};

const checkLoginStatus = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    showView("login");
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/admin/verify-token`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      showView("dashboard");
      setActiveTab("coupons");
      await fetchTodaysSummary();
      document.getElementById("date-filter").value = new Date()
        .toISOString()
        .slice(0, 10);
      setMealFilterByTime();
      applyFiltersBtn.click();
    } else {
      handleLogout();
    }
  } catch (error) {
    handleLogout();
  }
};

loginForm.addEventListener("submit", handleLogin);
logoutButton.addEventListener("click", handleLogout);
filterForm.addEventListener("submit", handleFilterSearch);
clearFiltersBtn.addEventListener("click", () => {
  filterForm.reset();
  fetchCoupons(new URLSearchParams());
});
tabCoupons.addEventListener("click", () => setActiveTab("coupons"));
tabUpload.addEventListener("click", () => setActiveTab("upload"));
menuFileInput.addEventListener("change", handleFileSelect);
finalUploadBtn.addEventListener("click", handleFinalUpload);
document.addEventListener("DOMContentLoaded", checkLoginStatus);
