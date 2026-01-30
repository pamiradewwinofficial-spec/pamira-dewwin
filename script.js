/* =========================================================
   Live Wallpaper Interaction & Page Behaviors
   - Desktop-only cursor glow & color distortion
   - Parallax on gradient layers
   - Throttled mouse handling with requestAnimationFrame
   - Fade-in on scroll
   - Gallery upload preview
   - Contact form validation + success message
   - Mobile optimization: reduce heavy effects
   ========================================================= */

// Utility: detect touch/mobile
const isTouchDevice = matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;

// Elements
const wallpaper = document.querySelector(".wallpaper");
const layers = document.querySelectorAll(".gradient-layer");
const cursorGlow = document.querySelector(".cursor-glow");

// Cursor state
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let rafId = null;
let needsUpdate = false;

// Parallax strength per layer
const parallaxStrength = [0.02, 0.04, 0.06]; // subtle

// Desktop-only interaction
if (!isTouchDevice) {
  cursorGlow.style.opacity = "1";

  // Throttled mousemove using rAF
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    needsUpdate = true;
    if (!rafId) rafId = requestAnimationFrame(updateCursorEffects);
  });

  // On leave, fade glow
  window.addEventListener("mouseleave", () => {
    cursorGlow.style.opacity = "0";
  });
  window.addEventListener("mouseenter", () => {
    cursorGlow.style.opacity = "1";
  });
} else {
  // Disable heavy effects on touch devices
  cursorGlow.style.opacity = "0";
  layers.forEach((layer) => {
    layer.style.filter = "blur(28px) saturate(110%)"; // slightly lighter
  });
}

/**
 * Update cursor glow position and parallax transforms.
 * Also brightens nearby colors by moving the glow.
 */
function updateCursorEffects() {
  rafId = null;

  if (!needsUpdate) return;
  needsUpdate = false;

  // Position cursor glow
  cursorGlow.style.left = `${mouseX}px`;
  cursorGlow.style.top = `${mouseY}px`;

  // Parallax transforms based on mouse position
  const cx = (mouseX / window.innerWidth - 0.5) * 2;  // -1 to 1
  const cy = (mouseY / window.innerHeight - 0.5) * 2; // -1 to 1

  layers.forEach((layer, i) => {
    const strength = parallaxStrength[i];
    const tx = -cx * 20 * strength; // translate in px
    const ty = -cy * 20 * strength;
    layer.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
  });
}

/* =========================================================
   Fade-in on scroll using IntersectionObserver
   ========================================================= */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));

/* =========================================================
   Gallery: image upload + live preview
   ========================================================= */
const imageInput = document.getElementById("imageUpload");
const galleryGrid = document.getElementById("galleryGrid");

if (imageInput) {
  imageInput.addEventListener("change", () => {
    const files = Array.from(imageInput.files || []);
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target.result;
        const item = document.createElement("div");
        item.className = "gallery-item";
        const img = document.createElement("img");
        img.src = url;
        img.alt = "Uploaded image preview";
        item.appendChild(img);
        galleryGrid.prepend(item);
      };
      reader.readAsDataURL(file);
    });
    imageInput.value = "";
  });
}

/* =========================================================
   Contact form: validation + EmailJS sending
   ========================================================= */
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
      setStatus("Please fill all fields.", "error");
      return;
    }

    if (!isValidEmail(email)) {
      setStatus("Invalid email address.", "error");
      return;
    }

    // Send email via EmailJS
    emailjs.send("service_mi088d6", "template_gxgyu7c", {
      name,
      email,
      message,
    })
    .then(() => {
      setStatus("Message sent successfully!", "success");
      contactForm.reset();
    })
    .catch((error) => {
      setStatus("Failed to send. Check console for error.", "error");
      console.error("EmailJS error:", error);
    });
  });
}

function setStatus(text, type) {
  formStatus.textContent = text;
  formStatus.className = `form-status ${type}`;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/* =========================================================
   Performance: reduce animations on mobile/low-power
   ========================================================= */
function reduceMotionIfPreferred() {
  const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion || isTouchDevice) {
    document.querySelectorAll(".gradient-layer").forEach((layer) => {
      layer.style.animationDuration = "0s";
      layer.style.animationPlayState = "paused";
    });
    cursorGlow.style.opacity = "0";
  }
}
reduceMotionIfPreferred();

/* =========================================================
   Resize handling: keep glow centered on resize
   ========================================================= */
window.addEventListener("resize", () => {
  needsUpdate = true;
  if (!rafId) rafId = requestAnimationFrame(updateCursorEffects);
});
console.log("Script is loaded"); // <- must show in console

document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("Submit clicked"); // <- must show in console
});

