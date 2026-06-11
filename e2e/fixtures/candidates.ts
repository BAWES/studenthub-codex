// ---------------------------------------------------------------------------
// Mock candidate data for E2E search/filter tests
//
// These fixtures provide deterministic, realistic-but-fake candidate data
// so E2E tests don't depend on the production database.
//
// IMPORTANT: This is MOCK data only — no real candidate information.
// All data is generated for test purposes only.
// ---------------------------------------------------------------------------

export interface MockCandidate {
  candidate_id: number;
  candidate_uid: string;
  candidate_name: string;
  candidate_name_ar: string;
  candidate_email: string;
  candidate_phone: string;
  candidate_gender: number;
  candidate_status: number;
  candidate_job_search_status: number;
  candidate_committed: boolean;
  candidate_created_at: string;
  candidate_updated_at: string;
  country_id: number;
  country_name?: string;
  area_name?: string;
  candidate_birth_date: string;
  candidate_hourly_rate: number;
  candidate_objective: string;
  skills: string[];
  universities: string[];
  is_incomplete_profile: boolean;
  deleted: number;
}

// ── Countries ─────────────────────────────────────────────────────────────
export interface MockCountry {
  country_id: number;
  country_name_en: string;
  country_name_ar: string;
}

export const COUNTRIES: MockCountry[] = [
  { country_id: 1, country_name_en: "Kuwait", country_name_ar: "الكويت" },
  { country_id: 2, country_name_en: "Egypt", country_name_ar: "مصر" },
  { country_id: 3, country_name_en: "India", country_name_ar: "الهند" },
  { country_id: 4, country_name_en: "Philippines", country_name_ar: "الفلبين" },
  { country_id: 5, country_name_en: "Bangladesh", country_name_ar: "بنغلاديش" },
  { country_id: 6, country_name_en: "Sri Lanka", country_name_ar: "سريلانكا" },
  { country_id: 7, country_name_en: "Syria", country_name_ar: "سوريا" },
  { country_id: 8, country_name_en: "Jordan", country_name_ar: "الأردن" },
];

// ── Areas ─────────────────────────────────────────────────────────────────
export interface MockArea {
  area_uuid: string;
  area_name_en: string;
  area_name_ar: string;
  country_id: number;
}

export const AREAS: MockArea[] = [
  { area_uuid: "area-kuwait-city", area_name_en: "Kuwait City", area_name_ar: "مدينة الكويت", country_id: 1 },
  { area_uuid: "area-salmiya", area_name_en: "Salmiya", area_name_ar: "السالمية", country_id: 1 },
  { area_uuid: "area-farwaniya", area_name_en: "Farwaniya", area_name_ar: "الفروانية", country_id: 1 },
  { area_uuid: "area-hawally", area_name_en: "Hawally", area_name_ar: "حولي", country_id: 1 },
  { area_uuid: "area-ahmadi", area_name_en: "Ahmadi", area_name_ar: "الأحمدي", country_id: 1 },
  { area_uuid: "area-jahra", area_name_en: "Jahra", area_name_ar: "الجهراء", country_id: 1 },
  { area_uuid: "area-cairo", area_name_en: "Cairo", area_name_ar: "القاهرة", country_id: 2 },
  { area_uuid: "area-mumbai", area_name_en: "Mumbai", area_name_ar: "مومباي", country_id: 3 },
  { area_uuid: "area-manila", area_name_en: "Manila", area_name_ar: "مانيلا", country_id: 4 },
  { area_uuid: "area-dhaka", area_name_en: "Dhaka", area_name_ar: "دكا", country_id: 5 },
  { area_uuid: "area-colombo", area_name_en: "Colombo", area_name_ar: "كولومبو", country_id: 6 },
  { area_uuid: "area-damascus", area_name_en: "Damascus", area_name_ar: "دمشق", country_id: 7 },
  { area_uuid: "area-amman", area_name_en: "Amman", area_name_ar: "عمان", country_id: 8 },
];

// ── Mock Candidates ───────────────────────────────────────────────────────
// 40 candidates with varied attributes for search/filter/paginate tests.
// Status codes: 10=active, 20=inactive, 30=blocked, 40=pending
// Job search status: 1=actively looking, 2=open, 3=not looking

const now = new Date();
const isoDate = (daysAgo: number): string => {
  const d = new Date(now.getTime() - daysAgo * 86400000);
  return d.toISOString();
};

