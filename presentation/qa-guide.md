# دليل الأسئلة والأجوبة — بصائر

> **الغرض:** إعداد المقدم للأسئلة المتوقعة بعد العرض. كل سؤال يحتوي على إجابة موجزة
> (30–60 ثانية كلاماً)، مصدراً واقعياً من الكود، تناقصاً صادقاً، وتحسيناً مقترحاً.

---

## الوحدة الأولى: بنية النظام وتدفق البيانات (Q1–Q6)

---

### Q1: كيف تتدفق البيانات من المخطوط إلى الشاشة؟

**الإجابة:**
المخطوط (.docx) يتحول إلى ملفات Markdown عبر سكريبت Python. أثناء بناء الموقع
(`next build`)، تقرأ ملفات Markdown من `content/chapters/` وتُدمج في صفحات HTML
جاهزة (Static Site Generation). في المتصفح، يقرأ React المحتوى من الـ DOM ويُنشئ
شجرة تفاعلية — هذه مرحلة الـ hydration.

**المصدر:** `lib/contentLoader.ts:4` — المسار `content/chapters/` ؛
`app/chapter/[slug]/page.tsx:33-38` — قراءة المحتوى وقت البناء.

**التناقص / الحد:** البيانات تتغير فقط عند إعادة البناء (`next build`). لا يوجد تحديث
حي للبيانات أثناء التشغيل.

**التحسين المقترح:** أتمتة بناء YAML للبيانات الوصفية للفصول بدلاً من استخراج العنوان
من أول سطر h1.

---

### Q2: لماذا اخترنا static export بدلاً من SSR أو API؟

**الإجابة:**
التأكيد `output: "export"` في `next.config.ts:12` يجعل next.js يُخرج ملفات HTML
ثابتة فقط. هذا يعني: لا خادم Node.js مطلوب عند التشغيل، لا قاعدة بيانات، لا Lambda.
التكلفة صفر على الخادم، والأداء أقصى لأن المحتوى يُقدَّم مباشرة من CDN.

**المصدر:** `next.config.ts:12` — `output: "export"`.

**التناقص / الحد:** لا يمكن استخدام Server Components المعقدة أو API Routes أو
التحديثات الحية للبيانات. أي تغيير في المحتوى يتطلب إعادة بناء ونشر.

**التحسين المقترح:** إذا احتاج المشروع لاحقاً تحديثات حية، التحويل إلى Next.js
مع نشر عادي (Node server) أو Edge Functions خيار صعب بدون إعادة هيكلة.

---

### Q3: ما الفرق بين «الخادم» هنا والـ API التقليدي؟

**الإجابة:**
هنا لا يوجد خادم عند وقت التشغيل (runtime). الخادم موجود فقط وقت البناء: يقرأ
ملفات Markdown ويُخرج HTML. بعد النشر، الملفات تُستضاف على CDN فقط — لا Lambda،
لا قاعدة بيانات، لا طلبات POST. هذا يختلف عن API التقليدي الذي يعالج الطلبات في كل مرة.

**المصدر:** `next.config.ts:12` — `output: "export"` ؛
`vercel.json:1` — فارغ (لا إعدادات خادم).

**التناقص / الحد:** أي ميزة تتطلب خادماً (مثل إشعارات Push، أو مزامنة الحسابات)
تتطلب إعادة بناء البنية التحتية بالكامل.

**التحسين المقترح:** استخدام Vercel Serverless Functions للخدمات التي تتطلب خادماً
(مزامنة، إشعارات) مع الحفاظ على الـ static export للمحتوى.

---

### Q4: كيف تُبنى الصفحات؟ لكل فصل ملف؟

**الإجابة:**
نعم. كل فصل له ملف في `content/chapters/`. الدالة `generateStaticParams` في
`app/chapter/[slug]/page.tsx:11-16` تقرأ جميع الفصول وتُنشئ مساراً لكل واحد.
عند البناء، يُنتج next.js ملف HTML منفصل لكل فصل.

**المصدر:** `app/chapter/[slug]/page.tsx:11-16` — `generateStaticParams` ؛
`lib/contentLoader.ts:18-62` — `getAllChapters`.

