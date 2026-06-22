// ---------------------------------------------------------------------------
// Mock company data for E2E tests
//
// Provides deterministic mock companies, stores, and company contacts
// so E2E tests don't depend on the production database.
//
// IMPORTANT: This is MOCK data only — no real company information.
// All data is generated for test purposes only.
// ---------------------------------------------------------------------------

// ── Company data ─────────────────────────────────────────────────────────

export interface MockCompany {
  company_id: number;
  company_name: string;
  company_common_name_en: string;
  company_common_name_ar: string;
  company_email: string;
  company_website: string;
  company_description_en: string;
  company_description_ar: string;
  company_hourly_rate: number;
  company_status: "active" | "inactive";
  country_id: number;
  total_candidates: number;
  no_of_active_requests: number;
  deleted: number;
  stores: MockStore[];
}

export interface MockStore {
  store_id: number;
  store_name: string;
  store_location: string;
  store_status: number;
  total_candidates: number;
  store_manager_name: string;
  store_manager_phone: string;
}

export const COMPANIES: MockCompany[] = [
  {
    company_id: 2001,
    company_name: "Kuwait National Petroleum Company",
    company_common_name_en: "KNPC",
    company_common_name_ar: "شركة البترول الوطنية الكويتية",
    company_email: "hr@knpc.test.studenthub.ai",
    company_website: "https://www.knpc.com.kw",
    company_description_en:
      "Largest oil and gas company in Kuwait, offering internships and graduate programs.",
    company_description_ar:
      "أكبر شركة نفط وغاز في الكويت، تقدم برامج تدريب وتوظيف للخريجين.",
    company_hourly_rate: 5.000,
    company_status: "active",
    country_id: 1,
    total_candidates: 150,
    no_of_active_requests: 5,
    deleted: 0,
    stores: [
      {
        store_id: 3001,
        store_name: "KNPC Head Office - Ahmadi",
        store_location: "Ahmadi, Kuwait",
        store_status: 10,
        total_candidates: 45,
        store_manager_name: "Faisal Al-Ghanim",
        store_manager_phone: "+965 5111-3001",
      },
      {
        store_id: 3002,
        store_name: "KNPC Mina Al-Ahmadi Refinery",
        store_location: "Mina Al-Ahmadi, Kuwait",
        store_status: 10,
        total_candidates: 60,
        store_manager_name: "Abdullah Al-Mutairi",
        store_manager_phone: "+965 5111-3002",
      },
    ],
  },
  {
    company_id: 2002,
    company_name: "Alshaya Group",
    company_common_name_en: "Alshaya",
    company_common_name_ar: "مجموعة الشايع",
    company_email: "recruitment@alshaya.test.studenthub.ai",
    company_website: "https://www.alshaya.com",
    company_description_en:
      "Leading international franchise operator in the Middle East with retail, food, and hospitality brands.",
    company_description_ar:
      "أكبر مشغل امتياز تجاري في الشرق الأوسط مع علامات تجارية في التجزئة والمطاعم والضيافة.",
    company_hourly_rate: 3.500,
    company_status: "active",
    country_id: 1,
    total_candidates: 320,
    no_of_active_requests: 12,
    deleted: 0,
    stores: [
      {
        store_id: 3003,
        store_name: "Alshaya - The Avenues Mall",
        store_location: "The Avenues, Kuwait City",
        store_status: 10,
        total_candidates: 35,
        store_manager_name: "Hessa Al-Sabah",
        store_manager_phone: "+965 5111-3003",
      },
      {
        store_id: 3004,
        store_name: "Alshaya - 360 Mall",
        store_location: "360 Mall, Kuwait City",
        store_status: 10,
        total_candidates: 28,
        store_manager_name: "Khalid Al-Rashid",
        store_manager_phone: "+965 5111-3004",
      },
      {
        store_id: 3005,
        store_name: "Alshaya Corporate Office",
        store_location: "Sharq, Kuwait City",
        store_status: 10,
        total_candidates: 50,
        store_manager_name: "Layla Al-Hamad",
        store_manager_phone: "+965 5111-3005",
      },
    ],
  },
  {
    company_id: 2003,
    company_name: "Zain Telecommunications",
    company_common_name_en: "Zain",
    company_common_name_ar: "زين للاتصالات",
    company_email: "careers@zain.test.studenthub.ai",
    company_website: "https://www.zain.com",
    company_description_en:
      "Leading mobile network operator in Kuwait with digital innovation programs.",
    company_description_ar:
      "أكبر مشغل للهواتف المتحركة في الكويت مع برامج الابتكار الرقمي.",
    company_hourly_rate: 4.500,
    company_status: "active",
    country_id: 1,
    total_candidates: 85,
    no_of_active_requests: 3,
    deleted: 0,
    stores: [
      {
        store_id: 3006,
        store_name: "Zain Headquarters",
        store_location: "Shuwaikh, Kuwait City",
        store_status: 10,
        total_candidates: 30,
        store_manager_name: "Nawaf Al-Abdulkarim",
        store_manager_phone: "+965 5111-3006",
      },
    ],
  },
  {
    company_id: 2004,
    company_name: "Kuwait Airways",
    company_common_name_en: "Kuwait Airways",
    company_common_name_ar: "الخطوط الجوية الكويتية",
    company_email: "recruitment@kuwaitairways.test.studenthub.ai",
    company_website: "https://www.kuwaitairways.com",
    company_description_en:
      "National airline of Kuwait offering ground staff and cabin crew positions.",
    company_description_ar:
      "شركة الطيران الوطنية الكويتية تقدم وظائف أرضية ومضيفات جوية.",
    company_hourly_rate: 4.000,
    company_status: "active",
    country_id: 1,
    total_candidates: 120,
    no_of_active_requests: 7,
    deleted: 0,
    stores: [
      {
        store_id: 3007,
        store_name: "Kuwait International Airport Terminal",
        store_location: "Farwaniya, Kuwait",
        store_status: 10,
        total_candidates: 40,
        store_manager_name: "Ali Al-Yousef",
        store_manager_phone: "+965 5111-3007",
      },
    ],
  },
  {
    company_id: 2005,
    company_name: "Gulf Bank",
    company_common_name_en: "Gulf Bank",
    company_common_name_ar: "بنك الخليج",
    company_email: "hr@gulfbank.test.studenthub.ai",
    company_website: "https://www.gulfbank.com",
    company_description_en:
      "One of Kuwait's largest banks with internship and graduate programs.",
    company_description_ar:
      "أحد أكبر البنوك في الكويت مع برامج تدريب وتوظيف للخريجين.",
    company_hourly_rate: 4.250,
    company_status: "active",
    country_id: 1,
    total_candidates: 65,
    no_of_active_requests: 4,
    deleted: 0,
    stores: [
      {
        store_id: 3008,
        store_name: "Gulf Bank Head Office",
        store_location: "Kuwait City, Sharq",
        store_status: 10,
        total_candidates: 25,
        store_manager_name: "Mona Al-Ali",
        store_manager_phone: "+965 5111-3008",
      },
    ],
  },
  {
    company_id: 2006,
    company_name: "FoodCo Trading",
    company_common_name_en: "FoodCo",
    company_common_name_ar: "فودكو للتجارة",
    company_email: "jobs@foodco.test.studenthub.ai",
    company_website: "https://www.foodco.com.kw",
    company_description_en:
      "Food and beverage distribution company with multiple retail outlets.",
    company_description_ar:
      "شركة توزيع أغذية ومشروبات مع فروع تجزئة متعددة.",
    company_hourly_rate: 2.750,
    company_status: "active",
    country_id: 1,
    total_candidates: 40,
    no_of_active_requests: 2,
    deleted: 0,
    stores: [
      {
        store_id: 3009,
        store_name: "FoodCo - Salmiya Branch",
        store_location: "Salmiya, Block 3",
        store_status: 10,
        total_candidates: 12,
        store_manager_name: "Ahmed Al-Bader",
        store_manager_phone: "+965 5111-3009",
      },
      {
        store_id: 3010,
        store_name: "FoodCo - Farwaniya Warehouse",
        store_location: "Farwaniya Industrial Area",
        store_status: 10,
        total_candidates: 8,
        store_manager_name: "Mohammed Al-Saleh",
        store_manager_phone: "+965 5111-3010",
      },
    ],
  },
  {
    company_id: 2007,
    company_name: "Inactive Test Company",
    company_common_name_en: "InactiveCo",
    company_common_name_ar: "شركة اختبار غير نشطة",
    company_email: "inactive@test.studenthub.ai",
    company_website: "",
    company_description_en: "Inactive company for filter tests.",
    company_description_ar: "شركة غير نشطة لاختبارات التصفية.",
    company_hourly_rate: 0,
    company_status: "inactive",
    country_id: 1,
    total_candidates: 0,
    no_of_active_requests: 0,
    deleted: 1,
    stores: [],
  },
  {
    company_id: 2008,
    company_name: "Deleted Test Company",
    company_common_name_en: "DeletedCo",
    company_common_name_ar: "شركة اختبار محذوفة",
    company_email: "deleted@test.studenthub.ai",
    company_website: "",
    company_description_en: "Deleted company for filter tests.",
    company_description_ar: "شركة محذوفة لاختبارات التصفية.",
    company_hourly_rate: 0,
    company_status: "inactive",
    country_id: 1,
    total_candidates: 0,
    no_of_active_requests: 0,
    deleted: 1,
    stores: [],
  },
];