export const CANDIDATES: MockCandidate[] = [
  // ── Active Kuwaiti candidates ──
  {
    candidate_id: 1001, candidate_uid: "C1001",
    candidate_name: "Ahmed Al-Mutairi", candidate_name_ar: "أحمد المطيري",
    candidate_email: "ahmed.almutairi@test.studenthub.ai", candidate_phone: "+965 5111-0001",
    candidate_gender: 1, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: true,
    candidate_created_at: isoDate(120), candidate_updated_at: isoDate(2),
    country_id: 1, country_name: "Kuwait", area_name: "Kuwait City",
    candidate_birth_date: "1998-03-15", candidate_hourly_rate: 3.500,
    candidate_objective: "Software developer seeking part-time opportunities",
    skills: ["JavaScript", "React", "Python"], universities: ["Kuwait University"],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1002, candidate_uid: "C1002",
    candidate_name: "Nora Al-Sabah", candidate_name_ar: "نورا الصباح",
    candidate_email: "nora.alsabah@test.studenthub.ai", candidate_phone: "+965 5111-0002",
    candidate_gender: 2, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: true,
    candidate_created_at: isoDate(90), candidate_updated_at: isoDate(5),
    country_id: 1, country_name: "Kuwait", area_name: "Salmiya",
    candidate_birth_date: "2000-07-22", candidate_hourly_rate: 4.000,
    candidate_objective: "Marketing graduate looking for digital marketing roles",
    skills: ["Marketing", "Social Media", "Content Writing"],
    universities: ["American University of Kuwait"],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1003, candidate_uid: "C1003",
    candidate_name: "Fahad Al-Enezi", candidate_name_ar: "فهد العنزي",
    candidate_email: "fahad.alenezi@test.studenthub.ai", candidate_phone: "+965 5111-0003",
    candidate_gender: 1, candidate_status: 10, candidate_job_search_status: 2,
    candidate_committed: true,
    candidate_created_at: isoDate(200), candidate_updated_at: isoDate(10),
    country_id: 1, country_name: "Kuwait", area_name: "Farwaniya",
    candidate_birth_date: "1997-11-01", candidate_hourly_rate: 2.750,
    candidate_objective: "Engineering student available for internships",
    skills: ["AutoCAD", "Civil Engineering", "Project Management"],
    universities: ["Kuwait University"],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1004, candidate_uid: "C1004",
    candidate_name: "Laila Al-Ajmi", candidate_name_ar: "ليلى العجمي",
    candidate_email: "laila.alajmi@test.studenthub.ai", candidate_phone: "+965 5111-0004",
    candidate_gender: 2, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: true,
    candidate_created_at: isoDate(60), candidate_updated_at: isoDate(1),
    country_id: 1, country_name: "Kuwait", area_name: "Hawally",
    candidate_birth_date: "2001-02-14", candidate_hourly_rate: 3.250,
    candidate_objective: "Graphic designer with UI/UX experience",
    skills: ["Figma", "Adobe Photoshop", "UI/UX Design"],
    universities: ["American University of the Middle East"],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1005, candidate_uid: "C1005",
    candidate_name: "Khalid Al-Rashidi", candidate_name_ar: "خالد الرشيدي",
    candidate_email: "khalid.alrashidi@test.studenthub.ai", candidate_phone: "+965 5111-0005",
    candidate_gender: 1, candidate_status: 10, candidate_job_search_status: 2,
    candidate_committed: true,
    candidate_created_at: isoDate(150), candidate_updated_at: isoDate(30),
    country_id: 1, country_name: "Kuwait", area_name: "Ahmadi",
    candidate_birth_date: "1999-09-30", candidate_hourly_rate: 5.000,
    candidate_objective: "Computer science graduate with data analysis skills",
    skills: ["Python", "SQL", "Data Analysis", "Tableau"],
    universities: ["Kuwait University"],
    is_incomplete_profile: false, deleted: 0,
  },

  // ── Expat candidates (varied countries) ──
  {
    candidate_id: 1010, candidate_uid: "C1010",
    candidate_name: "Mohamed Ali", candidate_name_ar: "محمد علي",
    candidate_email: "mohamed.ali@test.studenthub.ai", candidate_phone: "+20 100-000-0010",
    candidate_gender: 1, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: false,
    candidate_created_at: isoDate(80), candidate_updated_at: isoDate(15),
    country_id: 2, country_name: "Egypt", area_name: "Cairo",
    candidate_birth_date: "1996-05-20", candidate_hourly_rate: 2.000,
    candidate_objective: "Experienced accountant looking for opportunities in Kuwait",
    skills: ["Accounting", "Excel", "QuickBooks"],
    universities: ["Cairo University"],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1011, candidate_uid: "C1011",
    candidate_name: "Raj Patel", candidate_name_ar: "راج باتيل",
    candidate_email: "raj.patel@test.studenthub.ai", candidate_phone: "+91 9999-000011",
    candidate_gender: 1, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: false,
    candidate_created_at: isoDate(95), candidate_updated_at: isoDate(7),
    country_id: 3, country_name: "India", area_name: "Mumbai",
    candidate_birth_date: "1995-08-12", candidate_hourly_rate: 1.750,
    candidate_objective: "IT support specialist with 3 years experience",
    skills: ["IT Support", "Networking", "Linux"],
    universities: ["University of Mumbai"],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1012, candidate_uid: "C1012",
    candidate_name: "Maria Santos", candidate_name_ar: "ماريا سانتوس",
    candidate_email: "maria.santos@test.studenthub.ai", candidate_phone: "+63 917-000-0012",
    candidate_gender: 2, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: false,
    candidate_created_at: isoDate(70), candidate_updated_at: isoDate(3),
    country_id: 4, country_name: "Philippines", area_name: "Manila",
    candidate_birth_date: "1997-12-01", candidate_hourly_rate: 1.500,
    candidate_objective: "Registered nurse seeking healthcare positions",
    skills: ["Nursing", "Patient Care", "First Aid"],
    universities: ["University of Santo Tomas"],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1013, candidate_uid: "C1013",
    candidate_name: "Hasan Rahman", candidate_name_ar: "حسن رحمن",
    candidate_email: "hasan.rahman@test.studenthub.ai", candidate_phone: "+880 1700-000013",
    candidate_gender: 1, candidate_status: 10, candidate_job_search_status: 2,
    candidate_committed: false,
    candidate_created_at: isoDate(110), candidate_updated_at: isoDate(20),
    country_id: 5, country_name: "Bangladesh", area_name: "Dhaka",
    candidate_birth_date: "1994-04-18", candidate_hourly_rate: 1.250,
    candidate_objective: "Construction worker experienced in building maintenance",
    skills: ["Construction", "Maintenance", "Welding"],
    universities: [],
    is_incomplete_profile: true, deleted: 0,
  },
  {
    candidate_id: 1014, candidate_uid: "C1014",
    candidate_name: "Samantha Perera", candidate_name_ar: "سامانثا بيريرا",
    candidate_email: "samantha.perera@test.studenthub.ai", candidate_phone: "+94 770-000-014",
    candidate_gender: 2, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: false,
    candidate_created_at: isoDate(85), candidate_updated_at: isoDate(8),
    country_id: 6, country_name: "Sri Lanka", area_name: "Colombo",
    candidate_birth_date: "1998-06-25", candidate_hourly_rate: 2.250,
    candidate_objective: "Admin assistant with strong organizational skills",
    skills: ["Administration", "Microsoft Office", "Communication"],
    universities: ["University of Colombo"],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1015, candidate_uid: "C1015",
    candidate_name: "Layla Al-Asaad", candidate_name_ar: "ليلى الأسعد",
    candidate_email: "layla.asaad@test.studenthub.ai", candidate_phone: "+963 930-000-015",
    candidate_gender: 2, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: false,
    candidate_created_at: isoDate(55), candidate_updated_at: isoDate(4),
    country_id: 7, country_name: "Syria", area_name: "Damascus",
    candidate_birth_date: "1999-01-10", candidate_hourly_rate: 2.500,
    candidate_objective: "English teacher looking for tutoring roles",
    skills: ["Teaching", "English", "Curriculum Design"],
    universities: ["Damascus University"],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1016, candidate_uid: "C1016",
    candidate_name: "Ahmad Khalil", candidate_name_ar: "أحمد خليل",
    candidate_email: "ahmad.khalil@test.studenthub.ai", candidate_phone: "+962 790-000-016",
    candidate_gender: 1, candidate_status: 10, candidate_job_search_status: 3,
    candidate_committed: false,
    candidate_created_at: isoDate(130), candidate_updated_at: isoDate(60),
    country_id: 8, country_name: "Jordan", area_name: "Amman",
    candidate_birth_date: "1993-10-05", candidate_hourly_rate: 3.000,
    candidate_objective: "Sales representative with retail experience",
    skills: ["Sales", "Customer Service", "Retail"],
    universities: ["University of Jordan"],
    is_incomplete_profile: false, deleted: 0,
  },

  // ── Candidates with different statuses ──
  {
    candidate_id: 1020, candidate_uid: "C1020",
    candidate_name: "Inactive User One", candidate_name_ar: "مستخدم غير نشط",
    candidate_email: "inactive1@test.studenthub.ai", candidate_phone: "+965 5111-0020",
    candidate_gender: 1, candidate_status: 20, candidate_job_search_status: 3,
    candidate_committed: false,
    candidate_created_at: isoDate(300), candidate_updated_at: isoDate(100),
    country_id: 1, country_name: "Kuwait", area_name: "Jahra",
    candidate_birth_date: "1990-12-01", candidate_hourly_rate: 0,
    candidate_objective: "", skills: [], universities: [],
    is_incomplete_profile: true, deleted: 0,
  },
  {
    candidate_id: 1021, candidate_uid: "C1021",
    candidate_name: "Blocked Account Test", candidate_name_ar: "حساب محظور",
    candidate_email: "blocked@test.studenthub.ai", candidate_phone: "+965 5111-0021",
    candidate_gender: 2, candidate_status: 30, candidate_job_search_status: 3,
    candidate_committed: false,
    candidate_created_at: isoDate(180), candidate_updated_at: isoDate(90),
    country_id: 1, country_name: "Kuwait", area_name: "Salmiya",
    candidate_birth_date: "1988-03-22", candidate_hourly_rate: 0,
    candidate_objective: "", skills: [], universities: [],
    is_incomplete_profile: true, deleted: 1,
  },
  {
    candidate_id: 1022, candidate_uid: "C1022",
    candidate_name: "Pending Review Candidate", candidate_name_ar: "قيد المراجعة",
    candidate_email: "pending@test.studenthub.ai", candidate_phone: "+965 5111-0022",
    candidate_gender: 1, candidate_status: 40, candidate_job_search_status: 2,
    candidate_committed: false,
    candidate_created_at: isoDate(10), candidate_updated_at: isoDate(1),
    country_id: 2, country_name: "Egypt", area_name: "Cairo",
    candidate_birth_date: "2002-08-15", candidate_hourly_rate: 0,
    candidate_objective: "New registration, pending profile review",
    skills: ["Basic Computing"], universities: [],
    is_incomplete_profile: true, deleted: 0,
  },

  // ── Candidates for hourly rate range filtering ──
  {
    candidate_id: 1030, candidate_uid: "C1030",
    candidate_name: "Premium Engineer One", candidate_name_ar: "مهندس ممتاز",
    candidate_email: "premium1@test.studenthub.ai", candidate_phone: "+965 5111-0030",
    candidate_gender: 1, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: true,
    candidate_created_at: isoDate(45), candidate_updated_at: isoDate(1),
    country_id: 1, country_name: "Kuwait", area_name: "Kuwait City",
    candidate_birth_date: "1996-04-10", candidate_hourly_rate: 7.500,
    candidate_objective: "Senior full-stack developer",
    skills: ["TypeScript", "React", "Node.js", "PostgreSQL"],
    universities: ["Kuwait University"],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1031, candidate_uid: "C1031",
    candidate_name: "Premium Designer", candidate_name_ar: "مصممة ممتازة",
    candidate_email: "premium2@test.studenthub.ai", candidate_phone: "+965 5111-0031",
    candidate_gender: 2, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: true,
    candidate_created_at: isoDate(30), candidate_updated_at: isoDate(1),
    country_id: 1, country_name: "Kuwait", area_name: "Salmiya",
    candidate_birth_date: "1997-11-05", candidate_hourly_rate: 6.000,
    candidate_objective: "Senior UI/UX designer with branding experience",
    skills: ["Figma", "Adobe Creative Suite", "Prototyping", "Design Systems"],
    universities: ["American University of Kuwait"],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1032, candidate_uid: "C1032",
    candidate_name: "Budget Candidate", candidate_name_ar: "مرشح اقتصادي",
    candidate_email: "budget@test.studenthub.ai", candidate_phone: "+965 5111-0032",
    candidate_gender: 1, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: false,
    candidate_created_at: isoDate(50), candidate_updated_at: isoDate(5),
    country_id: 4, country_name: "Philippines", area_name: "Manila",
    candidate_birth_date: "1998-09-12", candidate_hourly_rate: 1.000,
    candidate_objective: "General worker, willing to learn",
    skills: ["Cleaning", "General Labor"],
    universities: [],
    is_incomplete_profile: false, deleted: 0,
  },

  // ── Candidates for skill-based filtering ──
  {
    candidate_id: 1040, candidate_uid: "C1040",
    candidate_name: "React Developer One", candidate_name_ar: "مطور رياكت",
    candidate_email: "react1@test.studenthub.ai", candidate_phone: "+965 5111-0040",
    candidate_gender: 1, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: true,
    candidate_created_at: isoDate(20), candidate_updated_at: isoDate(1),
    country_id: 1, country_name: "Kuwait", area_name: "Hawally",
    candidate_birth_date: "1999-06-30", candidate_hourly_rate: 4.500,
    candidate_objective: "React frontend developer",
    skills: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
    universities: ["American University of the Middle East"],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1041, candidate_uid: "C1041",
    candidate_name: "Python Backend Dev", candidate_name_ar: "مطور بايثون",
    candidate_email: "python@test.studenthub.ai", candidate_phone: "+965 5111-0041",
    candidate_gender: 1, candidate_status: 10, candidate_job_search_status: 2,
    candidate_committed: true,
    candidate_created_at: isoDate(180), candidate_updated_at: isoDate(10),
    country_id: 2, country_name: "Egypt", area_name: "Cairo",
    candidate_birth_date: "1995-02-28", candidate_hourly_rate: 3.500,
    candidate_objective: "Backend developer with Python expertise",
    skills: ["Python", "Django", "PostgreSQL", "Docker"],
    universities: ["Cairo University"],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1042, candidate_uid: "C1042",
    candidate_name: "Marketing Specialist", candidate_name_ar: "أخصائية تسويق",
    candidate_email: "marketing@test.studenthub.ai", candidate_phone: "+965 5111-0042",
    candidate_gender: 2, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: false,
    candidate_created_at: isoDate(60), candidate_updated_at: isoDate(3),
    country_id: 8, country_name: "Jordan", area_name: "Amman",
    candidate_birth_date: "1997-07-07", candidate_hourly_rate: 2.750,
    candidate_objective: "Digital marketing specialist",
    skills: ["SEO", "Google Analytics", "Social Media Marketing", "Content Strategy"],
    universities: ["University of Jordan"],
    is_incomplete_profile: false, deleted: 0,
  },

  // ── More candidates to reach 40 total for pagination tests ──
  {
    candidate_id: 1050, candidate_uid: "C1050",
    candidate_name: "Sarah Abdullah", candidate_name_ar: "سارة عبدالله",
    candidate_email: "sarah.abdullah@test.studenthub.ai", candidate_phone: "+965 5111-0050",
    candidate_gender: 2, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: true,
    candidate_created_at: isoDate(40), candidate_updated_at: isoDate(2),
    country_id: 1, country_name: "Kuwait", area_name: "Kuwait City",
    candidate_birth_date: "2000-01-20", candidate_hourly_rate: 3.000,
    candidate_objective: "Fresh graduate seeking admin role",
    skills: ["Microsoft Office", "Communication", "Organization"],
    universities: ["Kuwait University"],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1051, candidate_uid: "C1051",
    candidate_name: "Abdulaziz Al-Otaibi", candidate_name_ar: "عبدالعزيز العتيبي",
    candidate_email: "a.alotaibi@test.studenthub.ai", candidate_phone: "+965 5111-0051",
    candidate_gender: 1, candidate_status: 10, candidate_job_search_status: 2,
    candidate_committed: true,
    candidate_created_at: isoDate(75), candidate_updated_at: isoDate(6),
    country_id: 1, country_name: "Kuwait", area_name: "Farwaniya",
    candidate_birth_date: "1998-10-15", candidate_hourly_rate: 2.500,
    candidate_objective: "Customer service representative",
    skills: ["Customer Service", "Sales", "CRM"],
    universities: ["PAAET"],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1052, candidate_uid: "C1052",
    candidate_name: "Fatima Al-Harbi", candidate_name_ar: "فاطمة الحربي",
    candidate_email: "fatima.alharbi@test.studenthub.ai", candidate_phone: "+965 5111-0052",
    candidate_gender: 2, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: true,
    candidate_created_at: isoDate(35), candidate_updated_at: isoDate(1),
    country_id: 1, country_name: "Kuwait", area_name: "Ahmadi",
    candidate_birth_date: "2001-05-08", candidate_hourly_rate: 3.750,
    candidate_objective: "Architecture graduate seeking design roles",
    skills: ["AutoCAD", "Revit", "3D Modeling"],
    universities: ["Kuwait University"],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1053, candidate_uid: "C1053",
    candidate_name: "Yousef Al-Khaldi", candidate_name_ar: "يوسف الخالدي",
    candidate_email: "yousef.khaldi@test.studenthub.ai", candidate_phone: "+965 5111-0053",
    candidate_gender: 1, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: true,
    candidate_created_at: isoDate(25), candidate_updated_at: isoDate(2),
    country_id: 1, country_name: "Kuwait", area_name: "Kuwait City",
    candidate_birth_date: "1999-12-25", candidate_hourly_rate: 4.250,
    candidate_objective: "IT graduate with network security focus",
    skills: ["Network Security", "Linux", "Python", "AWS"],
    universities: ["Kuwait University"],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1054, candidate_uid: "C1054",
    candidate_name: "Hind Al-Mutawa", candidate_name_ar: "هند المطوع",
    candidate_email: "hind.mutawa@test.studenthub.ai", candidate_phone: "+965 5111-0054",
    candidate_gender: 2, candidate_status: 10, candidate_job_search_status: 2,
    candidate_committed: true,
    candidate_created_at: isoDate(65), candidate_updated_at: isoDate(4),
    country_id: 1, country_name: "Kuwait", area_name: "Salmiya",
    candidate_birth_date: "2000-09-03", candidate_hourly_rate: 3.000,
    candidate_objective: "Business administration graduate",
    skills: ["Excel", "Data Entry", "Administration"],
    universities: ["Gulf University for Science and Technology"],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1055, candidate_uid: "C1055",
    candidate_name: "Bader Al-Shemmari", candidate_name_ar: "بادر الشمري",
    candidate_email: "bader.shemmari@test.studenthub.ai", candidate_phone: "+965 5111-0055",
    candidate_gender: 1, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: true,
    candidate_created_at: isoDate(15), candidate_updated_at: isoDate(1),
    country_id: 1, country_name: "Kuwait", area_name: "Jahra",
    candidate_birth_date: "2001-03-17", candidate_hourly_rate: 2.000,
    candidate_objective: "High school graduate seeking entry-level position",
    skills: ["General Labor", "Driving"],
    universities: [],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1056, candidate_uid: "C1056",
    candidate_name: "Mariam Al-Bahar", candidate_name_ar: "مريم البحر",
    candidate_email: "mariam.bahar@test.studenthub.ai", candidate_phone: "+965 5111-0056",
    candidate_gender: 2, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: true,
    candidate_created_at: isoDate(42), candidate_updated_at: isoDate(3),
    country_id: 1, country_name: "Kuwait", area_name: "Hawally",
    candidate_birth_date: "1999-08-11", candidate_hourly_rate: 5.500,
    candidate_objective: "Pharmacist seeking hospital or clinic roles",
    skills: ["Pharmacy", "Patient Counseling", "Inventory Management"],
    universities: ["Kuwait University"],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1057, candidate_uid: "C1057",
    candidate_name: "Engineer Ramesh", candidate_name_ar: "المهندس راميش",
    candidate_email: "ramesh.engineer@test.studenthub.ai", candidate_phone: "+91 9999-000057",
    candidate_gender: 1, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: false,
    candidate_created_at: isoDate(100), candidate_updated_at: isoDate(12),
    country_id: 3, country_name: "India", area_name: "Mumbai",
    candidate_birth_date: "1994-11-20", candidate_hourly_rate: 2.250,
    candidate_objective: "Mechanical engineer with HVAC experience",
    skills: ["HVAC", "Mechanical Engineering", "AutoCAD", "Maintenance"],
    universities: ["IIT Bombay"],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1058, candidate_uid: "C1058",
    candidate_name: "Dalia Al-Saleh", candidate_name_ar: "داليا الصالح",
    candidate_email: "dalia.saleh@test.studenthub.ai", candidate_phone: "+965 5111-0058",
    candidate_gender: 2, candidate_status: 10, candidate_job_search_status: 2,
    candidate_committed: true,
    candidate_created_at: isoDate(55), candidate_updated_at: isoDate(8),
    country_id: 1, country_name: "Kuwait", area_name: "Kuwait City",
    candidate_birth_date: "1998-04-02", candidate_hourly_rate: 3.250,
    candidate_objective: "Human resources assistant",
    skills: ["HR", "Recruitment", "Employee Relations"],
    universities: ["Australian University of Kuwait"],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1059, candidate_uid: "C1059",
    candidate_name: "Saad Al-Azmi", candidate_name_ar: "سعد العازمي",
    candidate_email: "saad.azmi@test.studenthub.ai", candidate_phone: "+965 5111-0059",
    candidate_gender: 1, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: true,
    candidate_created_at: isoDate(30), candidate_updated_at: isoDate(2),
    country_id: 1, country_name: "Kuwait", area_name: "Farwaniya",
    candidate_birth_date: "2000-07-09", candidate_hourly_rate: 1.750,
    candidate_objective: "Looking for retail or warehouse work",
    skills: ["Retail", "Warehouse", "Inventory"],
    universities: [],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1060, candidate_uid: "C1060",
    candidate_name: "Nadia Ibrahim", candidate_name_ar: "نادية إبراهيم",
    candidate_email: "nadia.ibrahim@test.studenthub.ai", candidate_phone: "+965 5111-0060",
    candidate_gender: 2, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: false,
    candidate_created_at: isoDate(48), candidate_updated_at: isoDate(5),
    country_id: 2, country_name: "Egypt", area_name: "Cairo",
    candidate_birth_date: "1996-10-22", candidate_hourly_rate: 1.500,
    candidate_objective: "Housekeeping and cleaning services",
    skills: ["Cleaning", "Housekeeping"],
    universities: [],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1061, candidate_uid: "C1061",
    candidate_name: "Talal Al-Anzi", candidate_name_ar: "طلال العنزي",
    candidate_email: "talal.anzi@test.studenthub.ai", candidate_phone: "+965 5111-0061",
    candidate_gender: 1, candidate_status: 10, candidate_job_search_status: 2,
    candidate_committed: true,
    candidate_created_at: isoDate(200), candidate_updated_at: isoDate(30),
    country_id: 1, country_name: "Kuwait", area_name: "Ahmadi",
    candidate_birth_date: "1997-06-14", candidate_hourly_rate: 2.000,
    candidate_objective: "Driver with valid Kuwait license",
    skills: ["Driving", "Vehicle Maintenance"],
    universities: [],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1062, candidate_uid: "C1062",
    candidate_name: "Dr. Nora Al-Qahtani", candidate_name_ar: "د. نورا القحطاني",
    candidate_email: "nora.qahtani@test.studenthub.ai", candidate_phone: "+965 5111-0062",
    candidate_gender: 2, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: true,
    candidate_created_at: isoDate(28), candidate_updated_at: isoDate(1),
    country_id: 1, country_name: "Kuwait", area_name: "Salmiya",
    candidate_birth_date: "1994-03-28", candidate_hourly_rate: 8.000,
    candidate_objective: "Medical doctor seeking clinical positions",
    skills: ["Medicine", "Patient Care", "Medical Research"],
    universities: ["Kuwait University"],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1063, candidate_uid: "C1063",
    candidate_name: "John Smith", candidate_name_ar: "جون سميث",
    candidate_email: "john.smith@test.studenthub.ai", candidate_phone: "+965 5111-0063",
    candidate_gender: 1, candidate_status: 10, candidate_job_search_status: 3,
    candidate_committed: false,
    candidate_created_at: isoDate(250), candidate_updated_at: isoDate(200),
    country_id: 4, country_name: "Philippines", area_name: "Manila",
    candidate_birth_date: "1990-01-01", candidate_hourly_rate: 0,
    candidate_objective: "Not currently looking for work",
    skills: [],
    universities: [],
    is_incomplete_profile: true, deleted: 0,
  },
  {
    candidate_id: 1064, candidate_uid: "C1064",
    candidate_name: "Mona Al-Rashid", candidate_name_ar: "مونا الرشيد",
    candidate_email: "mona.alrashid@test.studenthub.ai", candidate_phone: "+965 5111-0064",
    candidate_gender: 2, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: true,
    candidate_created_at: isoDate(32), candidate_updated_at: isoDate(3),
    country_id: 1, country_name: "Kuwait", area_name: "Hawally",
    candidate_birth_date: "2001-11-15", candidate_hourly_rate: 2.750,
    candidate_objective: "Recent graduate in interior design",
    skills: ["Interior Design", "AutoCAD", "3ds Max", "SketchUp"],
    universities: ["American University of the Middle East"],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1065, candidate_uid: "C1065",
    candidate_name: "Ali Hassan", candidate_name_ar: "علي حسن",
    candidate_email: "ali.hassan@test.studenthub.ai", candidate_phone: "+20 100-000-065",
    candidate_gender: 1, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: false,
    candidate_created_at: isoDate(70), candidate_updated_at: isoDate(5),
    country_id: 2, country_name: "Egypt", area_name: "Cairo",
    candidate_birth_date: "1995-05-30", candidate_hourly_rate: 1.750,
    candidate_objective: "Chef with restaurant experience",
    skills: ["Cooking", "Kitchen Management", "Food Safety"],
    universities: [],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1066, candidate_uid: "C1066",
    candidate_name: "Shika Kumari", candidate_name_ar: "شيكا كوماري",
    candidate_email: "shika.kumari@test.studenthub.ai", candidate_phone: "+91 9999-000066",
    candidate_gender: 2, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: false,
    candidate_created_at: isoDate(55), candidate_updated_at: isoDate(4),
    country_id: 3, country_name: "India", area_name: "Mumbai",
    candidate_birth_date: "1998-08-08", candidate_hourly_rate: 1.250,
    candidate_objective: "Domestic worker seeking employment",
    skills: ["Cleaning", "Cooking", "Childcare"],
    universities: [],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1067, candidate_uid: "C1067",
    candidate_name: "Hussein Al-Saqer", candidate_name_ar: "حسين الصقر",
    candidate_email: "hussein.saqer@test.studenthub.ai", candidate_phone: "+965 5111-0067",
    candidate_gender: 1, candidate_status: 10, candidate_job_search_status: 1,
    candidate_committed: true,
    candidate_created_at: isoDate(22), candidate_updated_at: isoDate(1),
    country_id: 1, country_name: "Kuwait", area_name: "Kuwait City",
    candidate_birth_date: "2000-02-18", candidate_hourly_rate: 3.250,
    candidate_objective: "Finance graduate looking for entry-level roles",
    skills: ["Finance", "Excel", "Financial Analysis"],
    universities: ["Kuwait University"],
    is_incomplete_profile: false, deleted: 0,
  },
  {
    candidate_id: 1068, candidate_uid: "C1068",
    candidate_name: "Aisha Al-Jassim", candidate_name_ar: "عائشة الجاسم",
    candidate_email: "aisha.jassim@test.studenthub.ai", candidate_phone: "+965 5111-0068",
    candidate_gender: 2, candidate_status: 10, candidate_job_search_status: 2,
    candidate_committed: true,
    candidate_created_at: isoDate(88), candidate_updated_at: isoDate(15),
    country_id: 1, country_name: "Kuwait", area_name: "Ahmadi",
    candidate_birth_date: "1998-12-05", candidate_hourly_rate: 3.500,
    candidate_objective: "Legal assistant with contract experience",
    skills: ["Legal Research", "Contract Review", "Document Management"],
    universities: ["Kuwait University"],
    is_incomplete_profile: false, deleted: 0,
  },
];