**التناقص / الحد:** الفصول يجب أن تكون موجودة في `content/chapters/` وقت البناء. إضافة فصل
جديد تتطلب إعادة بناء ونشر.

**التحسين المقترح:** إضافة سكريبت build يتحقق من تكرار IDs الفصول ويُصدر تحذير Layout
في حالة وجود تعارض.

---

### Q5: ماذا يحدث عند طلب مسار غير موجود؟

**الإجابة:**
الملف `app/not-found.tsx` يعرض صفحة 404 بتصميم عربي متوافق مع RTL. في بيئة
Apache، يُعاد توجيه الطلبات غير الموجودة إلى `404.html` عبر
`public/.htaccess:1`. لا يوجد تحويل ديناميكي — كل شيء ثابت.

**المصدر:** `app/not-found.tsx:3-20` — صفحة 404 ؛
`public/.htaccess:1` — `ErrorDocument 404 /404.html`.

**التناقص / الحد:** صفحة 404 لا تحتوي على بحث أو اقتراحات. المستخدم لا يعرف
أن مساره خاطئ إلا من الرسالة فقط.

**التحسين المقترح:** إضافة اقتراحات ذكية في صفحة 404 (بحث عن كلمات من المسار
الخاطئ) لتحسين تجربة المستخدم.

---

### Q6: كيف تُحفظ تقدم القراءة والعلامات بدون خادم؟

**الإجابة:**
كل شيء يُخزَّن في `localStorage` في متصفح المستخدم. العلامات
(Bookmarks) تُخزَّن بالمفتاح `basaar-bookmarks` في `lib/bookmarks.ts:1`،
والتقدم في القراءة (Reading Progress) بالمفتاح `basaar-reading-progress` في
`lib/readingProgress.ts:1`. لا يوجد أي خادم أو API.

**المصدر:** `lib/bookmarks.ts:1` — المفتاح `basaar-bookmarks` ؛
`lib/readingProgress.ts:1` — المفتاح `basaar-reading-progress`.

**التناقص / الحد:** البيانات تبقى في المتصفح فقط — لا مزامنة بين الأجهزة أو
بين المتصفحات المختلفة.

**التحسين المقترح:** إضافة تصدير/استيراد للبيانات عبر ملف JSON لتثبيت البيانات
على جهاز آخر يدوياً.

---

## الوحدة الثانية: Hydration وحالة العميل (Q7–Q13)

---

### Q7: ما الفرق بين HTML المُقدَّم من الخادم والمُعراض في المتصفح؟

**الإجابة:**
الخادم (أو مرحلة البناء) يُنتج HTML يحتوي على المحتوى النصي الكامل لكن بدون
تفاعلية. عند تحميل الصفحة في المتصفح، يُحمَّل JavaScript ويُنشئ React شجرة
الـ DOM مرة أخرى ويربطها بالأحداث — هذه هي hydration. الفجوة بين HTML الأصلي
والـ DOM المُنشأ هي مصدر التباين.

**المصدر:** `app/layout.tsx:29-49` — المكون الجذر (Server Component) ؛
`components/ClientShell.tsx:1-39` — حد العميل.

**التناقص / الحد:** إذا قرأ المكون بعض البيانات من `localStorage` أثناء render
الـ server side، القيمة ستكون مختلفة عن العميل → hydration error.

**التحسين المقترح:** استخدام `useSyncExternalStore` مع server snapshot ثابت
(كما في `Navbar.tsx:23`) لتجنب أي اختلاف.

---

### Q8: متى يحدث الـ hydration بالضبط؟

**الإجابة:**
يحدث بعد تحميل JavaScript وتنفيذ الدالة الأولى. في هذا التطبيق، يُضاف
`<script>` في `layout.tsx:39-41` الذي يقرأ localStorage ويُضيف class "dark"
 قبل hydration. الـ hydration itself يحدث عندما يُحمَّل React ويربط
`ClientShell` بالأحداث.

**المصدر:** `layout.tsx:39-41` — script مبكر للثيم ؛
`components/ClientShell.tsx:1-3` — "use client" boundary.

**التناقص / الحد:** لا يمكننا تحديد لحظة hydration بدقة — يعتمد على سرعة
تحميل الملفات وسرعة المعالج.