// ── Company Contacts ─────────────────────────────────────────────────────

export interface MockCompanyContact {
  company_contact_uuid: string;
  company_id: number;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contact_position: string;
  allow_access: boolean;
}

export const COMPANY_CONTACTS: MockCompanyContact[] = [
  {
    company_contact_uuid: "contact-2001-0001-0001-000000000001",
    company_id: 2001,
    contact_name: "Hamed Al-Sabah",
    contact_email: "hamed@knpc.test.studenthub.ai",
    contact_phone: "+965 5111-2101",
    contact_position: "HR Director",
    allow_access: true,
  },
  {
    company_contact_uuid: "contact-2001-0001-0001-000000000002",
    company_id: 2001,
    contact_name: "Sara Al-Mutairi",
    contact_email: "sara@knpc.test.studenthub.ai",
    contact_phone: "+965 5111-2102",
    contact_position: "Recruitment Officer",
    allow_access: true,
  },
  {
    company_contact_uuid: "contact-2002-0001-0001-000000000001",
    company_id: 2002,
    contact_name: "Omar Al-Marzouq",
    contact_email: "omar@alshaya.test.studenthub.ai",
    contact_phone: "+965 5111-2201",
    contact_position: "Talent Acquisition Manager",
    allow_access: true,
  },
  {
    company_contact_uuid: "contact-2003-0001-0001-000000000001",
    company_id: 2003,
    contact_name: "Noura Al-Khalid",
    contact_email: "noura@zain.test.studenthub.ai",
    contact_phone: "+965 5111-2301",
    contact_position: "HR Business Partner",
    allow_access: true,
  },
  {
    company_contact_uuid: "contact-2006-0001-0001-000000000001",
    company_id: 2006,
    contact_name: "Tariq Al-Faraj",
    contact_email: "tariq@foodco.test.studenthub.ai",
    contact_phone: "+965 5111-2601",
    contact_position: "Operations Manager",
    allow_access: false,
  },
];

// ── Helper functions ─────────────────────────────────────────────────────

/** Get active companies (not deleted) */
export function getActiveCompanies(): MockCompany[] {
  return COMPANIES.filter((c) => c.deleted === 0);
}

/** Get a company by ID */
export function getCompanyById(id: number): MockCompany | undefined {
  return COMPANIES.find((c) => c.company_id === id);
}

/** Get a company's stores */
export function getStoresForCompany(companyId: number): MockStore[] {
  const company = getCompanyById(companyId);
  return company?.stores ?? [];
}

/** Get company contacts that have access */
export function getActiveContacts(): MockCompanyContact[] {
  return COMPANY_CONTACTS.filter((c) => c.allow_access);
}
