(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";
  var hasST = hasGSAP && typeof window.ScrollTrigger !== "undefined";
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  // =====================================================================
  // PRELOADER (always resolves, GSAP or not)
  // =====================================================================
  var preloader = document.getElementById("preloader");
  function hidePreloader() {
    if (!preloader || preloader.classList.contains("is-hidden")) return;
    preloader.classList.add("is-hidden");
    document.body.style.overflow = "";
  }
  document.body.style.overflow = "hidden";

  window.addEventListener("load", function () {
    setTimeout(hidePreloader, hasGSAP && !reduceMotion ? 650 : 0);
  });
  setTimeout(hidePreloader, 2500); // hard fallback

  // =====================================================================
  // FOOTER YEAR
  // =====================================================================
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // =====================================================================
  // HEADER SCROLL STATE + SCROLL PROGRESS BAR
  // =====================================================================
  var header = document.getElementById("siteHeader");
  var progressBar = document.getElementById("scrollProgress");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 8) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");

    if (progressBar) {
      var h = document.documentElement;
      var scrollable = h.scrollHeight - h.clientHeight;
      var pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      progressBar.style.width = pct + "%";
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // =====================================================================
  // MOBILE NAV
  // =====================================================================
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      mobileNav.classList.toggle("is-open", !open);
      navToggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
        mobileNav.classList.remove("is-open");
      });
    });
  }

  // =====================================================================
  // LEADERSHIP FLIP CARDS (tap-to-flip; :hover already handles desktop via CSS)
  // =====================================================================
  document.querySelectorAll(".flip-card").forEach(function (card) {
    card.addEventListener("click", function (e) {
      if (e.target.closest("[data-no-flip]")) return;
      card.classList.toggle("is-flipped");
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.classList.toggle("is-flipped");
      }
    });
  });

  // =====================================================================
  // SCROLL CUE
  // =====================================================================
  var scrollCue = document.getElementById("scrollCue");
  if (scrollCue) {
    scrollCue.addEventListener("click", function () {
      var target = document.getElementById("services");
      if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
    if (hasGSAP && !reduceMotion) {
      gsap.to(scrollCue, { y: 8, duration: 1.1, ease: "sine.inOut", repeat: -1, yoyo: true });
    }
  }

  // =====================================================================
  // MAGNETIC BUTTONS
  // =====================================================================
  if (hasGSAP && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      var xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "elastic.out(1,0.4)" });
      var yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "elastic.out(1,0.4)" });
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.25);
      });
      el.addEventListener("mouseleave", function () {
        xTo(0);
        yTo(0);
      });
    });
  }

  // =====================================================================
  // AMBIENT FLOATING LOOPS ([data-float] — hero badges)
  // =====================================================================
  if (hasGSAP && !reduceMotion) {
    document.querySelectorAll("[data-float]").forEach(function (el, i) {
      gsap.to(el, {
        y: i % 2 === 0 ? -10 : 10,
        duration: 3 + (i % 3),
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: i * 0.2
      });
    });
  }

  // =====================================================================
  // HERO INTRO — headline split + copy fade + badges drift in
  // =====================================================================
  function splitHeadline(el) {
    var text = el.textContent.trim();
    var wordsArr = text.split(" ");
    el.textContent = "";
    wordsArr.forEach(function (word, i) {
      var wrap = document.createElement("span");
      wrap.className = "word";
      var inner = document.createElement("span");
      inner.textContent = word;
      wrap.appendChild(inner);
      el.appendChild(wrap);
      if (i < wordsArr.length - 1) el.appendChild(document.createTextNode(" "));
    });
    return el.querySelectorAll(".word > span");
  }

  function runHeroIntro() {
    var headlineEl = document.querySelector("[data-split-words]");
    var words = headlineEl ? splitHeadline(headlineEl) : [];
    var fadeEls = document.querySelectorAll(".hero .reveal-fade");
    var badges = document.querySelectorAll(".hero-badge");

    if (!hasGSAP || reduceMotion) {
      words.forEach(function (w) { w.style.transform = "none"; });
      return;
    }

    gsap.set(words, { yPercent: 110 });
    gsap.set(fadeEls, { opacity: 0, y: 14 });
    gsap.set(badges, { opacity: 0, scale: 0.85 });

    var tl = gsap.timeline({ delay: 0.15 });
    tl.to(words, { yPercent: 0, duration: 0.85, ease: "expo.out", stagger: 0.045 })
      .to(fadeEls, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.08 }, "-=0.5")
      .to(badges, { opacity: 1, scale: 1, duration: 0.55, ease: "back.out(1.6)", stagger: 0.15 }, "-=0.4");
  }
  runHeroIntro();

  // =====================================================================
  // GENERIC SCROLL REVEALS
  // =====================================================================
  if (hasST && !reduceMotion) {
    gsap.utils.toArray(".reveal-up").forEach(function (el) {
      gsap.from(el, {
        opacity: 0, y: 24, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });

    var serviceList = document.getElementById("serviceList");
    if (serviceList) {
      gsap.from(serviceList.children, {
        opacity: 0, y: 16, duration: 0.5, ease: "power2.out", stagger: 0.05,
        scrollTrigger: { trigger: serviceList, start: "top 85%" }
      });
    }
  }

  // =====================================================================
  // 3D TILT (gallery cards + hero trust card, pointer-driven)
  // =====================================================================
  function initTilt(el, maxTilt) {
    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(el, { rotateY: px * maxTilt, rotateX: -py * maxTilt, transformPerspective: 900, duration: 0.4, ease: "power2.out" });
    });
    el.addEventListener("mouseleave", function () {
      gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power3.out" });
    });
  }
  if (hasGSAP && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
    var heroTrust = document.getElementById("heroTrust");
    if (heroTrust) initTilt(heroTrust, 6);
  }

  // =====================================================================
  // GALLERY — dynamic (Supabase-backed, static markup as fallback),
  // scroll-driven grayscale-to-color reveal, tilt, swipe counter.
  // Re-runnable: called once on the static fallback markup, then again
  // after a successful Supabase fetch replaces the grid contents.
  // =====================================================================
  var galleryGrid = document.getElementById("galleryGrid");
  var galleryScrollTriggers = [];

  function initGalleryInteractions() {
    galleryScrollTriggers.forEach(function (st) { st.kill(); });
    galleryScrollTriggers = [];

    var items = document.querySelectorAll(".gallery-item");

    function loadAndPlayVideo(item) {
      var video = item.querySelector("video[data-src]");
      if (!video) return;
      video.src = video.dataset.src;
      delete video.dataset.src;
      video.play().catch(function () { /* autoplay blocked — fine, still shows a frame once loaded */ });
    }

    if (hasST && !reduceMotion) {
      items.forEach(function (item, i) {
        galleryScrollTriggers.push(ScrollTrigger.create({
          trigger: item,
          start: "top 85%",
          once: true,
          onEnter: function () {
            gsap.delayedCall(i % 3 * 0.08, function () { item.classList.add("is-revealed"); });
            loadAndPlayVideo(item);
          }
        }));
      });
    } else {
      items.forEach(function (item) { item.classList.add("is-revealed"); loadAndPlayVideo(item); });
    }

    if (hasGSAP && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
      items.forEach(function (el) { initTilt(el, 7); });
    }

    var counterCurrent = document.getElementById("galleryCounterCurrent");
    var counterTotal = document.getElementById("galleryCounterTotal");
    if (galleryGrid && counterCurrent && counterTotal && items.length) {
      var giArr = Array.prototype.slice.call(items);
      counterTotal.textContent = giArr.length < 10 ? "0" + giArr.length : String(giArr.length);
      var updateGalleryCounter = function () {
        var center = galleryGrid.scrollLeft + galleryGrid.clientWidth / 2;
        var closest = 0, min = Infinity;
        giArr.forEach(function (it, i) {
          var mid = it.offsetLeft + it.offsetWidth / 2;
          var d = Math.abs(mid - center);
          if (d < min) { min = d; closest = i; }
        });
        var n = closest + 1;
        counterCurrent.textContent = n < 10 ? "0" + n : String(n);
      };
      if (galleryGrid._counterHandler) galleryGrid.removeEventListener("scroll", galleryGrid._counterHandler);
      galleryGrid._counterHandler = function () { window.requestAnimationFrame(updateGalleryCounter); };
      galleryGrid.addEventListener("scroll", galleryGrid._counterHandler, { passive: true });
      updateGalleryCounter();
    }

    if (hasST) ScrollTrigger.refresh();
  }
  initGalleryInteractions();

  function isVideoPath(path) {
    return /\.(mp4|webm|mov)$/i.test(path || "");
  }

  function renderGalleryItem(row) {
    var fig = document.createElement("figure");
    fig.className = row.span_two ? "gallery-item span-2" : "gallery-item";

    if (isVideoPath(row.image_path)) {
      var video = document.createElement("video");
      video.dataset.src = row.image_path; // lazy: only loaded once scrolled into view
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "none";
      fig.appendChild(video);
      var badge = document.createElement("span");
      badge.className = "gallery-video-badge";
      badge.setAttribute("aria-hidden", "true");
      badge.innerHTML = "<svg viewBox=\"0 0 24 24\"><path d=\"M8 5v14l11-7Z\" fill=\"currentColor\"/></svg>";
      fig.appendChild(badge);
    } else {
      var img = document.createElement("img");
      img.src = row.image_path;
      img.loading = "lazy";
      img.alt = [row.category, row.caption].filter(Boolean).join(" — ") || "Alpha Creations event photo";
      fig.appendChild(img);
    }

    var figcap = document.createElement("figcaption");
    if (row.category) {
      var span = document.createElement("span");
      span.textContent = row.category;
      figcap.appendChild(span);
    }
    figcap.appendChild(document.createTextNode(row.caption || ""));
    fig.appendChild(figcap);
    return fig;
  }

  if (galleryGrid && window.sbClient) {
    window.sbClient.from("gallery").select("*").order("sort_order", { ascending: true })
      .then(function (res) {
        if (res.error || !res.data || !res.data.length) return;
        galleryGrid.innerHTML = "";
        res.data.forEach(function (row) { galleryGrid.appendChild(renderGalleryItem(row)); });
        initGalleryInteractions();
      })
      .catch(function (err) {
        console.error("Gallery could not load from Supabase, showing static fallback.", err);
      });
  }

  // =====================================================================
  // STAT COUNT-UP ([data-count-to] — "years" number in Clients section)
  // =====================================================================
  var countEls = document.querySelectorAll("[data-count-to]");
  if (countEls.length) {
    var runCount = function (el) {
      var target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
      if (!hasGSAP || reduceMotion) {
        el.textContent = String(target);
        return;
      }
      var obj = { val: 0 };
      gsap.to(obj, {
        val: target, duration: 1.4, ease: "power1.out",
        onUpdate: function () { el.textContent = String(Math.round(obj.val)); }
      });
    };
    if (hasST && !reduceMotion) {
      countEls.forEach(function (el) {
        ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: function () { runCount(el); } });
      });
    } else {
      countEls.forEach(runCount);
    }
  }

  // =====================================================================
  // CONTACT FORM -> WHATSAPP
  // =====================================================================
  var form = document.getElementById("contactForm");
  var formNote = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var date = form.date.value.trim();
      var message = form.message.value.trim();

      if (!name || !phone) {
        formNote.textContent = "Please add your name and phone number so we can reply.";
        formNote.style.color = "#e21f26";
        (name ? form.phone : form.name).focus();
        return;
      }

      if (window.sbClient) {
        window.sbClient.from("leads").insert({
          name: name, phone: phone, event_date: date || null, message: message || null, source: "form"
        }).then(function (res) {
          if (res.error) console.error("Lead capture failed", res.error);
        }).catch(function (err) { console.error("Lead capture failed", err); });
      }

      var lines = ["Hi Alpha Creations, I'd like to ask about booking an event.", "Name: " + name, "Phone: " + phone];
      if (date) lines.push("Event date: " + date);
      if (message) lines.push("Details: " + message);

      var text = encodeURIComponent(lines.join("\n"));
      window.open("https://wa.me/923409617476?text=" + text, "_blank", "noopener");
      formNote.textContent = "Opening WhatsApp with your details filled in…";
      formNote.style.color = "";
    });
  }

  // =====================================================================
  // CHATBOT — lightweight FAQ widget, hands off to WhatsApp
  // =====================================================================
  (function () {
    var root = document.getElementById("chatbot");
    if (!root) return;
    var toggle = document.getElementById("chatbotToggle");
    var panel = document.getElementById("chatbotPanel");
    var body = document.getElementById("chatbotBody");
    var quick = document.getElementById("chatbotQuick");
    var chatForm = document.getElementById("chatbotForm");
    var input = document.getElementById("chatbotInput");
    var waNumber = "923409617476";

    var answers = {
      services: "We do wedding &amp; mehndi decor, bridal room styling, dhol &amp; baraat bands, house &amp; venue decoration, outdoor lighting, balloon decor, car decoration, catering, fireworks and full event planning. See the <a href=\"#services\">Services</a> section for details.",
      price: "Pricing depends on your venue, guest count and theme, so every event gets its own design &amp; quote.",
      area: "We cover Islamabad and Rawalpindi.",
      book: "Happy to help you book.",
      location: "Shop No. LG 49, Arrives Tower, near Metro Station, Shamshabad, Islamabad."
    };

    var keywordMap = [
      { re: /service|offer|decor|dhol|catering|firework|light|balloon|bridal|stage/i, key: "services" },
      { re: /price|cost|rate|budget|charge|fee|quote/i, key: "price" },
      { re: /area|city|cover|rawalpindi|islamabad/i, key: "area" },
      { re: /book|hire|avail|reserve|order/i, key: "book" },
      { re: /address|shop|map|direction|located|location|where/i, key: "location" }
    ];

    // Strong buying-intent signals — pricing, booking, or naming an event type.
    // Any of these (outside an active lead flow) opens the name/phone capture.
    var leadIntentRe = /price|cost|rate|budget|charge|fee|quote|book|hire|avail|reserve|wedding|mehndi|birthday|baby shower|engagement|anniversary|walima|nikah|planning|event\b/i;
    var greetingRe = /^\s*(hi|hello|hey|salam|assalam|asalam|aoa)\b/i;
    var thanksRe = /\bthank/i;
    var skipRe = /^\s*(skip|no|no thanks|cancel|never mind|nvm)\s*$/i;

    function addMessage(html, who) {
      var el = document.createElement("div");
      el.className = "chatbot-msg chatbot-msg-" + who;
      el.innerHTML = html;
      body.appendChild(el);
      body.scrollTop = body.scrollHeight;
    }

    function escapeHtml(s) {
      return s.replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
      });
    }

    function waLink(text) {
      return "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(text);
    }

    // =====================================================================
    // LEAD-CAPTURE FLOW — name -> phone -> event details -> save
    // =====================================================================
    var flow = { state: "idle", name: null, phone: null };

    function saveLead(details) {
      if (!window.sbClient) return;
      window.sbClient.from("leads").insert({
        name: flow.name, phone: flow.phone, message: details || null, source: "chatbot"
      }).then(function (res) {
        if (res.error) console.error("Lead capture failed", res.error);
      }).catch(function (err) { console.error("Lead capture failed", err); });
    }

    function startLeadFlow() {
      if (flow.state !== "idle") return;
      flow.state = "awaiting_name";
      addMessage("Happy to help. What's your name?", "bot");
    }

    function handleLeadStep(userText) {
      if (skipRe.test(userText)) {
        flow.state = "idle";
        addMessage("No problem — ask me anything else, or reach us directly on WhatsApp any time.", "bot");
        return true;
      }

      if (flow.state === "awaiting_name") {
        flow.name = userText.slice(0, 80);
        flow.state = "awaiting_phone";
        addMessage("Thanks, " + escapeHtml(flow.name) + "! And a phone number to reach you on?", "bot");
        return true;
      }

      if (flow.state === "awaiting_phone") {
        var digits = userText.replace(/\D/g, "");
        if (digits.length < 7) {
          addMessage("That doesn't look like a full phone number — could you send it again?", "bot");
          return true;
        }
        flow.phone = userText.slice(0, 30);
        flow.state = "awaiting_details";
        addMessage("Got it. Anything about your event I should pass along — occasion, date, guest count? (or type \"skip\")", "bot");
        return true;
      }

      if (flow.state === "awaiting_details") {
        var details = skipRe.test(userText) ? null : userText.slice(0, 500);
        saveLead(details);
        addMessage(
          "Thanks " + escapeHtml(flow.name) + " — we've noted your details and someone from our team will reach out soon. " +
          "You can also message us right now: <a href=\"" + waLink("Hi Alpha Creations, I'm " + flow.name + " (" + flow.phone + "). " + (details || "")) +
          "\" target=\"_blank\" rel=\"noopener\">Open WhatsApp</a>.",
          "bot"
        );
        flow.state = "idle";
        return true;
      }

      return false;
    }

    function respond(userText) {
      if (flow.state !== "idle") {
        handleLeadStep(userText);
        return;
      }

      if (greetingRe.test(userText)) {
        addMessage("Hi! Ask about our services, pricing, or say you'd like to book and I'll take your details.", "bot");
        return;
      }
      if (thanksRe.test(userText)) {
        addMessage("You're welcome! Anything else I can help with?", "bot");
        return;
      }

      var match = null;
      for (var i = 0; i < keywordMap.length; i++) {
        if (keywordMap[i].re.test(userText)) { match = keywordMap[i].key; break; }
      }

      if (leadIntentRe.test(userText)) {
        if (match) addMessage(answers[match], "bot");
        startLeadFlow();
        return;
      }

      if (match) {
        addMessage(answers[match], "bot");
      } else {
        if (window.sbClient) {
          window.sbClient.from("leads").insert({
            message: userText, source: "chatbot"
          }).then(function (res) {
            if (res.error) console.error("Lead capture failed", res.error);
          }).catch(function (err) { console.error("Lead capture failed", err); });
        }
        addMessage(
          "I'm not sure about that one, but our team can answer directly. " +
          "<a href=\"" + waLink("Hi Alpha Creations, I have a question: " + userText) + "\" target=\"_blank\" rel=\"noopener\">Ask on WhatsApp</a>. " +
          "Or tell me you'd like to book and I'll take your details.",
          "bot"
        );
      }
    }

    function openChat() {
      root.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      panel.setAttribute("aria-hidden", "false");
      input.focus();
    }
    function closeChat() {
      root.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      panel.setAttribute("aria-hidden", "true");
    }

    toggle.addEventListener("click", function () {
      if (root.classList.contains("is-open")) closeChat(); else openChat();
    });

    quick.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-q]");
      if (!btn) return;
      var key = btn.getAttribute("data-q");
      addMessage(escapeHtml(btn.textContent), "user");
      addMessage(answers[key], "bot");
      if (key === "price" || key === "book") startLeadFlow();
    });

    chatForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = input.value.trim();
      if (!val) return;
      addMessage(escapeHtml(val), "user");
      respond(val);
      input.value = "";
    });

    document.addEventListener("click", function (e) {
      if (root.classList.contains("is-open") && !root.contains(e.target)) closeChat();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("is-open")) closeChat();
    });
  })();

  if (hasST) {
    ScrollTrigger.refresh();
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }
})();