**التحسين المقترح:** استخدام `onLoad` callback أو `reportWebVitals` لقياس
وقت hydration الفعلي.

---

### Q9: لماذا getSnapshot = صفر على الخادم؟

**الإجابة:**
في `Navbar.tsx:20-24`، الدالة `useSyncExternalStore` تأخذ 3 معاملات:
subscribe، getSnapshot (للعميل)، وgetServerSnapshot. المعامل الثالث
`() => false` يُرجع قيمة ثابتة على الخادم لأن `document` غير متاح في
بيئة Node.js. هذا يمنع hydration error.

**المصدر:** `Navbar.tsx:20-24` — `useSyncExternalStore(subscribe,
() => document.documentElement.classList.contains("dark"), () => false)`.

**التناقص / الحد:** القيمة `false` تعني أن الثيم الداكن لن يظهر في HTML
المُقدَّم — المستخدم يرى ومضة (flash) قبل hydration.

**التحسين المقترح:** نفس نمط inline script في `layout.tsx:39-41` يحل هذه المشكلة بشكل استباقي — وهو ما نفعله بالفعل.

---

### Q10: كيف تمنعنا الأنماط الآمنة من mismatch؟

**الإجابة:**
السطر `<html ... suppressHydrationWarning>` في `layout.tsx:37` يُخبر React
بتجاهل اختلافات hydration على العنصر `<html>`. السبب: الـ inline script في
`layout.tsx:39-41` يُضيف `class="dark"` إلى العميل قبل hydration، لكن HTML
الأصلي لا يحتوي عليه. بدون `suppressHydrationWarning`، يظهر console warning.

**المصدر:** `layout.tsx:37` — `suppressHydrationWarning` ؛
`layout.tsx:39-41` — inline script for theme.

**التناقص / الحد:** `suppressHydrationWarning` يخفي تحذيرات فقط على العنصر
المعين — لا يحل اختلافات hydration في أماكن أخرى.

**التحسين المقترح:** استخدام CSS variables مباشرة بدلاً من toggling class
سيُلغي الحاجة لـ suppressHydrationWarning بالكامل.

---

### Q11: ما الذي يسبب hydration mismatch وما نعاقبه؟

**الإجابة:**
السبب الأكبر: قراءة `localStorage` أثناء render في بيئة SSR. إذا قرأنا
مثلاً bookmarks في Server Component، القيمة على الخادم = null، على العميل
= البيانات المحفوظة. React يكتشف الفرق ويُظهر hydration error في console.
نعاقب: نستخدم `useSyncExternalStore` مع server snapshot ثابت.

**المصدر:** `lib/bookmarks.ts:10` — `if (typeof window === "undefined") return []` ؛
`lib/readingProgress.ts:10` — نفس النمط ؛
`components/Navbar.tsx:23` — `() => false` كـ server snapshot.

**التناقص / الحد:** بعض المكونات لا تزال تقرأ localStorage مباشرة في `useEffect`
بدون حماية كافية → قد تظهر hydration warnings في بعض الحالات.

**التحسين المقترح:** استخدام React 19 hydration API الجديد أو `use` hook
لتحجيم قراءة البيانات الآمنة.

---

### Q12: هل تعيد الفجوة الزمنية رسم الصفحة؟ متى يحدث ذلك بالضبط؟

**الإجابة:**
نعم. بعد hydration (عندما يُنشئ React شجرة DOM)، تحدث re-render لإعادة
حساب القيم التي تعتمد على العميل. مثلاً، `ReadingProgressBar` في
`ReadingProgressBar.tsx:19-23` يقرأ `getChapterProgress` — القيمة على الخادم
= 0، بعد hydration = التقدم المحفوظ. هذا يحدث مرة واحدة فور اكتمال hydration.

**المصدر:** `ReadingProgressBar.tsx:19-23` — `useSyncExternalStore` مع
server snapshot = 0 ؛
`ReadingProgressBar.tsx:25-28` — re-render عند تغير `savedProgress`.

**التناقص / الحد:** إذا كان التقدم المحفوظ كبيراً، قد يحدث تأثير بصري ملحوظ
(parallax في شريط التقدم).

