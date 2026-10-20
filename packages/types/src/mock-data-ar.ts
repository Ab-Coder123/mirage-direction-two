import { Product, CustomerReview } from './catalog';

export const MOCK_PRODUCTS_AR: Product[] = [
  {
    id: 'prod-sympdca',
    slug: 'sympdca',
    name: 'SymPDCA',
    brandLine: 'Mirage Pharma',
    category: 'Gastrointestinal & Immunity',
    subtitle: 'المسار الموثوق طوال رحلة الجهاز الهضمي (The TRUSTED PATH Through GIT Journey)',
    arabicSubtitle: 'مكمل غذائي (Dietary Supplement)',
    tagline: '«مضاعفة الدفاعات» — الدرع المزدوج سريع المفعول لصحة الأمعاء ("Double the Defenses" — The Fast-Acting Dual Shield for Gut Health).',
    description:
      'يدعم عملية الهضم ويساعد في الحفاظ على الفلورا المعوية الطبيعية (Supports digestion & helps maintain a normal intestinal microflora).',
    priceInfo: 'سعر الشريط 200 ج.م (3 شرائط بالعبوة)',
    packagingDetails: '30 كبسولة جيلاتينية صلبة (3 شرائط بالعبوة)',
    synergyBanner: {
      title: 'قوة التآزر في SymPDCA (1 + 1 = 3) — "SMART SYNERGY RATIO"',
      badge: 'الضوء الأخضر دائماً (ALWAYS THE GREEN LIGHT)',
      description:
        'يقوم SymPDCA بحماية وتعزيز معدل بقاء بكتيريا Lactobacillus rhamnosus GG (LGG) بفاعلية أثناء مرورها عبر أحماض المعدة القاسية.',
    },
    clinicalIndications: [
      {
        title: 'التعافي بعد المضادات الحيوية (POST-ANTIBIOTIC RECOVERY)',
        description:
          'تشهد مصر تاريخياً معدلات مرتفعة لاستخدام المضادات الحيوية. يعيد SymPDCA الفلورا المعوية الطبيعية التي تتضرر بسبب كورسات المضادات الحيوية، مما يمنع الإسهال المصاحب للمضادات الحيوية.',
      },
      {
        title: 'القولون العصبي والانتفاخ (IRRITABLE BOWEL SYNDROME (IBS) & BLOATING)',
        description:
          'في مواجهة الوجبات المصرية التقليدية الدسمة (الغنية بالدهون، والبقوليات مثل الفول، والكربوهيدرات المصنعة) يقلل الانتفاخ والغازات وعدم انتظام حركة الأمعاء.',
      },
      {
        title: 'دعم الجهاز المناعي (IMMUNE SYSTEM SUPPORT)',
        description:
          'يتواجد 70% من الجهاز المناعي في الأمعاء. يعمل SymPDCA كخط دفاع يقوي المناعة الجهازية ضد العدوى التنفسية والمعوية الموسمية.',
      },
    ],
    packSizes: [
      { quantity: 30, unit: 'capsules', inStock: true },
    ],
    heroImage: '/brand/products/sympdca.webp',
    bottleImage: '/brand/products/sympdca.webp',
    boxImage: '/brand/products/sympdca.webp',
    rating: 5.0,
    reviewsCount: 284,
    isFeatured: true,
    rawMaterials: [
      {
        id: 'rm-sboulardii-ar',
        name: 'SACCHAROMYCES BOULARDII (125MG)',
        botanicalName: 'تركيز 125 مجم',
        keyBenefits: [
          'بفضل هذا التركيز: يرتبط مباشرة بمسببات الأمراض ويعادل السموم الميكروبية الخطيرة قبل أن تلحق الضرر بجدار الأمعاء.',
        ],
      },
      {
        id: 'rm-lgg-ar',
        name: 'LACTOBACILLUS RHAMNOSUS GG (15MG)',
        botanicalName: 'تركيز 15 مجم',
        keyBenefits: [
          'بفضل هذا التركيز: يسرع أوقات التعافي ويقلل الالتهابات الجهازية.',
          'يقوم SymPDCA بحماية وتعزيز معدل بقاء بكتيريا Lactobacillus rhamnosus GG (LGG) بفاعلية أثناء مرورها عبر أحماض المعدة القاسية.',
        ],
      },
    ],
    clinicalEvidences: [
      {
        id: 'ev-sympdca-ar-1',
        journalName: 'PubMed / National Library of Medicine',
        journalLogoText: 'PMID: 34190033',
        badgeColor: 'green',
        paperTitle:
          'المرجع الطبي المعتمد: https://pubmed.ncbi.nlm.nih.gov/34190033/',
        doiUrl: 'https://pubmed.ncbi.nlm.nih.gov/34190033/',
        keyFinding:
          'SymPDCA THE POWER OF SYNERGY (1 + 1 = 3) — A "SMART SYNERGY RATIO": يحمي ويعزز معدل بقاء Lactobacillus rhamnosus GG (LGG) أثناء مرورها عبر أحماض المعدة القاسية.',
      },
    ],
  },
  {
    id: 'prod-novamirage',
    slug: 'novamirage',
    name: 'NOVAMIRAGE 20MG',
    brandLine: 'Mirage Pharma',
    category: 'Acid Suppression (P-CAB)',
    subtitle: 'الجيل الجديد في تثبيط الحموضة: تطور حاصرات الحمض التنافسية للبوتاسيوم (THE P-CABS EVOLUTION)',
    arabicSubtitle: 'Vonoprazan 20 mg • أقراص مغلفة',
    tagline: 'عندما تهاجمك الحموضة — اعبر من بوابة NOVAMIRAGE (Vonoprazan 20 mg) GATE',
    description:
      'يُعد NOVAMIRAGE 20MG جيلاً متطوراً من حاصرات الحمض التنافسية للبوتاسيوم (P-CAB) المصممة لتحقيق سيطرة سريعة ومستدامة ويمكن التنبؤ بها على الاضطرابات المرتبطة بالحموضة، متجاوزاً قيود مثبطات مضخة البروتون التقليدية (PPIs). يُستخدم في علاج قرحة المعدة، والتهاب المريء الارتجاعي، ومنع انتكاسهما.',
    priceInfo: 'سعر الشريط 70 ج.م (شريطان بالعبوة)',
    packagingDetails: '14 قرصاً مغلفاً قابلاً للتقسيم (شريطان بالعبوة)',
    dosageInstructions:
      'يجب تناول القرص كاملاً دون تقسيم (Tablet should be taken as whole without division). يمكن تناوله مع الطعام أو بدونه، مما يرفع التزام المريض بالعلاج بشكل ملحوظ.',
    synergyBanner: {
      title: 'آلية العمل الثورية لمستحضر NOVAMIRAGE 20MG (THE REVOLUTIONARY MODE OF ACTION)',
      badge: 'تثبيط سريع لمضخة البروتون (H+/K+-ATPase)',
      description:
        'على عكس مثبطات مضخة البروتون التقليدية (PPIs): يرتبط NOVAMIRAGE 20MG بشكل تنافسي وعكسي مباشرة بأيونات البوتاسيوم (K+) في نظام إنزيم H+/K+-ATPase ليمنع إفراز الحمض فوراً؛ ولا يتطلب تنشيطاً بالحمض (مستقر بطبيعته في البيئات الحمضية ويتركز حتى 100,000 ضعف داخل القنيات الإفرازية للخلايا الجدارية سواء كانت المضخة نشطة أو في حالة راحة)؛ ولا يتأثر بالطعام.',
    },
    clinicalIndications: [
      {
        title: 'شفاء التهاب المريء التآكلي والارتجاع المعدي المريئي (Healing of Erosive Esophagitis / GERD)',
        description:
          'الجرعة: 20 مجم مرة واحدة يومياً لمدة 4 إلى 8 أسابيع. يحقق معدلات شفاء تتجاوز 95%؛ متفوق تماماً على مثبطات PPI منذ الأسبوع الأول.',
      },
      {
        title: 'قرحة المعدة (Gastric Ulcer - GU)',
        description:
          'الجرعة: 20 مجم مرة واحدة يومياً لمدة 4 إلى 8 أسابيع. يوفر استعادة سريعة للغشاء المخاطي وتسكيناً فورياً للألم.',
      },
      {
        title: 'علاج القضاء على جرثومة المعدة (H. pylori Eradication Therapy - كعلاج مساعد)',
        description:
          'الجرعة: 20 مجم مرتين يومياً (BID) لمدة 14 يوماً (بالتزامن مع المضادات الحيوية مثل Amoxicillin و Clarithromycin/Metronidazole). يحافظ على درجة حموضة معدية مستقرة (pH > 6.0)، مما يعظم ثبات المضادات الحيوية ويرفع نسب نجاح القضاء على الجرثومة حتى في السلالات المقاومة لـ PPI.',
      },
    ],
    packSizes: [
      { quantity: 14, unit: 'tablets', inStock: true },
    ],
    heroImage: '/brand/products/novamirage.webp',
    bottleImage: '/brand/products/novamirage.webp',
    boxImage: '/brand/products/novamirage.webp',
    rating: 5.0,
    reviewsCount: 312,
    isFeatured: true,
    rawMaterials: [
      {
        id: 'rm-vonoprazan-moa-ar',
        name: 'VONOPRAZAN 20 MG — آلية عمل P-CAB المتطورة',
        botanicalName: 'Vonoprazan 20 mg Scored Film-Coated Tablet',
        keyBenefits: [
          'ارتباط تنافسي وعكسي (Binds Competitively & Reversibly): يرتبط مباشرة بأيونات البوتاسيوم (K+) على إنزيم H+/K+-ATPase ليمنع إفراز الحمض على الفور.',
          'لا يتطلب تنشيطاً بالحمض (Does Not Require Acid Activation): مستقر بطبيعته في البيئات الحمضية، ويتركز حتى 100,000 ضعف داخل القنيات الإفرازية للخلايا الجدارية ليعمل سواء كانت المضخة نشطة أو في حالة راحة.',
          'مستقل عن الطعام (Food Independent): يمكن تناوله مع الطعام أو بدونه، مما يزيد بشكل كبير من التزام المرضى.',
        ],
        mechanism:
          'حاصر تنافسي متطور للبوتاسيوم (P-CAB) يعمل بآلية التثبيط السريع لمضخة البروتون (H+/K+-ATPase) للتحكم السريع والمستدام في الاضطرابات المرتبطة بالحموضة.',
      },
      {
        id: 'rm-vonoprazan-whyrx-ar',
        name: 'لماذا توصف تركيبة NOVAMIRAGE 20MG؟ (WHY RX NOVAMIRAGE 20MG?)',
        botanicalName: 'التفوق الإكلينيكي مقارنة بمثبطات PPI التقليدية',
        keyBenefits: [
          '1: سرعة المفعول من الجرعة الأولى (Speed of Action) — يحقق أقصى تثبيط للحمض من اليوم الأول (DAY 1)، ويصل إلى مفعوله الكامل خلال ساعات من أول جرعة.',
          '2: تحكم مستمر على مدار 24 ساعة (24-Hour Continuous Control) — يحافظ على درجة pH معدية مرتفعة مما يضمن نوماً هادئاً طوال الليل لمرضى الارتجاع المريئي (GERD).',
          '3: مسار أيضي يمكن التنبؤ به (Predictable Metabolic Profile) — يتم استقلابه بشكل أساسي بواسطة إنزيم CYP3A4، متجاوزاً مسار CYP2C19 المتقلب جينياً، مما يمنح فاعلية إكلينيكية ثابتة لجميع المرضى.',
          '4: تفوق في القضاء على جرثومة المعدة (Superior H. pylori Eradication) — غالباً ما تفشل مثبطات PPI التقليدية بسبب عدم استقرار pH المعدة؛ بينما يخلق NOVAMIRAGE 20MG بيئة متعادلة قوية ومستدامة تسمح لـ Amoxicillin و Clarithromycin بالقضاء على البكتيريا بفاعلية.',
        ],
        mechanism:
          'لماذا تقصر مثبطات PPI التقليدية؟ تتطلب مثبطات PPI من 3 إلى 5 أيام للوصول إلى التثبيط المستقر للحمض؛ ويجب تناولها بدقة قبل الوجبة الأولى بـ 30–60 دقيقة؛ كما أن التعدد الجيني لإنزيم CYP2C19 يجعل استجابتها غير متوقعة؛ وتفشل غالباً في السيطرة على إفراز الحمض الليلي.',
      },
    ],
    clinicalEvidences: [
      {
        id: 'ev-novamirage-ar-1',
        journalName: 'Therapeutic Advances in Gastroenterology (PMC10268044)',
        journalLogoText: 'DOI: 10.1177/1756283X17745776',
        badgeColor: 'blue',
        year: 2018,
        paperTitle:
          'Vonoprazan fumarate, a novel potassium competitive acid blocker, in the management of gastroesophageal reflux disease: Safety and clinical evidence to date',
        doiUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10268044',
        keyFinding:
          'Therapeutic Advances in Gastroenterology -- January 2018; 11:1756283X17745776. DOI: 10.1177/1756283X17745776.',
      },
      {
        id: 'ev-novamirage-ar-2',
        journalName: 'Mayo Clinic Drug & Supplement Monograph',
        journalLogoText: 'DRG-20559712',
        badgeColor: 'cyan',
        paperTitle:
          'Vonoprazan (Oral Route) — المرجع الدوائي من Mayo Clinic: https://www.mayoclinic.org/drugs-supplements/vonoprazan-oral-route/description/drg-20559712',
        doiUrl: 'https://www.mayoclinic.org/drugs-supplements/vonoprazan-oral-route/description/drg-20559712',
        keyFinding:
          'التوصيف الدوائي والإكلينيكي المعتمد لمادة الفونوبرازان (Vonoprazan) عن طريق الفم.',
      },
      {
        id: 'ev-novamirage-ar-3',
        journalName: 'NHS Health Research Authority & JNM Journal',
        journalLogoText: 'DOI: 10.5056/jnm18029',
        badgeColor: 'green',
        paperTitle:
          'A Phase 3 Study of Vonoprazan in Patients with Erosive Esophagitis (NHS HRA) & JNM Review (doi=10.5056/jnm18029)',
        doiUrl: 'https://www.jnmjournal.org/journal/view.html?doi=10.5056/jnm18029',
        keyFinding:
          'مرجع هيئة الأبحاث الصحية البريطانية (NHS): https://www.hra.nhs.uk/planning-and-improving-research/application-summaries/research-summaries/a-phase-3-study-of-vonoprazan-in-patients-with-erosive-esophagitis/',
      },
    ],
  },
];

export const MOCK_REVIEWS_AR: CustomerReview[] = [];
