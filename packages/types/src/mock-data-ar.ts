import { Product, CustomerReview } from './catalog';

export const MOCK_PRODUCTS_AR: Product[] = [
  {
    id: 'prod-sympdca',
    slug: 'sympdca',
    name: 'سيمبيدكا (SymPDCA)',
    brandLine: 'Mirage Pharma',
    category: 'Gastrointestinal & Immunity',
    subtitle: 'المسار الموثوق طوال رحلة الجهاز الهضمي',
    arabicSubtitle: 'مكمل غذائي معتمد',
    tagline: '«مضاعفة الدفاعات» — الدرع المزدوج سريع المفعول لصحة الجهاز الهضمي والأمعاء.',
    description:
      'يدعم عملية الهضم ويساعد في الحفاظ على التوازن الطبيعي للميكروبيوم المعوي (البكتيريا النافعة). يجمع SymPDCA بين Saccharomyces boulardii (125 مجم) و Lactobacillus rhamnosus GG (15 مجم) بنسق تآزري ذكي (1 + 1 = 3) يحمي البكتيريا النافعة من أحماض المعدة القاسية.',
    priceInfo: '200 ج.م للشريط (3 شرائط بالعبوة)',
    packagingDetails: '30 كبسولة جيلاتينية صلبة (3 شرائط بالعبوة)',
    synergyBanner: {
      title: 'قوة التآزر الذكي في SymPDCA (1 + 1 = 3) — Smart Synergy Ratio',
      badge: 'الضوء الأخضر دائماً • درع حيوي مزدوج',
      description:
        'يوفر SymPDCA حماية فعالة ويرفع معدل بقاء بكتيريا Lactobacillus rhamnosus GG (LGG) أثناء مرورها عبر أحماض المعدة القاسية، مما يضمن وصولها بكامل حيويتها إلى الأمعاء دون تأخير أو تعقيد.',
    },
    clinicalIndications: [
      {
        title: 'التعافي بعد المضادات الحيوية (Post-Antibiotic Recovery)',
        description:
          'نظراً لمعدلات الاستخدام المرتفعة للمضادات الحيوية في مصر، يعيد SymPDCA توازن الفلورا المعوية الطبيعية التي تتضرر بسبب كورسات المضادات الحيوية، ويمنع الإسهال المصاحب للمضادات الحيوية.',
      },
      {
        title: 'القولون العصبي والانتفاخ (IBS & Bloating)',
        description:
          'الوجبات المصرية التقليدية الدسمة (الغنية بالدهون والبقوليات كالفول والكربوهيدرات) تسبب عسر الهضم؛ يعمل SymPDCA بفاعلية على تقليل الانتفاخ والغازات واضطرابات حركة الأمعاء.',
      },
      {
        title: 'دعم الجهاز المناعي (Immune System Support)',
        description:
          'يتواجد 70% من الجهاز المناعي داخل الأمعاء؛ يعمل SymPDCA كخط دفاع أول يقوي المناعة الجهازية ضد العدوى التنفسية والمعوية الموسمية.',
      },
    ],
    packSizes: [
      { quantity: '30', unit: 'capsules', inStock: true },
    ],
    heroImage: '/brand/products/sympdca.png',
    bottleImage: '/brand/products/sympdca.png',
    boxImage: '/brand/products/sympdca.png',
    dosageInstructions:
      'تناول من 1 إلى 2 كبسولة جيلاتينية صلبة يومياً أو حسب إرشادات الطبيب المختص. تحتوي العبوة على 30 كبسولة (3 شرائط).',
    rating: 5.0,
    reviewsCount: 284,
    isFeatured: true,
    rawMaterials: [
      {
        id: 'rm-sboulardii-ar',
        name: 'ساكاروميسس بولاردي — Saccharomyces boulardii (125 مجم)',
        botanicalName: 'Saccharomyces boulardii — 125 mg',
        keyBenefits: [
          'يرتبط مباشرة بمسببات الأمراض المعوية ويعادل السموم الميكروبية الخطيرة قبل أن تلحق الضرر بجدار الأمعاء.',
          'مقاوم بطبيعته للمضادات الحيوية البكتيرية، مما يجعله مثالياً للاستخدام المتزامن أثناء كورس المضاد الحيوي.',
          'يحافظ على سلامة الغشاء المخاطي المعوي ويمنع الإسهال الحاد والمزمن.',
        ],
        mechanism:
          'ارتباط مباشر بالبكتيريا الممرضة، وتحييد السموم البكتيرية، وتوفير حماية غذائية لخلايا جدار الأمعاء.',
      },
      {
        id: 'rm-lgg-ar',
        name: 'لاكتوباسيلس رامنوسوس — Lactobacillus rhamnosus GG (15 مجم)',
        botanicalName: 'Lactobacillus rhamnosus GG (LGG) — 15 mg',
        keyBenefits: [
          'يسرع أوقات التعافي المعوي ويقلل الالتهابات الجهازية والموضعية في القناة الهضمية.',
          'محمي بدرع SymPDCA التآزري لعبور أحماض المعدة القاسية والوصول إلى الأمعاء بأعلى كفاءة.',
          'يدعم خط الدفاع المناعي المعوي (الذي يمثل 70% من مناعة الجسم) ضد العدوى الموسمية.',
        ],
        mechanism:
          'إقصاء تنافسي للميكروبات الضارة، وتقوية الحاجز المخاطي، وتنشيط الاستجابة المناعية المعوية.',
      },
    ],
    clinicalEvidences: [
      {
        id: 'ev-sympdca-ar-1',
        journalName: 'المكتبة الوطنية للطب — PubMed Indexed',
        journalLogoText: 'PUBMED PMID: 34190033',
        badgeColor: 'green',
        paperTitle:
          'الفاعلية التآزرية لـ Saccharomyces boulardii و Lactobacillus rhamnosus GG في استعادة الفلورا المعوية وحمايتها',
        authors: 'مرجع طبي مفهرس (PMID: 34190033)',
        year: 2021,
        doiUrl: 'https://pubmed.ncbi.nlm.nih.gov/34190033/',
        keyFinding:
          'إثبات معادلة التآزر الذكي (1 + 1 = 3): حماية بكتيريا LGG ورفع معدل بقائها عبر أحماض المعدة مع تحييد السموم الميكروبية والوقاية من اضطرابات القولون والإسهال.',
      },
    ],
  },
  {
    id: 'prod-man-edge',
    slug: 'man-edge',
    name: 'مان إيدج (Man Edge)',
    brandLine: 'Naturals 4be',
    category: 'Men Health',
    subtitle: 'ارتقِ بأدائك وحيويتك للقمة',
    arabicSubtitle: 'مكمل غذائي معتمد',
    tagline: 'حكمة الأعشاب القديمة مع الدقة الإكلينيكية الحديثة للأداء الأمثل.',
    description:
      'يجمع مان إيدج (Man Edge) بين خلاصة الأعشاب النادرة وأحدث العلوم الإكلينيكية لدعم حيوية ونشاط الرجال، وتعزيز القدرة على التحمل والتوازن الهرموني اليومي.',
    packSizes: [
      { quantity: '30', unit: 'capsules', inStock: true },
      { quantity: '60', unit: 'capsules', inStock: true },
      { quantity: '90', unit: 'capsules', inStock: true },
    ],
    heroImage: '/brand/products/man-edge.jpg',
    bottleImage: '/brand/products/man-edge.jpg',
    boxImage: '/brand/products/man-edge.jpg',
    dosageInstructions: 'تناول كبسولتين يومياً مع إحدى الوجبات الرئيسية، أو حسب توجيهات الطبيب المعالج.',
    rating: 4.9,
    reviewsCount: 148,
    isFeatured: true,
    rawMaterials: [
      {
        id: 'rm-maca',
        name: 'جذور الماكا (Lepidium meyenii)',
        botanicalName: 'Lepidium meyenii',
        keyBenefits: [
          'تركيز عالٍ من الجلوكوزينولات والبوليفينول لتعزيز طاقة الخلايا.',
          'دعم استجابة الغدد الصماء والمحور النخامي الكظري.',
          'تخفيف الإجهاد البدني وزيادة القدرة على التحمل.',
        ],
        mechanism: 'تنظيم حساسية مستقبلات الأندروجين دون تنبيه كيميائي صناعي.',
      },
      {
        id: 'rm-tribulus',
        name: 'نبات التريبولوس (Tribulus Terrestris)',
        botanicalName: 'Tribulus Terrestris Linn',
        keyBenefits: [
          'سابونين بروتوديوسين المعاير لتحفيز إشارات الهرمون الملوتن (LH).',
          'دعم مسار تخليق هرمون التستوستيرون الطبيعي ضمن الحدود الفسيولوجية.',
          'تحسين نشاط أكسيد النيتريك في الأوعية الدموية.',
        ],
        mechanism: 'تنشيط خلايا لايديج في الخصية ودعم التوازن الأندروجيني الداخلي.',
      },
      {
        id: 'rm-saw-palmetto',
        name: 'البلميط المنشاري (Saw Palmetto)',
        botanicalName: 'Serenoa repens',
        keyBenefits: [
          'أحماض دهنية معيارية (85-95%) لتثبيط إنزيم 5-ألفا المختزل.',
          'الحفاظ على صحة وسلامة نسيج البروستاتا وتدفق البول الطبيعي.',
          'حماية البصيلات من ارتباط الديهيدروتستوستيرون (DHT).',
        ],
        mechanism: 'تثبيط إنزيم 5-ألفا المختزل من النوعين الأول والثاني في الأنسجة المستهدفة.',
      },
      {
        id: 'rm-l-arginine',
        name: 'إل-أرجينين الدوائي (L-Arginine Base USP)',
        botanicalName: '2-Amino-5-guanidinopentanoic acid',
        keyBenefits: [
          'المقدمة الحيوية الأساسية لتخليق أكسيد النيتريك البطاني (eNOS).',
          'توسيع الشرايين وتحسين الدورة الدموية الدقيقة وتغذية العضلات.',
          'تسريع الاستشفاء بعد المجهود البدني الشاق.',
        ],
        mechanism: 'التحول المباشر إلى أكسيد النيتريك المحفز لاسترخاء العضلات الملساء في الأوعية.',
      },
    ],
    clinicalEvidences: [
      {
        id: 'ev-1',
        journalName: 'المجلة الإكلينيكية للعلاجات الدوائية',
        paperTitle: 'التركيبات النباتية المعيارية وعلامات صحة الأوعية والذكورة',
        authors: 'المنصور وآخرون',
        year: 2024,
        keyFinding: 'تحسن ملحوظ بنسبة 38.4% في مؤشرات الحيوية وتوافر أكسيد النيتريك خلال 12 أسبوعاً.',
      },
    ],
  },
  {
    id: 'prod-inositol',
    slug: 'inositol-40-1',
    name: 'إينوزيتول (Inositol 40:1)',
    brandLine: 'Naturals 4be',
    category: 'Women Health',
    subtitle: 'استعادة التوازن الهرموني واسترجاع الثقة',
    arabicSubtitle: 'مكمل غذائي معتمد',
    tagline: 'التركيبة الفسيولوجية 40:1 من المايو والدي-كايرو إينوزيتول مع الفولات النشط وCoQ10.',
    description:
      'إينوزيتول 40:1 مزيج متقدم مدروس لدعم التوازن الهرموني الأنثوي، وتحسين حساسية الخلايا للأنسولين، وتعزيز التبويض والخصوبة وفق النسبة الفسيولوجية المثبتة طبياً 40:1.',
    packSizes: [
      { quantity: '30', unit: 'capsules', inStock: true },
      { quantity: '60', unit: 'capsules', inStock: true },
      { quantity: '120', unit: 'capsules', inStock: true },
    ],
    heroImage: '/brand/products/inositol.jpg',
    bottleImage: '/brand/products/inositol.jpg',
    boxImage: '/brand/products/inositol.jpg',
    dosageInstructions: 'تناول كبسولتين مرتين يومياً مع الوجبات، أو وفق إرشادات طبيب النساء والغدد.',
    rating: 5.0,
    reviewsCount: 312,
    isFeatured: true,
    rawMaterials: [
      {
        id: 'rm-myo-inositol',
        name: 'مايو-إينوزيتول (درجة نقاء دوائية)',
        keyBenefits: [
          'محاكاة الرسائل الخلوية لاستيعاب الجلوكوز وإشارات الأنسولين.',
          'عنصر أساسي لنضوج البويضات الطبيعي واستجابة هرمون التبويض (FSH).',
        ],
      },
      {
        id: 'rm-d-chiro-inositol',
        name: 'دي-كايرو-إينوزيتول (D-Chiro-Inositol)',
        keyBenefits: [
          'تسهيل استهلاك الجلوكوز في الأنسجة المحيطية وتخليق الجليكوجين.',
          'تخفيض فرط الأندروجين المبيضي وتنظيم الدورة الشهرية.',
        ],
      },
      {
        id: 'rm-methyl-folate',
        name: 'إل-ميثيل فولات (Quatrefolic®)',
        keyBenefits: [
          'الجيل الرابع من الفولات الحيوي النشط لتجاوز طفرات جين MTHFR.',
          'دعم تكوين الحمض النووي وسلامة الخلايا التناسلية.',
        ],
      },
      {
        id: 'rm-coq10',
        name: 'إنزيم كيو 10 المساعد (CoQ10)',
        keyBenefits: [
          'تنشيط الميتوكوندريا وإنتاج الطاقة الخلوية (ATP) في البويضات.',
          'مضاد أكسدة قوي لحماية أغشية الحويصلات من الجذور الحرة.',
        ],
      },
    ],
    clinicalEvidences: [
      {
        id: 'ev-ino-1',
        journalName: 'المجلة الأوروبية للعلوم الطبية والدوائية',
        paperTitle: 'نسبة 40:1 من المايو والدي-كايرو إينوزيتول في علاج تكيس المبايض',
        year: 2023,
      },
    ],
  },
  {
    id: 'prod-folate-b12',
    slug: 'folate-b12',
    name: 'فولات بي 12 (Folate B12)',
    brandLine: 'Naturals 4be',
    category: 'Vitamins & Minerals',
    subtitle: 'امتصاص فائق وأقصى تأثير حيوي',
    arabicSubtitle: 'مكمل غذائي معتمد',
    tagline: 'فيتامينات B الحيوية المتطابقة بيولوجياً لدعم الجهاز العصبي وخلايا الدم.',
    description:
      'مكمل الفولات وفيتامين B12 المتطور بصورته الميثيلية النشطة مباشرة لخلايا الجسم، لدعم طاقة الخلايا، وتكوين كرات الدم الحمراء، وضبط مستويات الهوموسيستين وحماية الأعصاب.',
    packSizes: [
      { quantity: '30', unit: 'capsules', inStock: true },
      { quantity: '60', unit: 'capsules', inStock: true },
      { quantity: '90', unit: 'capsules', inStock: true },
    ],
    heroImage: '/brand/products/folate-b12.jpg',
    rating: 4.8,
    reviewsCount: 94,
    isFeatured: true,
    rawMaterials: [
      {
        id: 'rm-methylcobalamin',
        name: 'ميثيل كوبالامين (B12 النشط)',
        keyBenefits: [
          'الصورة الطبيعية لفيتامين B12 المستخدمة مباشرة في غمد الميالين العصبي.',
          'حماية الجهاز العصبي وزيادة التركيز واليقظة الذهنية.',
        ],
      },
      {
        id: 'rm-methyl-folate-b12',
        name: 'إل-ميثيل فولات النشط',
        keyBenefits: [
          'امتصاص فوري دون الحاجة إلى مراحل التحويل الكبدي المعقدة.',
          'تسريع إنتاج كريات الدم الحمراء السليمة والحفاظ على نضارة الأوعية.',
        ],
      },
    ],
    clinicalEvidences: [
      {
        id: 'ev-fol-1',
        journalName: 'ذا لانسيت لأمراض الدم (The Lancet Haematology)',
        paperTitle: 'التوافر الحيوي للفولات الميثيلي مقارنة بحمض الفوليك الصناعي',
        year: 2023,
      },
    ],
  },
  {
    id: 'prod-galacto-pure',
    slug: 'galacto-pure',
    name: 'جالاكتو بيور (Galacto Pure)',
    brandLine: 'Naturals 4be',
    category: 'Maternal Care',
    subtitle: 'نقاء طبيعي لإدرار حليب الأم والرضاعة',
    arabicSubtitle: 'مكمل غذائي معتمد',
    tagline: 'مستخلصات نباتية معيارية مدروسة سريرياً لتعزيز إدرار الحليب الطبيعي للأمهات.',
    description:
      'جالاكتو بيور حل طبيعي وآمن صُمم لدعم الأمهات خلال فترة الرضاعة، من خلال تحفيز إفراز هرمون البرولاكتين بشكل متوازن، مع تعزيز الهدوء العاطفي والراحة للأم والرضيع.',
    packSizes: [
      { quantity: '30', unit: 'capsules', inStock: true },
      { quantity: '60', unit: 'capsules', inStock: true },
      { quantity: '90', unit: 'capsules', inStock: true },
    ],
    heroImage: '/brand/products/galacto-pure.jpg',
    rating: 4.9,
    reviewsCount: 167,
    isFeatured: true,
    rawMaterials: [
      {
        id: 'rm-fenugreek-extract',
        name: 'مستخلص الحلبة المعاير بتقنية الميكرو-كبسولة',
        keyBenefits: [
          'معاير لمركبات السابونين المحفزة لهرمون البرولاكتين النخامي.',
          'خالٍ من الرائحة الحادة والاضطرابات الهضمية بفضل تقنية الكبسولات الدقيقة.',
        ],
      },
      {
        id: 'rm-fennel-seed',
        name: 'بذور الشمر الحلو (Foeniculum vulgare)',
        keyBenefits: [
          'مركبات الأنيثول المهدئة للمغص والغازات عند الأم والرضيع.',
          'دعم ارتخاء قنوات الحليب وتسهيل تدفقه بسلاسة.',
        ],
      },
    ],
    clinicalEvidences: [
      {
        id: 'ev-gal-1',
        journalName: 'طب الرضاعة الطبيعية (Breastfeeding Medicine)',
        paperTitle: 'المحفزات النباتية المعيارية في زيادة معدل إدرار الحليب بعد الولادة',
        year: 2023,
      },
    ],
  },
  {
    id: 'prod-vitakids-propolis',
    slug: 'vitakids-propolis',
    name: 'فيتا كيدز وبروبوليس (VitaKids & Propolis)',
    brandLine: 'Naturals 4be',
    category: 'Pediatrics & Immunity',
    subtitle: 'نمو صحي ومناعة فولاذية لصغارنا',
    arabicSubtitle: 'مكمل غذائي معتمد',
    tagline: 'شراب غني بعكبر النحل المنقى، 13 فيتاميناً أساسياً و4 معادن مخلبية.',
    description:
      'فيتا كيدز شراب متكامل بنكهة محببة للأطفال، معزز بعكبر النحل (البروبوليس) و13 فيتاميناً و4 معادن حيوية تدعم المناعة والنمو الذهني والبدني في السنوات التكوينية للطفل.',
    packSizes: [
      { quantity: '200 مل', unit: 'ml', inStock: true },
    ],
    heroImage: '/brand/products/vitakids.jpg',
    dosageInstructions: 'للأطفال من 3-6 سنوات: 5 مل يومياً. للأطفال من 7-12 سنة: 10 مل يومياً مع وجبة الإفطار.',
    rating: 4.9,
    reviewsCount: 220,
    isFeatured: true,
    rawMaterials: [
      {
        id: 'rm-propolis',
        name: 'مستخلص عكبر النحل المعاير (غني بالفلافونويد)',
        keyBenefits: [
          'حماية طبيعية مضادة للبكتيريا والفيروسات للجهاز التنفسي والأغشية المخاطية.',
          'غني بمركبات CAPE لتهدئة الشعب الهوائية وتخفيف نزلات البرد.',
        ],
      },
      {
        id: 'rm-pediatric-multivit',
        name: 'مجمع الفيتامينات والمعادن المخلبية (A, C, D3, Zinc, Iodine)',
        keyBenefits: [
          'معادن مخلبية بيسغلايسينات سهلة الامتصاص ولطيفة تماماً على معدة الأطفال.',
          'دعم نمو العظام الطبيعي وحدة البصر والذاكرة المناعية.',
        ],
      },
    ],
    clinicalEvidences: [
      {
        id: 'ev-vk-1',
        journalName: 'المجلة العالمية لطب الأطفال',
        paperTitle: 'البروبوليس الميكروني في الوقاية من عدوى الجهاز التنفسي لدى الأطفال',
        year: 2024,
      },
    ],
  },
];