**التحسين المقترح:** إضافة تأثير حركي سلس عند تحميل التقدم المحفوظ.

---

### Q13: هل تفقد الصفحة حالة العرض عند التنقل بين الفصول؟

**الإجابة:**
لا. التنقل بين الفصول يتم عبر client-side navigation في Next.js، لا يحدث إعادة تحميل الصفحة بالكامل. `ClientShell` يبقى مُحمَّلاً طوال الجلسة. `ReadingProgressBar`
يعيد حساب التقدم لكل فصل جديد لأنه يستدعي `getChapterProgress(chapterId)` في
`ReadingProgressBar.tsx:42` (داخل useEffect) — لكنه لا يفقد الحالة العامة.

**المصدر:** `components/ClientShell.tsx:15-38` — الجذر الذي يبقى ثابتاً ؛
`components/ReadingProgressBar.tsx:30-64` — useEffect يعيد الحساب لكل chapterId.

**التناقص / الحد:** `SearchDialog` يُعاد تهيئته كل مرة يُفتح فيها (fetch +
index build) → تأخير في أول بحث بعد كل تنقّل.

**التحسين المقترح:** تهيئة FlexSearch مرة واحدة في `ClientShell` وتمريرها كـ prop
أو context بدلاً من إعادة البناء في كل render.

---

## الوحدة الثالثة: البحث والأداء (Q14–Q20)

---

### Q14: هل البحث فوري؟ ما الخوارزمية؟

**الإجابة:**
البحث يستخدم FlexSearch — مكتبة بحث في العميل (client-side). الفهرس يُبنى
أثناء تشغيل المكون `SearchDialog` via dynamic import. البحث يستخدم tokenize
"forward" — يقسم كل كلمة إلى أجزاء من اليسار إلى اليمين. النتائج تظهر
تقريباً فوراً لأن الفهرس في الذاكرة.

**المصدر:** `components/SearchDialog.tsx:46` — `const FlexSearch = (await import("flexsearch")).default` ؛
`components/SearchDialog.tsx:52-60` — إعداد FlexSearch.Document مع `tokenize: "forward"`.

**التناقص / الحد:** الـ index لا يدعم full-text search دقيقاً — forward tokenize
لا يدعم wildcard أو regex.

**التحسين المقترح:** ترقية إلى FlexSearch v0.8+ مع tokenize "forward" + "bitmap"
لتحسين recall مع الحفاظ على الأداء.

---

### Q15: كيف يُبنى فهرس البحث؟

**الإجابة:**
السكريبت `scripts/build-search-index.mjs` يقرأ ملفات Markdown من
`content/chapters/`، يُنشئ مصفوفة من المستندات (id, title, content, slug)،
ويكتبها في `public/search-data.json`. هذا يحدث تلقائياً قبل البناء عبر
`prebuild` في `package.json:8`.

**المصدر:** `scripts/build-search-index.mjs:1-47` — السكريبت بالكامل ؛
`package.json:8` — `"prebuild": "node scripts/build-search-index.mjs"`.

**التناقص / الحد:** حجم الملف = 1,753,076 bytes (~1.7MB) — هذا كل المحتوى
النصي للكتاب يُحمَّل في chunk واحد.

**التحسين المقترح:** تقسيم المحتوى إلى chunks أصغر أو استخدام lazy loading
لتحميل المحتوى المطلوب فقط.

---

### Q16: ما حجم البيانات المُرسلة للعميل في كل تحميل صفحة؟

**الإجابة:**
البيانات الرئيسية: ملف `search-data.json` بحجم 1,753,076 bytes (~1.7MB)
يحتوي على كامل المحتوى النصي للكتاب. بالإضافة إلى 522 صورة في
`public/images/` تُحمَّل حسب الحاجة (lazy loading). ملفات HTML لكل فصل
أصغر بكثير (بضع KB).

**المصدر:** `public/search-data.json` — 1,753,076 bytes ؛
`public/images/` — 522 صورة في مجلدات فصل-*.

**التناقص / الحد:** الـ 1.7MB تُحمَّل في chunk واحد — يؤثر على سرعة أول
تحميل للصفحة (First Contentful Paint).

