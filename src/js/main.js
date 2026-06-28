import "../css/main.css";
import {
  fetchWishes,
  hasSupabaseConfig,
  submitRsvp,
  submitWish,
} from "./api.js";

const weddingEvent = {
  title: "Walimatulurus Zubairah & Syahir",
  location:
    "Alam Maya Kajang, Jalan Sungai Kantan, Taman Melati, Kajang, Selangor, Malaysia",
  details: "Walimatulurus Zubairah & Syahir.",
  timezone: "Asia/Kuala_Lumpur",
  startLocal: "20260808T110000",
  endLocal: "20260808T160000",
};

const weddingCountdownTarget = new Date("2026-08-08T11:00:00+08:00");

const defaultWishes = [
  {
    name: "Keluarga",
    message: "Semoga berbahagia hingga ke Jannah.",
  },
  {
    name: "Sahabat",
    message:
      "Tahniah buat Zubairah dan Syahir. Semoga dipermudahkan segalanya.",
  },
];

let wishAutoScrollFrame = 0;

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("openInvitation")
    ?.addEventListener("click", unveilInvitation);

  document
    .getElementById("musicToggle")
    ?.addEventListener("click", toggleMusic);

  document
    .getElementById("wishForm")
    ?.addEventListener("submit", handleWishSubmit);

  document
    .getElementById("rsvpForm")
    ?.addEventListener("submit", handleRsvpSubmit);

  setupRsvpFieldGuards();

  document
    .getElementById("wishShortcut")
    ?.addEventListener("click", scrollToWishes);

  document.querySelectorAll("[data-sheet-target]").forEach((button) => {
    button.addEventListener("click", () =>
      openSheet(button.dataset.sheetTarget),
    );
  });

  document.querySelectorAll(".sheet-close").forEach((button) => {
    button.addEventListener("click", closeSheets);
  });

  document.querySelectorAll("[data-close-sheet]").forEach((button) => {
    button.addEventListener("click", closeSheets);
  });

  document
    .getElementById("sheetBackdrop")
    ?.addEventListener("click", closeSheets);

  document
    .querySelector(".wish-runner")
    ?.addEventListener(
      "pointerdown",
      () => cancelAnimationFrame(wishAutoScrollFrame),
      { passive: true },
    );

  document
    .querySelector(".wish-runner")
    ?.addEventListener(
      "wheel",
      () => cancelAnimationFrame(wishAutoScrollFrame),
      { passive: true },
    );

  setupCalendarLinks();
  setupCountdown();
  renderWishes();
});

function setupRsvpFieldGuards() {
  const phoneInput = document.getElementById("rsvpPhone");
  const paxInput = document.getElementById("rsvpPax");

  phoneInput?.addEventListener("input", () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 12);
  });

  paxInput?.addEventListener("input", () => {
    paxInput.value = paxInput.value.replace(/\D/g, "").slice(0, 2);
  });
}

function unveilInvitation() {
  const envelope = document.getElementById("envelope-cover");
  const invitationShell = document.getElementById("invitationShell");
  const mainArea = document.getElementById("main-scroll-view");
  const musicBox = document.getElementById("musicToggle");
  const mediaTrack = document.getElementById("bgMusic");
  const footerActions = document.getElementById("footerActions");

  invitationShell?.scrollTo({ top: 0, behavior: "auto" });
  mainArea?.classList.remove("main-body-lock");
  mainArea?.classList.add("main-body-active");
  envelope?.classList.add("door-opening");
  musicBox?.classList.remove("hidden");
  footerActions?.classList.remove("hidden");
  musicBox?.classList.add("music-slide-in");
  footerActions?.classList.add("footer-slide-in");

  mediaTrack
    ?.play()
    .then(() => {
      document.getElementById("musicDisk")?.classList.add("spin-active");
    })
    .catch((err) => {
      console.warn("Music playback needs a user gesture on this device.", err);
    });

  activateScrollWatcher();

  window.setTimeout(() => {
    invitationShell?.classList.remove("invitation-locked");
    invitationShell?.classList.add("invitation-opened");
  }, 1600);

  window.setTimeout(() => {
    envelope?.classList.add("hidden");
  }, 2100);
}

function toggleMusic() {
  const track = document.getElementById("bgMusic");
  const spinningDisk = document.getElementById("musicDisk");

  if (!track || !spinningDisk) return;

  if (track.paused) {
    track.play();
    spinningDisk.classList.add("spin-active");
    spinningDisk.innerHTML = "&#9835;";
  } else {
    track.pause();
    spinningDisk.classList.remove("spin-active");
    spinningDisk.innerHTML = "&#128263;";
  }
}

function activateScrollWatcher() {
  const viewItems = document.querySelectorAll(".reveal-item");

  const configObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((item) => {
        if (item.isIntersecting) {
          item.target.classList.add("show-now");
        }
      });
    },
    { threshold: 0.12 },
  );

  viewItems.forEach((targetObj) => {
    configObserver.observe(targetObj);
  });
}