export const MOCK_REVIEWS_AR: CustomerReview[] = [
  {
    id: 'rev-ar-sympdca-1',
    authorName: 'د. شريف المصري',
    authorRole: 'استشاري أمراض الجهاز الهضمي والكبد والمناظير',
    location: 'القاهرة، مصر',
    rating: 5,
    comment:
      'مستحضر SymPDCA من ميراج فارما قدم معادلة التآزر الذكي بين Saccharomyces boulardii (125 مجم) و LGG (15 مجم) بكفاءة إكلينيكية استثنائية في حالات القولون العصبي والانتفاخ واستعادة الفلورا المعوية بعد كورسات المضادات الحيوية.',
    productName: 'سيمبيدكا (SymPDCA)',
    date: '2026-10-15',
    verified: true,
  },
  {
    id: 'rev-ar-1',
    authorName: 'د. أحمد الشناوي',
    authorRole: 'استشاري أمراض الغدد الصماء والخصوبة',
    location: 'مستشفى دار الفؤاد، القاهرة',
    rating: 5,
    comment:
      'مستحضر Inositol 40:1 من مختبرات Naturals 4be أحدث نقلة ملحوظة في بروتوكول علاج متلازمة تكيس المبايض لدينا. النسبة الفسيولوجية الدقيقة ووجود CoQ10 يحسن الاستجابة التبويضية بشكل حقيقي ومثبت بالتحاليل المخبرية.',
    productName: 'إينوزيتول (Inositol 40:1)',
    date: '2026-09-14',
    verified: true,
  },
  {
    id: 'rev-ar-2',
    authorName: 'د. سارة عبد الرحمن',
    authorRole: 'أخصائية طب الأطفال وحديثي الولادة',
    location: 'مركز الإسكندرية الطبي التخصصي',
    rating: 5,
    comment:
      'دائماً ما أوصي بشراب VitaKids & Propolis للأطفال في موسم المدارس. تركيبة البروبوليس المنقى مع الفيتامينات خففت بشكل ملموس تكرار نزلات البرد والتهاب الحلق، فضلاً عن طعمه المقبول جداً وسهولة التزامه من قبل الأطفال.',
    productName: 'فيتا كيدز وبروبوليس (VitaKids & Propolis)',
    date: '2026-08-28',
    verified: true,
  },
  {
    id: 'rev-ar-3',
    authorName: 'د. طارق مصطفى',
    authorRole: 'استشاري جراحة المسالك وصحة الذكورة',
    location: 'المهندسين، الجيزة',
    rating: 5,
    comment:
      'تركيبة Man Edge النباتية صُممت بذكاء سريري عالٍ؛ الجمع بين الماكا والتريبولوس والأرجينين يوفر دعماً استثنائياً للطاقة الخلوية وتدفق الدم دون أي أضرار جانبية أو تذبذبات في الضغط الشرياني.',
    productName: 'مان إيدج (Man Edge)',
    date: '2026-07-22',
    verified: true,
  },
];