**التحسين المقترح:** استخدام Web Worker لتحميل الـ search-data.json في الخلفية
أو تقسيم المحتوى إلى ملفات أصغر لكل فصل.

---

### Q17: كيف يُقاس أداء هذا التطبيق؟

**الإجابة:**
بصراحة: لا يوجد أداة قياس أداء مُعدّة حالياً. المشروع يحتوي على
`playwright.config.ts` لكن لا يوجد CI يُشغّل Lighthouse أو Web Vitals.
المقارنات مع الأدوات الخارجة مثل Lighthouse ممكنة يدوياً لكنها
لم تُدمج في pipeline.

**المصدر:** `playwright.config.ts:1-19` — إعداد Playwright ؛
`package.json:15` — `"test:e2e": "playwright test"`.

**التناقص / الحد:** لا يمكن قياس Core Web Vitals (LCP, CLS, INP) تلقائياً.
لا يوجد مراقبة لأداء الإنتاج.

**التحسين المقترح:** إضافة `web-vitals` package وتقارير Lighthouse CI في
خط الإنتاج.

---

### Q18: متى يُحمَّل FlexSearch في الصفحة؟

**الإجابة:**
يُحمَّل بشكل كسول (lazy) عند فتح مكون `SearchDialog`. السطر
`await import("flexsearch")` في `SearchDialog.tsx:46` يُحمِّل المكتبة في
لحظة الفتح فقط — لا يُثقل الصفحة الرئيسية.

**المصدر:** `components/SearchDialog.tsx:46` — `const FlexSearch = (await
import("flexsearch")).default`.

**التناقص / الحد:** أول فتح للبحث يتطلب وقتاً (import + fetch + index build).
قد يكون هناك تأخير ملحوظ على أجهزة الضعيفة.

**التحسين المقترح:** تحميل FlexSearch مبكراً في `useEffect` في `ClientShell`
عندما يكون المتصفح idle (requestIdleCallback).

---

### Q19: ما تكلفة إسقاط قائمة البحث عند كل ضغطة على لوحة المفاتيح؟

**الإجابة:**
عند كل تغيير في حقل البحث (`SearchDialog.tsx:109-113`)، تُستدعى `doSearch`
التي تُعيد حساب النتائج: `indexRef.current.search(q, { enrich: true,
limit: 20 })` ثم تصفية التكرارات وتحديد الـ excerpt لكل نتيجة. هذا يحدث
في العميل فقط — لا طلبات شبكة.

**المصدر:** `components/SearchDialog.tsx:75-107` — الدالة `doSearch` ؛
`components/SearchDialog.tsx:82-85` — استدعاء `search` مع `enrich: true, limit: 20`.

**التناقص / الحد:** لا يوجد debounce — كل حرف يُعاد حساب البحث بالكامل.
على المحتوى الكبير (1.7MB index)، قد يحدث تأخر ملحوظ.

**التحسين المقترح:** إضافة debounce بتأخير 150-200ms لتقليل عدد مرات البحث.

---

### Q20: لماذا اخترنا tokenize "forward"؟

**الإجابة:**
اللغة العربية تعاني من elision — حذف بعض الحروف في الوصل (مثل «بالكتاب»
= «بـ + الكتاب»). tokenize "forward" يقسم الكلمة من اليسار إلى أجزاء
 متتالية، مما يسمح بالبحث عن أجزاء من الكلمة. هذا توازن بين حجم الفهرس
(أكبر قليلاً) واسترجاع النتائج (أفضل من exact match).

**المصدر:** `components/SearchDialog.tsx:58` — `tokenize: "forward"`.

**التناقص / الحد:** لا يدعم wildcard أو search phrases كاملة. حجم الفهرس أكبر من tokenize "strict" لكن recall أفضل.

**التحسين المقترح:** اختبار tokenize "forward" + "bitmap" من FlexSearch v0.8
لتحسين الأداء مع الحفاظ على recall.

---

## الوحدة الرابعة: المزامنة والتخزين وعمل دون اتصال (Q21–Q27)

---

### Q21: هل العلامات (Bookmarks) متزامنة بين الأجهزة المختلفة؟

