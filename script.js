// Live time display (Browser time)
function updateTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  document.getElementById("time-display").textContent = timeString;
}

// Get location and continent
async function getLocationAndContinent() {
  try {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      const country = data.address.country || "Unknown";
      const continent = getContinent(data.address.country_code);
      
      const locationDisplay = document.getElementById("location-display");
      locationDisplay.textContent = `${continent} • ${country}`;
    });
  } catch (error) {
    document.getElementById("location-display").textContent = "Location unavailable";
  }
}

// Map country codes to continents
function getContinent(countryCode) {
  const continents = {
    IN: "Asia", JP: "Asia", CN: "Asia", KR: "Asia", TH: "Asia", VN: "Asia",
    PH: "Asia", ID: "Asia", MY: "Asia", SG: "Asia", PK: "Asia", BD: "Asia",
    AF: "Asia", IR: "Asia", IQ: "Asia", SA: "Asia", AE: "Asia", QA: "Asia",
    OM: "Asia", YE: "Asia", LB: "Asia", IL: "Asia", JO: "Asia", SY: "Asia",
    TR: "Asia", KZ: "Asia", UZ: "Asia", TM: "Asia", KG: "Asia", TJ: "Asia",
    MN: "Asia", NP: "Asia", BT: "Asia", LK: "Asia", MM: "Asia", LA: "Asia",
    KH: "Asia", BN: "Asia", TL: "Asia",
    GB: "Europe", FR: "Europe", DE: "Europe", IT: "Europe", ES: "Europe",
    NL: "Europe", BE: "Europe", SE: "Europe", NO: "Europe", CH: "Europe",
    PL: "Europe", RU: "Europe", UA: "Europe", BY: "Europe", CZ: "Europe",
    SK: "Europe", HU: "Europe", RO: "Europe", BG: "Europe", GR: "Europe",
    PT: "Europe", AT: "Europe", DK: "Europe", FI: "Europe", IE: "Europe",
    HR: "Europe", SI: "Europe", ME: "Europe", RS: "Europe", BA: "Europe",
    AL: "Europe", MK: "Europe", LT: "Europe", LV: "Europe", EE: "Europe",
    IS: "Europe", LU: "Europe", MT: "Europe", CY: "Europe", MD: "Europe",
    US: "North America", CA: "North America", MX: "North America",
    BZ: "North America", CR: "North America", SV: "North America",
    GT: "North America", HN: "North America", NI: "North America", PA: "North America",
    BR: "South America", AR: "South America", CL: "South America", CO: "South America",
    PE: "South America", VE: "South America", EC: "South America", BO: "South America",
    PY: "South America", UY: "South America", GY: "South America", SR: "South America",
    ZA: "Africa", EG: "Africa", NG: "Africa", KE: "Africa", ET: "Africa",
    GH: "Africa", MA: "Africa", TN: "Africa", DZ: "Africa", LY: "Africa",
    SD: "Africa", SS: "Africa", UG: "Africa", TZ: "Africa", MW: "Africa",
    ZM: "Africa", ZW: "Africa", BW: "Africa", NA: "Africa", AO: "Africa",
    MZ: "Africa", MG: "Africa", MU: "Africa", SC: "Africa", CI: "Africa",
    SN: "Africa", ML: "Africa", BF: "Africa", NE: "Africa", TD: "Africa",
    CM: "Africa", GA: "Africa", CG: "Africa", CD: "Africa", RW: "Africa",
    BJ: "Africa", TG: "Africa", LR: "Africa", SL: "Africa", GM: "Africa",
    GN: "Africa", GW: "Africa", CV: "Africa", ST: "Africa", DJ: "Africa",
    ER: "Africa", SO: "Africa", KM: "Africa",
    AU: "Oceania", NZ: "Oceania", FJ: "Oceania", PG: "Oceania", VU: "Oceania",
    SB: "Oceania", WS: "Oceania", TO: "Oceania", KI: "Oceania", MH: "Oceania",
    FM: "Oceania", PW: "Oceania", NR: "Oceania", TV: "Oceania"
  };
  return continents[countryCode] || "Unknown";
}

// About Section Tab Functionality
let currentTab = 0;
const tabs = ['tab-about', 'tab-education', 'tab-experience'];
const tabData = {
  'tab-about': { main: 'About_Me', hindi: '/मेरे बारे में' },
  'tab-education': { main: 'Education', hindi: '/शिक्षा' },
  'tab-experience': { main: 'Experience', hindi: '/अनुभव' }
};

function nextTab() {
  currentTab = (currentTab + 1) % tabs.length;
  updateTab();
}

function updateTab() {
  const tabName = tabs[currentTab];
  const contents = document.querySelectorAll('.tab-content');
  contents.forEach(content => content.classList.remove('active'));

  const activeTab = document.getElementById(tabName);
  if (activeTab) activeTab.classList.add('active');

  const titleMain = document.getElementById('title-main');
  const titleHindi = document.getElementById('title-hindi');

  if (titleMain) titleMain.textContent = tabData[tabName].main;
  if (titleHindi) titleHindi.textContent = tabData[tabName].hindi;
}

function showTabByIndex(index) {
  currentTab = index;
  updateTab();
}

// Update time every second
setInterval(updateTime, 1000);
updateTime();

// Get location on load
getLocationAndContinent();

// Loader: wait 8 seconds before showing main content
setTimeout(() => {
  const loader = document.getElementById("loading-screen");
  const content = document.getElementById("main-content");

  loader.style.opacity = "0";
  setTimeout(() => {
    loader.style.display = "none";
    content.classList.add("show");
    document.body.style.overflow = "auto";

    setTimeout(() => {
      updateTab();
    }, 100);
  }, 500);
}, 8000);

// ===== Formspree Form Submission =====
const form = document.querySelector('.contact-form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  fetch(form.action, {
    method: 'POST',
    body: new FormData(form),
    headers: { 'Accept': 'application/json' }
  }).then(response => {
    if (response.ok) {
      document.getElementById('success-message').style.display = 'block';
      form.reset();
    } else {
      alert("Oops! There was a problem submitting your form");
    }
  });
});