function openSheet(sheetId) {
  closeSheets();
  document.getElementById("invitationShell")?.classList.add("sheet-is-open");
  document
    .querySelector(`[data-sheet-target="${sheetId}"]`)
    ?.classList.add("is-active");
  const musicToggle = document.getElementById("musicToggle");
  const sheet = document.getElementById(sheetId);

  musicToggle?.classList.add("sheet-floating-top");
  document.getElementById("sheetBackdrop")?.classList.remove("hidden");
  sheet?.classList.remove("hidden");

  if (musicToggle && sheet) {
    const sheetStyles = window.getComputedStyle(sheet);
    const sheetBottom = Number.parseFloat(sheetStyles.bottom) || 0;
    const sheetHeight = sheet.offsetHeight;
    const musicGap = sheetBottom + sheetHeight + 24;

    musicToggle.style.bottom = `${Math.round(musicGap)}px`;
  }
}

function closeSheets() {
  document.getElementById("invitationShell")?.classList.remove("sheet-is-open");
  const musicToggle = document.getElementById("musicToggle");

  musicToggle?.classList.remove("sheet-floating-top");
  if (musicToggle) {
    musicToggle.style.bottom = "";
  }

  document.getElementById("sheetBackdrop")?.classList.add("hidden");
  document.querySelectorAll("[data-sheet-target]").forEach((button) => {
    button.classList.remove("is-active");
  });
  document.querySelectorAll(".action-sheet").forEach((sheet) => {
    sheet.classList.add("hidden");
  });
}

function scrollToWishes() {
  closeSheets();
  document
    .getElementById("wishesSection")
    ?.scrollIntoView({ behavior: "smooth" });
}