**الإجابة:**
لا. العلامات تُخزَّن في `localStorage` — ذاكرة المتصفح المحلية. الـ event
`storage` في `BookmarkedChapters.tsx:15` يُسمع فقط بين تبويبات المتصفح
نفسه (نفس تبويبات المتصفح). لا يوجد مزامنة بين الأجهزة أو بين المتصفحات
المختلفة.

**المصدر:** `lib/bookmarks.ts:1` — `localStorage` ؛
`components/BookmarkedChapters.tsx:15` — `window.addEventListener("storage", refresh)`.

**التناقص / الحد:** مسح بيانات المتصفح يحذف كل شيء. لا يوجد نسخة احتياطية
على الخادم.

**التحسين المقترح:** إضافة Export/Import لبيانات bookmarks عبر ملف JSON
أو QR code.

---

### Q22: لماذا ليس هناك خادم مزامنة؟

**الإجابة:**
التطبيق مبني على static export (`next.config.ts:12` — `output: "export"`).
لا يوجد Node.js server عند وقت التشغيل، لا يوجد API Routes، لا يوجد
قاعدة بيانات. إضافة مزامنة تتطلب بناء backend كامل — JWT auth + database
+ مزامنة فورية — وهذا خارج نطاق المشروع الحالي.

**المصدر:** `next.config.ts:12` — `output: "export"` ؛
`vercel.json:1` — فارغ (لا إعدادات خادم).

**التناقص / الحد:** المستخدم يفقد كل bookmarks و التقدم إذا انتقل لمتصفح
جديد أو مسح بيانات المتصفح.

**التحسين المقترح:** استخدام Cloudflare Workers + D1 كـ backend خفيف للمزامنة
مع الحفاظ على static export للمحتوى.

---

### Q23: ما الذي يتم تخزينه محلياً بالضبط؟

**الإجابة:**
ثلاثة مفاتيح في localStorage:
1. `basaar-bookmarks` (`lib/bookmarks.ts:1`) — مصفوفة من `{chapterId,
   chapterTitle, timestamp}`.
2. `basaar-reading-progress` (`lib/readingProgress.ts:1`) — مصفوفة من
   `{chapterId, scrollPercentage, updatedAt}`.
3. `theme` — يتم القراءة/الكتابة مباشرة في `Navbar.tsx:29` و
   `layout.tsx:40`.

**المصدر:** `lib/bookmarks.ts:1-7` — واجهة Bookmark ؛
`lib/readingProgress.ts:1-7` — واجهة ReadingProgress ؛
`components/Navbar.tsx:29` — `localStorage.setItem("theme", ...)`.

**التناقص / الحد:** لا يوجد تنظيف تلقائي للبيانات القديمة — قد يتراكم حجم
localStorage مع الوقت.

**التحسين المقترح:** إضافة TTL (Time-To-Live) لبيانات التقدم القديمة
(أكثر من 90 يوماً).

---

### Q24: هل يعمل التخزين دون اتصال بالإنترنت؟

**الإجابة:**
localStorage يعمل دائماً — هو ذاكرة محلية ولا يحتاج شبكة. bookmarks
و reading progress و theme كلها تعمل بدون اتصال. لكن محتوى الكتاب
الفعلي (النصوص والصور) يحتاج خادماً أو assets مُخزَّنة مسبقاً.

**المصدر:** `lib/bookmarks.ts:10-16` — `localStorage` operations ؛
`sw.ts:5-11` — Serwist precache (يحتوي فقط على route files و built assets).

**التناقص / الحد:** إذا لم يزر المستخدم صفحة معينة سابقاً، لن يعمل
محتوىها offline لأنها ليست في runtime cache.

**التحسين المقترح:** إضافة `setCatchHandler` في service worker لعرض صفحة
offline مخصصة عند فشل الشبكة.

---

### Q25: ماذا يحدث عند طلب إشعار Push — هل توجد هذه الميزة؟

**الإجابة:**
بصراحة: لا توجد ميزة Push Notifications في هذا التطبيق. لا يوجد أي كود
يتعامل مع `PushManager` أو `Notification API`. `InstallPrompt.tsx` يعرض
فقط زر تثبيت PWA — لا علاقة له بالإشعارات. الميزة تتطلب خادماً
للتعامل مع Push Subscription.