// ── Helper functions ──────────────────────────────────────────────────────

/** Get all active (status=10) candidates */
export function getActiveCandidates(): MockCandidate[] {
  return CANDIDATES.filter((c) => c.candidate_status === 10);
}

/** Get candidates by country ID */
export function getCandidatesByCountry(countryId: number): MockCandidate[] {
  return CANDIDATES.filter((c) => c.country_id === countryId);
}

/** Get candidates by skill (partial match) */
export function getCandidatesBySkill(skill: string): MockCandidate[] {
  const lower = skill.toLowerCase();
  return CANDIDATES.filter((c) =>
    c.skills.some((s) => s.toLowerCase().includes(lower)),
  );
}

/** Get candidates by job search status */
export function getCandidatesBySearchStatus(
  status: number,
): MockCandidate[] {
  return CANDIDATES.filter((c) => c.candidate_job_search_status === status);
}

/** Get unique skills across all candidates */
export function getAllSkills(): string[] {
  const all = new Set<string>();
  CANDIDATES.forEach((c) => c.skills.forEach((s) => all.add(s)));
  return [...all].sort();
}

/** Get the country name for a candidate */
export function getCountryName(candidate: MockCandidate): string {
  const country = COUNTRIES.find((c) => c.country_id === candidate.country_id);
  return country?.country_name_en ?? "Unknown";
}

/** Filter candidates by query string (name, email, phone) */
export function searchCandidates(query: string): MockCandidate[] {
  const lower = query.toLowerCase();
  return CANDIDATES.filter(
    (c) =>
      c.candidate_name.toLowerCase().includes(lower) ||
      c.candidate_name_ar.includes(query) ||
      c.candidate_email.toLowerCase().includes(lower) ||
      (c.candidate_phone && c.candidate_phone.includes(query)),
  );
}
