/* Open Growth — interactions, bilingual EN/AR, lightweight tracking */
(function () {
  "use strict";

  /* ---------- Analytics hook: pushes to GTM dataLayer if present ---------- */
  window.dataLayer = window.dataLayer || [];
  function track(event, data) {
    window.dataLayer.push(Object.assign({ event: event }, data || {}));
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-track]");
    if (el) track("cta_click", { cta_id: el.dataset.track, lang: document.documentElement.lang });
  });

  /* ---------- Nav: scrolled state + mobile menu ---------- */
  var nav = document.querySelector(".nav");
  var onScroll = function () { nav.classList.toggle("is-scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var burger = document.getElementById("burger");
  var menu = document.getElementById("mobileMenu");
  function setMenu(open) {
    burger.setAttribute("aria-expanded", String(open));
    menu.hidden = !open;
  }
  burger.addEventListener("click", function () { setMenu(menu.hidden); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });

  /* ---------- Scroll reveal with per-group stagger ---------- */
  var reveals = document.querySelectorAll(".reveal");
  reveals.forEach(function (el) {
    var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains("reveal"); });
    el.style.transitionDelay = Math.min(siblings.indexOf(el), 5) * 70 + "ms";
  });

  /* ---------- Counters: final values are already in the HTML; animate from 0 when seen ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function runCounter(el) {
    var to = parseFloat(el.dataset.to);
    var dec = parseInt(el.dataset.dec || "0", 10);
    var start = null, dur = 1400;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * eased).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        if (!reduceMotion) entry.target.querySelectorAll(".count").forEach(runCounter);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Theme: dark by default, follows the OS until the visitor picks one ---------- */
  var themeBtn = document.getElementById("themeToggle");
  var lightQuery = window.matchMedia("(prefers-color-scheme: light)");
  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") || (lightQuery.matches ? "light" : "dark");
  }
  function syncTheme() {
    var light = currentTheme() === "light";
    themeBtn.classList.toggle("is-light", light);
    themeBtn.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = light ? "#fafafa" : "#090909";
  }
  themeBtn.addEventListener("click", function () {
    var next = currentTheme() === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    syncTheme();
    track("theme_switch", { theme: next });
  });
  if (lightQuery.addEventListener) lightQuery.addEventListener("change", syncTheme);
  syncTheme();

  /* ---------- Bilingual: English lives in the HTML, Arabic here ---------- */
  var AR = {
    "skip": "تخطَّ إلى المحتوى",
    "nav.work": "أعمالنا", "nav.services": "خدماتنا", "nav.process": "طريقة العمل",
    "nav.pricing": "الأسعار", "nav.faq": "الأسئلة الشائعة", "nav.cta": "تدقيق مجاني",

    "hero.eyebrow": "استوديو تصميم مواقع ونمو · دبي، الإمارات",
    "hero.h1": "مواقع تجلب لك العملاء.",
    "hero.sub": "نصمّم ونطوّر مواقع سريعة وثنائية اللغة للعلامات الطموحة في دبي والإمارات ودول الخليج. نقيس نجاح عملنا بعدد العملاء المحتملين والإيرادات، لا بالإعجابات.",
    "hero.cta1": "احصل على تدقيق مجاني لموقعك",
    "hero.cta2": "تواصل عبر واتساب",
    "mock.label": "العملاء المحتملون المؤهَّلون · آخر 90 يومًا",
    "mock.delta": "مقارنةً بالموقع السابق",
    "mock.k1": "سرعة التحميل", "mock.k2": "معدل التحويل", "mock.k3": "ثنائي اللغة",
    "stats.1": "موقعًا تم إطلاقه", "stats.2": "متوسط زيادة العملاء المحتملين",
    "stats.3": "سنوات في الإمارات", "stats.4": "متوسط التحميل على الجوال",

    "work.eyebrow": "أعمال مختارة",
    "work.h2": "لكل مشروع رقمٌ يثبت نتيجته.",
    "case1.metric": "زيادة في الاستفسارات خلال 6 أشهر",
    "case1.tag": "عقارات · دبي",
    "case1.body": "موقع عقاري جديد ثنائي اللغة مع صفحات هبوط لمشاريع على الخارطة، وتوجيه العملاء عبر واتساب وربط مع نظام CRM. انخفضت تكلفة العميل المحتمل من 410 إلى 96 درهمًا.",
    "case.cta": "احصل على نتائج مماثلة ←",
    "sq.cta": "احصل على موقع مماثل",
    "sq.note": "هذه تصاميم مفاهيمية وليست مشاريع لعملاء.",
    "sq1.t": "فورما ستوديو يمنح الأعمال مساحة لتتحدث عن نفسها.",
    "sq1.d": "منزل رقمي مدروس لاستوديو تصميم داخلي، مع نموذج بسيط لوصف المشروع يحوّل الاهتمام إلى محادثة.",
    "sq2.t": "عيادة إيفرويل تجعل حجز الموعد تجربة هادئة.",
    "sq2.d": "علاجات واضحة وممارسون موثوقون ومسار حجز يعمل بالعربية والإنجليزية على أي هاتف.",
    "sq3.t": "هيفن العقارية تحوّل التصفح إلى زيارات للعقار.",
    "sq3.d": "قوائم عقارات سريعة، وأدلة للمناطق يقرؤها المشترون فعلًا، واستفسارات واتساب تصل إلى الوكيل المناسب.",
    "sq4.t": "وايبوينت للخدمات اللوجستية تجيب عن أسئلة المشتري أولًا.",
    "sq4.d": "صفحات جاهزة للبحث لكل مسار شحن، وطلب عرض سعر يجمع ما يحتاجه فريق المبيعات.",
    "sq5.t": "نورث أدفايزري تكسب الثقة قبل أول مكالمة.",
    "sq5.d": "خبرة رفيعة تُعرض ببساطة، ومقالات تتصدّر نتائج البحث، وطلب استشارة من ثلاثة حقول.",
    "case2.metric": "زيادة في الحجوزات الإلكترونية",
    "case2.tag": "الرعاية الصحية · أبوظبي",
    "case2.body": "مسار حجز بالعربية أولًا وصفحات تعريفية للأطباء. انخفض زمن التحميل على الجوال من 6.1 إلى 1.2 ثانية.",
    "case3.metric": "الترتيب الأول في Google لـ 14 كلمة رئيسية",
    "case3.tag": "قطاع الأعمال · جبل علي",
    "case3.body": "أعدنا بناء صفحات الخدمات وفق نية البحث في الإمارات والسعودية. ارتفعت الزيارات العضوية بنسبة 190%.",
    "case4.metric": "زيادة في إيرادات المتجر الإلكتروني",
    "case4.tag": "تجزئة · الخليج",
    "case4.body": "واجهة Shopify أسرع، ومنطق شحن يغطي دول الخليج، وصفحة دفع تحوّل 4.8% من الزوار.",

    "svc.eyebrow": "ماذا نقدّم",
    "svc.h2": "فريق واحد للتصميم والتطوير والنمو.",
    "svc1.h": "تصميم وتطوير المواقع",
    "svc1.p": "مواقع تركّز على التحويل عبر Webflow أو Framer أو WordPress أو برمجة مخصصة، مصمّمة للجوال أولًا وتحقق أكثر من 90 في PageSpeed.",
    "svc2.h": "تجربة عربية وثنائية اللغة",
    "svc2.p": "تخطيطات صحيحة من اليمين إلى اليسار، ومحتوى وخطوط عربية أصيلة. لا نكتفي بترجمة الصفحة الإنجليزية.",
    "svc3.h": "تحسين محركات البحث والمحتوى",
    "svc3.p": "تحسين تقني، وبحث محلي في الإمارات والخليج، ومحتوى يتصدّر النتائج باللغتين.",
    "svc4.h": "تحسين التحويل والتحليلات",
    "svc4.p": "GA4، وتتبّع المكالمات وواتساب، وخرائط حرارية واختبارات A/B. ستعرف قيمة كل زيارة.",

    "audit.eyebrow": "مجاني · دون أي التزام · خلال 48 ساعة",
    "audit.h2": "احصل على تدقيق مجاني لموقعك وفرص نموه.",
    "audit.p": "يراجع خبراؤنا موقعك الحالي ويرسلون لك فيديو قصيرًا وقائمة إصلاحات مرتبة حسب الأولوية. هي لك في كل الأحوال.",
    "audit.cta": "اطلب تدقيقك المجاني",
    "audit.l1": "فحص السرعة ومؤشرات Core Web Vitals",
    "audit.l2": "فجوات SEO مقارنةً بأقوى 3 منافسين",
    "audit.l3": "نقاط تسرّب التحويل على الجوال",
    "audit.l4": "مراجعة جودة العربية واتجاه RTL",
    "audit.l5": "تحسينات سريعة يمكنك تنفيذها هذا الأسبوع",

    "proc.eyebrow": "كيف نعمل",
    "proc.h2": "موقعك جاهز خلال 6 إلى 10 أسابيع.",
    "p1.h": "التدقيق والاستراتيجية", "p1.p": "ندرس بياناتك ومنافسيك وعملاءك، ثم نتفق على أرقام مستهدفة.", "p1.t": "الأسبوع 1",
    "p2.h": "التصميم", "p2.p": "مخططات أولية ثم تصاميم نهائية بالعربية والإنجليزية. توافق على كل شاشة.", "p2.t": "الأسابيع 2–4",
    "p3.h": "التطوير والاختبار", "p3.p": "البرمجة وإعداد التتبّع وتحسين السرعة والاختبار على أجهزة حقيقية.", "p3.t": "الأسابيع 4–8",
    "p4.h": "الإطلاق والنمو", "p4.p": "تقرير شهري عن العملاء المحتملين والإيرادات، واختبارات مستمرة لتحسينها.", "p4.t": "مستمر",
    "proc.cta.p": "لست متأكدًا من أين تبدأ؟ ابدأ بالتدقيق المجاني.",

    "price.eyebrow": "أسعار تقديرية",
    "price.h2": "أسعار واضحة، بلا مفاجآت.",
    "price.sub": "نسعّر كل مشروع حسب نطاقه. هذه النطاقات تغطي معظم عملائنا في الإمارات.",
    "from": "ابتداءً من",
    "plan.cta": "اطلب عرض سعر",
    "plan1.h": "انطلاق", "plan1.d": "للعلامات الجديدة التي تحتاج موقعًا سريعًا وموثوقًا.",
    "plan1.l1": "حتى 8 صفحات، عربي + إنجليزي", "plan1.l2": "نموذج تواصل + واتساب", "plan1.l3": "إعداد SEO للصفحات", "plan1.l4": "4–6 أسابيع",
    "plan2.tag": "الأكثر اختيارًا",
    "plan2.h": "نمو", "plan2.d": "للشركات التي تريد موقعًا يبيع.",
    "plan2.l1": "حتى 20 صفحة + صفحات هبوط", "plan2.l2": "ربط CRM وتتبّع المكالمات وواتساب", "plan2.l3": "خطة محتوى SEO لمدة 3 أشهر", "plan2.l4": "اختبارات تحويل شهرية",
    "plan3.h": "توسّع", "plan3.d": "للمواقع متعددة الأسواق والمتاجر الإلكترونية والشركات الكبرى.",
    "plan3.l1": "متجر إلكتروني أو منصة مخصصة", "plan3.l2": "إعداد لعدة دول خليجية", "plan3.l3": "تكاملات ولوحات بيانات", "plan3.l4": "فريق نمو مخصص",

    "q1": "\"كانوا الوكالة الوحيدة التي سألت عن أهدافنا من العملاء المحتملين قبل أن تعرض علينا أي تصميم. وحققناها خلال أربعة أشهر.\"",
    "q1.r": "مديرة التسويق، مارينا إستيتس",
    "q2": "\"موقعنا العربي أصبح أخيرًا طبيعيًا وأصيلًا. تضاعفت الحجوزات من زوار السعودية أكثر من مرة.\"",
    "q2.r": "المؤسس، عيادات قمر",
    "q3": "\"سريعون وصادقون وملتزمون بالميزانية. يقدّمون تقارير عن الإيرادات، لا عن أرقام شكلية.\"",
    "q3.r": "الرئيس التنفيذي، عود هاوس",

    "faq.eyebrow": "الأسئلة الشائعة",
    "faq.h2": "أسئلة نسمعها كثيرًا.",
    "f1.q": "كم يستغرق بناء الموقع؟",
    "f1.a": "تُطلق معظم المشاريع خلال 6 إلى 10 أسابيع، ومواقع باقة الانطلاق خلال 4 أسابيع تقريبًا. نتفق على جدول زمني ثابت قبل أن نبدأ.",
    "f2.q": "هل تكتبون بالعربية فعلًا أم تترجمون؟",
    "f2.a": "يكتب كتّاب محتوى عرب كل صفحة ويراجعونها، ونصمّم تخطيط RTL مستقلًا بدلًا من عكس النسخة الإنجليزية.",
    "f3.q": "ماذا لو لم يجلب الموقع عملاء أكثر؟",
    "f3.a": "نحدّد أرقامًا مستهدفة في الأسبوع الأول ونقدّم تقريرًا عنها كل شهر. في باقة النمو، إن لم نحقق الهدف المتفق عليه خلال أول 90 يومًا، نواصل أعمال تحسين التحويل مجانًا حتى نحققه.",
    "f4.q": "هل سأتمكن من تعديل الموقع بنفسي؟",
    "f4.a": "نعم. يأتي كل موقع مع نظام إدارة محتوى سهل، وجلسة تدريب مسجّلة، و30 يومًا من الدعم المجاني بعد الإطلاق.",
    "f5.q": "هل تعملون مع شركات خارج دبي؟",
    "f5.a": "نعم. نعمل مع عملاء في الإمارات والسعودية وقطر والكويت والبحرين وعُمان، ونلتقي حضوريًا في دبي وأبوظبي.",
    "f6.q": "هل يمكنني الدفع على مراحل؟",
    "f6.a": "نعم. الشروط المعتادة: 40% عند البدء، و40% عند اعتماد التصميم، و20% عند الإطلاق.",

    "ct.eyebrow": "ابدأ من هنا",
    "ct.h2": "احجز تدقيقك المجاني.",
    "ct.p": "أربعة أسئلة سريعة. يرد عليك أحد خبرائنا خلال يوم عمل واحد، وغالبًا في اليوم نفسه.",
    "ct.call": "اتصل", "ct.email": "البريد", "ct.visit": "زورونا",
    "ct.addr": "حي دبي للتصميم، دبي، الإمارات",
    "fm.need": "ماذا تحتاج؟", "fm.choose": "اختر خيارًا",
    "fm.need1": "موقع جديد", "fm.need2": "إعادة تصميم موقعي الحالي", "fm.need3": "عملاء أكثر من موقعي الحالي", "fm.need4": "متجر إلكتروني",
    "fm.budget": "نطاق الميزانية", "fm.unsure": "لست متأكدًا بعد",
    "fm.time": "الإطار الزمني", "fm.t1": "في أقرب وقت", "fm.t2": "خلال 1–3 أشهر", "fm.t3": "أستكشف الخيارات فقط",
    "fm.contact": "البريد الإلكتروني أو رقم واتساب",
    "fm.ph": "you@company.ae أو ‎+971…",
    "fm.submit": "احصل على تدقيقي المجاني",
    "fm.note": "بلا رسائل مزعجة ولا ضغط بيعي. نستخدم بياناتك للرد عليك فقط.",
    "fm.ok.h": "شكرًا لك، استلمنا طلبك.",
    "fm.ok.p": "سيتواصل معك أحد خبرائنا خلال يوم عمل واحد.",

    "ft.h": "لننمِّ أعمالك معًا.",
    "ft.about": "وكالة تصميم مواقع ونمو في دبي، نبني للإمارات والخليج.",
    "ft.svc": "الخدمات", "ft.co": "الشركة", "ft.ct": "تواصل",
    "ft.loc": "دبي · أبوظبي · الرياض"
  };
  var TITLE = {
    en: document.title,
    ar: "وكالة تصميم مواقع في دبي – مواقع تجلب لك العملاء | أوبن جروث"
  };

  var textNodes = document.querySelectorAll("[data-i18n]");
  var phNodes = document.querySelectorAll("[data-i18n-ph]");
  textNodes.forEach(function (el) { el.dataset.en = el.innerHTML; });
  phNodes.forEach(function (el) { el.dataset.enPh = el.placeholder; });

  var toggle = document.getElementById("langToggle");

  function setLang(lang) {
    var ar = lang === "ar";
    var root = document.documentElement;
    root.lang = ar ? "ar" : "en";
    root.dir = ar ? "rtl" : "ltr";
    textNodes.forEach(function (el) {
      var key = el.dataset.i18n;
      el.innerHTML = ar && AR[key] ? AR[key] : el.dataset.en;
    });
    phNodes.forEach(function (el) {
      var key = el.dataset.i18nPh;
      el.placeholder = ar && AR[key] ? AR[key] : el.dataset.enPh;
    });
    document.title = TITLE[ar ? "ar" : "en"];
    toggle.textContent = ar ? "English" : "عربي";
    toggle.setAttribute("aria-label", ar ? "Switch to English" : "التبديل إلى العربية");
    try { localStorage.setItem("lang", root.lang); } catch (e) {}
  }

  toggle.addEventListener("click", function () {
    var next = document.documentElement.lang === "ar" ? "en" : "ar";
    setLang(next);
    track("language_switch", { lang: next });
  });

  var initial = new URLSearchParams(location.search).get("lang");
  if (!initial) { try { initial = localStorage.getItem("lang"); } catch (e) {} }
  if (initial === "ar") setLang("ar");

  /* ---------- Squeeze carousel (vanilla port of 21st.dev @yura carousel-squeeze) ---------- */
  (function initSqueeze() {
    var root = document.getElementById("squeeze");
    if (!root) return;
    var stripEl = root.querySelector(".sq__strip");
    var copies = Array.prototype.slice.call(root.querySelectorAll(".sq__copy"));

    /* Concept designs in /work */
    var SLIDES = [
      { slug: "forma", mark: "Forma Studio" },
      { slug: "everwell", mark: "Everwell Clinic" },
      { slug: "haven", mark: "Haven Properties" },
      { slug: "waypoint", mark: "Waypoint Logistics" },
      { slug: "north", mark: "North Advisory" }
    ];
    var count = SLIDES.length;
    var SHARES = [-0.06, 0.61, 0.3, 0.15];    /* open card starts from a 16:9 block, then gives a little back */
    var STRETCHED = [0, 0.71, 0.4, 0.25];     /* the hovered column takes more room */
    var SQUEEZED = [-0.12, 0.59, 0.28, 0.13]; /* its neighbours pay for it */
    var slats = Math.max(1, Math.min(3, count - 4));
    var visible = 4 + slats;
    var ms = reduceMotion ? 0 : 1000;
    var cards = [], column = 0, slid = 0, hover = -1;
    var settleTimer = null, playTimer = null, paused = false, inView = false;
    root.style.setProperty("--sq-slats", slats);
    root.style.setProperty("--sq-ms", ms + "ms");

    function wrap(i) { return ((i % count) + count) % count; }
    function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

    function makeCard(slide) {
      var s = SLIDES[slide];
      var el = document.createElement("button");
      el.type = "button";
      el.className = "sq__card";
      el.setAttribute("role", "tab");
      el.setAttribute("aria-label", s.mark);
      el.setAttribute("aria-controls", "sqPanel");
      el.innerHTML = '<span class="sq__mark" aria-hidden="true">' + esc(s.mark) + "</span>";
      var img = new Image();
      img.className = "sq__pic";
      img.alt = "";
      img.draggable = false;
      img.decoding = "async";
      img.onerror = function () { img.remove(); };
      img.src = "work/" + s.slug + ".webp";
      el.insertBefore(img, el.querySelector(".sq__mark"));
      var card = { slide: slide, el: el };
      el.addEventListener("mousemove", function () {
        var col = cards.indexOf(card) + column;
        if (hover !== col) { hover = col; paint(); }
      });
      el.addEventListener("click", function () {
        var col = cards.indexOf(card) + column;
        if (col > 0) step(col);
      });
      return card;
    }

    function shareOf(col) {
      if (hover < 0 || hover > 3 || reduceMotion) return SHARES[col];
      return hover === col ? STRETCHED[col] : SQUEEZED[col];
    }
    function widthOf(col) {
      if (col < 0 || col > 3) return "var(--sq-slat)";
      if (col === 0) return "calc(var(--sq-hero) + var(--sq-room) * " + shareOf(0) + ")";
      return "calc(var(--sq-room) * " + shareOf(col) + ")";
    }

    function paint() {
      cards.forEach(function (c, place) {
        var col = place + column, w = widthOf(col), front = col === 0;
        c.el.style.width = w;
        c.el.style.marginLeft = place === 0 ? "0px" : col < 4 ? "var(--sq-gap)" : "var(--sq-slat-gap)";
        c.el.style.borderRadius = "min(var(--sq-radius), calc(" + w + " / 2))";
        c.el.setAttribute("aria-selected", String(front));
        c.el.tabIndex = front ? 0 : -1;
      });
      stripEl.style.transform = "translateX(calc(" + slid + " * (var(--sq-slat) + var(--sq-gap))))";
      var open = cards[-column].slide;
      copies.forEach(function (el, i) {
        var shown = i === open;
        el.classList.toggle("is-shown", shown);
        el.setAttribute("aria-hidden", String(!shown));
        el.querySelectorAll("a, button").forEach(function (a) { a.tabIndex = shown ? 0 : -1; });
      });
    }

    /* Apply a change with transitions off, then commit it so nothing animates */
    function still(fn) {
      root.classList.add("is-still");
      fn();
      void stripEl.offsetWidth;
      root.classList.remove("is-still");
    }

    /* After a step the strip is longer than needed: trim to the cards on show. Same picture, no movement. */
    function settle() {
      still(function () {
        var p = -column;
        cards.slice(0, p).concat(cards.slice(p + visible)).forEach(function (c) { c.el.remove(); });
        cards = cards.slice(p, p + visible);
        column = 0;
        slid = 0;
        paint();
      });
    }

    function step(by) {
      if (count < 2 || !by) return;
      clearTimeout(settleTimer);
      var hadFocus = stripEl.contains(document.activeElement);
      if (by > 0) {
        /* the strip slides left; the card leaving the front narrows to a slat and exits */
        column -= by;
        slid -= by;
        while (cards.length < -column + visible) {
          var added = makeCard(wrap(cards[cards.length - 1].slide + 1));
          cards.push(added);
          stripEl.appendChild(added.el);
        }
        paint();
      } else {
        /* grow the strip at the front as slats, unseen, then ease them open */
        var n = -by;
        still(function () {
          for (var k = 0; k < n; k++) {
            var added = makeCard(wrap(cards[0].slide - 1));
            cards.unshift(added);
            stripEl.insertBefore(added.el, stripEl.firstChild);
          }
          column -= n;
          slid -= n;
          paint();
        });
        column += n;
        slid += n;
        paint();
      }
      if (hadFocus) cards[-column].el.focus({ preventScroll: true });
      settleTimer = setTimeout(settle, ms + 20);
      schedulePlay();
    }

    root.querySelectorAll(".sq__arrow").forEach(function (b) {
      b.addEventListener("click", function () { step(Number(b.dataset.dir)); });
    });
    stripEl.addEventListener("keydown", function (e) {
      var by = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!by) return;
      e.preventDefault();
      step(by);
    });

    /* Autoplay: one step every 6s, paused on hover/focus, off screen, or with reduced motion */
    function schedulePlay() {
      clearTimeout(playTimer);
      if (paused || reduceMotion || !inView || document.hidden) return;
      playTimer = setTimeout(function () { step(1); }, 6000);
    }
    root.addEventListener("mouseenter", function () { paused = true; schedulePlay(); });
    root.addEventListener("mouseleave", function () { paused = false; hover = -1; paint(); schedulePlay(); });
    root.addEventListener("focusin", function () { paused = true; schedulePlay(); });
    root.addEventListener("focusout", function () { paused = false; schedulePlay(); });
    document.addEventListener("visibilitychange", schedulePlay);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) { inView = entries[0].isIntersecting; schedulePlay(); }, { threshold: 0.3 }).observe(root);
    }

    for (var p = 0; p < visible; p++) {
      var first = makeCard(wrap(p));
      cards.push(first);
      stripEl.appendChild(first.el);
    }
    still(paint);
  })();

  /* ---------- Lead form ---------- */
  var form = document.getElementById("leadForm");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    [["need", form.need.value], ["budget", form.querySelector("input[name=budget]:checked")], ["timeline", form.timeline.value], ["contact", form.contact.value.trim().length > 4]]
      .forEach(function (pair) {
        var field = form.querySelector("[name=" + pair[0] + "]").closest(".field");
        field.classList.toggle("is-invalid", !pair[1]);
        if (!pair[1]) ok = false;
      });
    if (!ok) { form.querySelector(".is-invalid select, .is-invalid input").focus(); return; }

    var data = Object.fromEntries(new FormData(form).entries());
    track("generate_lead", { need: data.need, budget: data.budget, timeline: data.timeline });

    /* Send to your backend when the form has a real action URL */
    var action = form.getAttribute("action");
    if (action && action !== "#") {
      fetch(action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } }).catch(function () {});
    }
    form.querySelector(".form__ok").hidden = false;
  });
  form.addEventListener("change", function (e) {
    var field = e.target.closest(".field");
    if (field) field.classList.remove("is-invalid");
  });

  document.getElementById("year").textContent = new Date().getFullYear();
})();