**المصدر:** `components/InstallPrompt.tsx:1-83` — زر التثبيت فقط ؛
`sw.ts` — لا يوجد `self.addEventListener("push")`.

**التناقص / الحد:** المستخدم لا يحصل على أي إشعار عند تحديث المحتوى
أو ميزة جديدة.

**التحسين المقترح:** إضافة Push Notifications عبر Vercel Edge Functions
مع subscription endpoint.

---

### Q26: كيف يعمل التطبيق دون اتصال بالإنترنت؟

**الإجابة:**
التطبيق يستخدم Serwist كـ Service Worker (`sw.ts:5-11`). يخزَّن مسبقاً
(precache) ملفات الـ build (HTML, JS, CSS) عبر `__SW_MANIFEST`. لكن
محتوى الكتاب (Markdown images, search-data.json) يعتمد على runtime caching
via `defaultCache` في `sw.ts:10`. إذا لم تُزرَّ الصفحة سابقاً، لن يعمل
محتواها offline.

**المصدر:** `sw.ts:5-11` — Serwist setup مع `precacheEntries` و `runtimeCaching` ؛
`next.config.ts:4-9` — Serwist config مع `swSrc` و `swDest`.

**التناقص / الحد:** المحتوى غير المزار سابقاً لا يعمل offline. لا يوجد
precaching لكل صفحات الكتاب (13 فصلاً + الرئيسية).

**التحسين المقترح:** إضافة `runtimeCaching` strategy لـ chapter routes
مع stale-while-revalidate لتحسين تجربة offline.

---

### Q27: هل هناك صفحة fallback عند عدم وجود اتصال؟

**الإجابة:**
لا. لا يوجد `setCatchHandler` في `sw.ts`. إذا فشل الطلب ولم يكن في الـ
cache، يعرض المتصفح صفحة خطأ عامة وليس صفحة offline مخصصة. هذا يعني أن
المستخدم لا يعرف أن المشكلة عدم اتصال وليس خطأ في الموقع.

**المصدر:** `sw.ts:5-13` — لا يوجد `setCatchHandler` أو `handleFetch` مخصص ؛
`public/.htaccess` — لا يوجد redirect لصفحة offline.

**التناقص / الحد:** تجربة المستخدم offline غير مكتملة — لا توجد رسالة توضيحية
أو بديل.

**التحسين المقترح:** إضافة `offline.html` في `public/` وإضافة `setCatchHandler`
في `sw.ts` لعرضه عند فشل الشبكة.

---

## الوحدة الخامسة: الجودة والأمان والاستدامة (Q28–Q31)

---

### Q28: ما مدى أمان هذا التطبيق؟

**الإجابة:**
التطبيق آمن نسبياً: static-only (لا خادم لاختراقه)، لا secrets في الكود
(`.env.local` يحتوي Supabase vars غير مستخدمة حالياً)، مساحة سطح هجوم محدودة.
لكن لا يوجد Content-Security-Policy header — `.htaccess` يضع فقط
`X-Content-Type-Options` و `X-Frame-Options` و `Referrer-Policy`.

**المصدر:** `public/.htaccess:3-7` — Headers المُعدّة (بدون CSP) ؛
`.env.local:4-9` — Supabase vars (كود ميت).

**التناقص / الحد:** بدون CSP، التطبيق معرّض لـ XSS إذا وُجد ثغرة في
أي مكتبة تابعة (مثل react-markdown).

**التحسين المقترح:** إضافة CSP header في `.htaccess` و `vercel.json`
مع `script-src 'self'` و `style-src 'self' 'unsafe-inline'`.

---

### Q29: ما مدى موثوقية هذا التطبيق؟

**الإجابة:**
الاستضافة static تعني: لا خادم يتعطل، لا database تتوقف، لا downtime
بسبب حمل زائد. Vercel CDN موثوق جداً. لكن لا يوجد اختبارات E2E آلية
في CI — اختبارات Playwright موجودة (`e2e/*.spec.ts`) لكن لا يوجد خط
CI يُشغّلها تلقائياً.