function setupCalendarLinks() {
  const googleCalendar = new URL("https://calendar.google.com/calendar/render");
  googleCalendar.searchParams.set("action", "TEMPLATE");
  googleCalendar.searchParams.set("text", weddingEvent.title);
  googleCalendar.searchParams.set(
    "dates",
    `${weddingEvent.startLocal}/${weddingEvent.endLocal}`,
  );
  googleCalendar.searchParams.set("ctz", weddingEvent.timezone);
  googleCalendar.searchParams.set("details", weddingEvent.details);
  googleCalendar.searchParams.set("location", weddingEvent.location);

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding E-card//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-TIMEZONE:${weddingEvent.timezone}`,
    "BEGIN:VEVENT",
    "UID:zubairah-syahir-20260808@wedding-ecard",
    `DTSTAMP:${formatUtcDateForCalendar(new Date())}`,
    `DTSTART;TZID=${weddingEvent.timezone}:${weddingEvent.startLocal}`,
    `DTEND;TZID=${weddingEvent.timezone}:${weddingEvent.endLocal}`,
    `SUMMARY:${escapeCalendarText(weddingEvent.title)}`,
    `DESCRIPTION:${escapeCalendarText(weddingEvent.details)}`,
    `LOCATION:${escapeCalendarText(weddingEvent.location)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeCalendarText(weddingEvent.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  document
    .getElementById("googleCalendarLink")
    ?.setAttribute("href", googleCalendar);
  document
    .getElementById("appleCalendarLink")
    ?.setAttribute(
      "href",
      `data:text/calendar;charset=utf8,${encodeURIComponent(ics)}`,
    );
}

function formatUtcDateForCalendar(date) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function escapeCalendarText(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function setupCountdown() {
  const days = document.getElementById("countdownDays");
  const hours = document.getElementById("countdownHours");
  const minutes = document.getElementById("countdownMinutes");
  const seconds = document.getElementById("countdownSeconds");

  if (!days || !hours || !minutes || !seconds) return;

  function updateCountdown() {
    const remaining = Math.max(
      weddingCountdownTarget.getTime() - Date.now(),
      0,
    );
    const totalSeconds = Math.floor(remaining / 1000);
    const dayValue = Math.floor(totalSeconds / 86400);
    const hourValue = Math.floor((totalSeconds % 86400) / 3600);
    const minuteValue = Math.floor((totalSeconds % 3600) / 60);
    const secondValue = totalSeconds % 60;

    days.textContent = dayValue;
    hours.textContent = String(hourValue).padStart(2, "0");
    minutes.textContent = String(minuteValue).padStart(2, "0");
    seconds.textContent = String(secondValue).padStart(2, "0");
  }

  updateCountdown();
  window.setInterval(updateCountdown, 1000);
}

function getLocalWishes() {
  const savedWishes = window.localStorage.getItem("weddingWishes");
  return savedWishes ? JSON.parse(savedWishes) : defaultWishes;
}

function saveLocalWishes(wishes) {
  window.localStorage.setItem("weddingWishes", JSON.stringify(wishes));
}

async function getWishes() {
  if (!hasSupabaseConfig()) {
    return getLocalWishes();
  }

  const wishes = await fetchWishes();
  return wishes;
}

async function renderWishes() {
  const wishTrack = document.getElementById("wishTrack");
  if (!wishTrack) return;

  let wishes = [];

  try {
    wishes = await getWishes();
  } catch (error) {
    console.warn("Unable to load wishes from Supabase.", error);
    wishes = hasSupabaseConfig() ? [] : getLocalWishes();
  }

  if (!wishes.length) {
    const emptyItem = document.createElement("article");
    const message = document.createElement("p");

    emptyItem.className = "wish-chip";
    message.textContent = '"Jadilah yang pertama mengirim ucapan."';
    emptyItem.append(message);
    wishTrack.replaceChildren(emptyItem);
    return;
  }

  const wishElements = wishes.flatMap((wish, index) => {
    const item = document.createElement("article");
    const message = document.createElement("p");
    const name = document.createElement("strong");

    item.className = "wish-chip";
    message.textContent = `"${wish.message}"`;
    name.textContent = wish.name;

    item.append(message, name);
    if (index === wishes.length - 1) {
      return [item];
    }

    const divider = document.createElement("div");
    divider.className = "ui-divider wish-divider";
    divider.setAttribute("aria-hidden", "true");
    return [item, divider];
  });

  wishTrack.replaceChildren(...wishElements);

  startWishAutoScroll();
}

function startWishAutoScroll() {
  const wishRunner = document.querySelector(".wish-runner");
  if (!wishRunner) return;

  cancelAnimationFrame(wishAutoScrollFrame);
  wishRunner.scrollTop = 0;

  requestAnimationFrame(() => {
    const maxScroll = wishRunner.scrollHeight - wishRunner.clientHeight;
    if (maxScroll <= 0) return;

    const duration = Math.min(Math.max(maxScroll * 45, 9000), 28000);
    const startedAt = performance.now();

    function step(now) {
      const progress = Math.min((now - startedAt) / duration, 1);
      wishRunner.scrollTop = maxScroll * progress;

      if (progress < 1) {
        wishAutoScrollFrame = requestAnimationFrame(step);
      } else {
        wishRunner.scrollTop = maxScroll;
      }
    }

    wishAutoScrollFrame = requestAnimationFrame(step);
  });
}

async function handleWishSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const feedback = document.getElementById("wishStatusFeedback");
  const formData = new FormData(form);
  const wish = {
    name: formData.get("wishName").trim(),
    message: formData.get("wishMessage").trim(),
  };

  if (!wish.name || !wish.message) return;

  if (wish.name.length > 50) {
    showWishValidationError("Nama wajib diisi dan maksimum 50 aksara.");
    return;
  }

  if (wish.message.length > 300) {
    showWishValidationError("Ucapan wajib diisi dan maksimum 300 aksara.");
    return;
  }

  feedback.className = "api-feedback-msg is-pending";
  feedback.textContent = "Sedang menghantar ucapan...";

  try {
    await submitWish(wish);

    if (!hasSupabaseConfig()) {
      const wishes = [wish, ...getLocalWishes()];
      saveLocalWishes(wishes);
    }

    await renderWishes();
    feedback.className = "api-feedback-msg is-success";
    feedback.textContent = "Terima kasih, ucapan anda telah disimpan.";
    form.reset();
  } catch (error) {
    console.warn("Unable to submit wish.", error);
    feedback.className = "api-feedback-msg is-error";
    feedback.textContent =
      "Maaf, ucapan tidak berjaya dihantar. Sila cuba lagi.";
  }
}

function showWishValidationError(message) {
  const feedback = document.getElementById("wishStatusFeedback");

  if (!feedback) return;

  feedback.className = "api-feedback-msg is-error";
  feedback.textContent = message;
}

async function handleRsvpSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const feedback = document.getElementById("rsvpStatusFeedback");
  const formData = new FormData(form);
  const name = formData.get("rsvpName").trim();
  const phone = formData.get("rsvpPhone").trim();
  const paxValue = formData.get("rsvpPax").trim();
  const pax = Number.parseInt(paxValue, 10);
  const rsvp = {
    name,
    phone,
    pax,
  };

  if (rsvp.name.length < 1 || rsvp.name.length > 50) {
    showRsvpValidationError("Nama wajib diisi dan maksimum 50 aksara.");
    return;
  }

  if (!/^\d{1,12}$/.test(rsvp.phone)) {
    showRsvpValidationError(
      "No. telefon hanya boleh nombor sahaja, maksimum 12 digit.",
    );
    return;
  }

  if (!/^\d{1,2}$/.test(paxValue) || !Number.isInteger(pax) || pax < 1) {
    showRsvpValidationError(
      "Jumlah pax mesti nombor positif, maksimum 2 digit.",
    );
    return;
  }

  feedback.className = "api-feedback-msg is-pending";
  feedback.textContent = "Sedang menghantar RSVP...";

  try {
    await submitRsvp(rsvp);

    feedback.className = "api-feedback-msg is-success";
    feedback.textContent = "Terima kasih, RSVP anda telah disimpan.";
    form.reset();
    document.getElementById("rsvpPax").value = "1";
  } catch (error) {
    console.warn("Unable to submit RSVP.", error);
    feedback.className = "api-feedback-msg is-error";
    feedback.textContent = "Maaf, RSVP tidak berjaya dihantar. Sila cuba lagi.";
  }
}

function showRsvpValidationError(message) {
  const feedback = document.getElementById("rsvpStatusFeedback");

  if (!feedback) return;

  feedback.className = "api-feedback-msg is-error";
  feedback.textContent = message;
}
