export type Translation = typeof en;

export const en = {
  name: "English",
  short: "EN",
  dir: "ltr",
  ui: {
    network: "Member Area",
    uplink: "Connect Identity",
    architect: "Verified Member",
    terminate: "Sign Out",
    ecosystem: "Project Hub",
    status: "Status: Online",
    production: "Active",
    language: "Language",
    snow: "Snow Mode",
    companion: "AI Assistant",
    notebook: "Notes",
  },
  auth: {
    greeting: "Welcome back. Your productivity protocol is being synchronized.",
  },
};

export const ur = {
  name: "اردو",
  short: "UR",
  dir: "rtl",
  ui: {
    network: "ممبر ایریا",
    uplink: "شناخت جوڑیں",
    architect: "تصدیق شدہ ممبر",
    terminate: "سائن آؤٹ",
    ecosystem: "پروجیکٹ حب",
    status: "اسٹیٹس: آن لائن",
    production: "فعال",
    language: "زبان",
    snow: "برفانی موڈ",
    companion: "اے آئی اسسٹنٹ",
    notebook: "نوٹس",
  },
  auth: {
    greeting: "خوش آمدید۔ آپ کا پروٹوکول سنکرونائز ہو رہا ہے۔",
  },
};

export const ro = {
  name: "Roman Urdu",
  short: "RO",
  dir: "ltr",
  ui: {
    network: "Member Area",
    uplink: "Identity Connect",
    architect: "Verified Member",
    terminate: "Sign Out",
    ecosystem: "Project Hub",
    status: "Status: Online",
    production: "Active",
    language: "Zubaan",
    snow: "Snow Mode",
    companion: "AI Assistant",
    notebook: "Notes",
  },
  auth: {
    greeting: "Welcome back! Aap ka protocol synchronize ho raha hai.",
  },
};

export const dictionaries = {
  en,
  ur,
  ro,
};