**المصدر:** `e2e/` — 6 ملفات اختبارات Playwright ؛
`.github/` — غير موجود (لا CI config) ؛
`package.json:15` — `"test:e2e": "playwright test"` (موجود يدوياً فقط).

**التناقص / الحد:** لا يوجد مراقبة للإنتاج — لا Sentry، لا فحص وقت التشغيل. لا يمكننا معرفة إذا كان الموقع يعمل فعلياً.

**التحسين المقترح:** إضافة GitHub Actions workflow لتشغيل lint + typecheck +
test + build في كل PR.

---

### Q30: كيف نضمن الجودة بمرور الوقت؟

**الإجابة:**
حالياً: `pnpm lint` (ESLint)، `pnpm typecheck` (TypeScript)، `pnpm test`
(Vitest). `test:static` يجمع lint + typecheck. لكن لا يوجد CI — هذه
الأوامر يجب تشغيلها يدوياً. لا يوجد component tests (فقط unit tests
لمكتبات lib/).

**المصدر:** `package.json:10-14` — scripts: lint, typecheck, test:static, test ؛
`lib/__tests__/` — 4 ملفات اختبارات unit ؛
`vitest.config.ts:1-17` — إعداد Vitest مع jsdom.

**التناقص / الحد:** لا يوجد component tests لـ React components. لا يوجد
snapshot tests. لا يوجد CI pipeline.

**التحسين المقترح:** إضافة:
1. `@testing-library/react` component tests لكل component رئيسي.
2. GitHub Actions CI workflow.
3. Playwright tests في CI.

---

### Q31: ما الذي سيتغير في الإصدار التالي؟ (وأي ادعاءات يجب ألا يقولها المقدم)

**الإجابة:**
الخطة تشمل:
1. Offline fallback page مع `setCatchHandler`.
2. Component tests لكل components رئيسية.
3. صور أفضل (image pipeline مع next/image optimization).
4. تقليل حجم corpus البحث (تقسيم إلى chunks).
5. تنظيف الكود الميت (Supabase env vars غير مستخدمة).

**ما يجب ألا يُقال:**
- «التطبيق يعمل بالكامل offline» (المحتوى يحتاج شبكة).
- «البحث instant» (هناك تأخير في التحميل الأولي).
- «يوجد مزامنة بين الأجهزة» (localStorage فقط).
- «يوجد CI/CD» (لا يوجد GitHub Actions).
- «التطبيق آمن بالكامل» (لا يوجد CSP).

**المصدر:** `.env.local:4-9` — Supabase vars ميتة ؛
`sw.ts:5-13` — بدون offline fallback ؛
`.github/` — غير موجود.

**التناقص / الحد:** بعض التحسينات تتطلب إعادة هيكلة كبيرة (مثل تقليل corpus
يتطلب pipeline build جديد).

**التحسين المقترح:** وضع roadmap رسمي في README.md مع أولويات واضحة
ومؤقتات واقعية.

---

## ملخص المراجع

| الملف | الأسطر المُشار إليها |
|-------|----------------------|
| `next.config.ts` | 12 |
| `app/layout.tsx` | 37, 39–41 |
| `app/not-found.tsx` | 3–20 |
| `app/chapter/[slug]/page.tsx` | 11–16, 33–38 |
| `components/Navbar.tsx` | 20–24, 29 |
| `components/ClientShell.tsx` | 15–38 |
| `components/SearchDialog.tsx` | 46, 52–60, 75–107, 109–113 |
| `components/ReadingProgressBar.tsx` | 19–23, 25–28, 30–64 |
| `components/BookmarkedChapters.tsx` | 15 |
| `components/InstallPrompt.tsx` | 1–83 |
| `lib/bookmarks.ts` | 1, 10–16 |
| `lib/readingProgress.ts` | 1, 10–16 |
| `lib/contentLoader.ts` | 4, 18–62 |
| `lib/search.ts` | 1–6 |
| `scripts/build-search-index.mjs` | 1–47 |
| `sw.ts` | 5–11, 10 |
| `public/.htaccess` | 1, 3–7 |
| `public/search-data.json` | (1,753,076 bytes) |
| `package.json` | 8, 10–15 |
| `.env.local` | 4–9 |
| `vitest.config.ts` | 1–17 |
