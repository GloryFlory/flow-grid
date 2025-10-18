// Configuration system for Festival Scheduler
// This makes the MAC schedule template configurable for any event

export const getEventConfig = () => {
  return {
    // Event Information
    name: process.env.NEXT_PUBLIC_EVENT_NAME || "MAC Festival",
    description: process.env.NEXT_PUBLIC_EVENT_DESCRIPTION || "Movement Arts Community Festival",
    logo: process.env.NEXT_PUBLIC_EVENT_LOGO || "/mac-logo.png",
    domain: process.env.NEXT_PUBLIC_EVENT_DOMAIN || "macfestival.com",
    
    // Google Sheets Integration
    googleSheetsId: process.env.GOOGLE_SHEETS_ID || "11-6l7HgRwZzFrQ22Ny8_d-wvimahJdBcceuy9OBEMAM",
    webhookUrl: process.env.GOOGLE_APPS_SCRIPT_WEBHOOK || "https://script.google.com/macros/s/AKfycbyoYd6i4X9WEu05qdqEapwFEdgUcu9DvIIdcSveYG_QyqUfJzxatxMCpiR6sBrb0g/exec",
    
    // Theme Colors
    colors: {
      primary: process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#4a90e2",
      secondary: process.env.NEXT_PUBLIC_SECONDARY_COLOR || "#7b68ee", 
      accent: process.env.NEXT_PUBLIC_ACCENT_COLOR || "#ff6b6b"
    },
    
    // Features
    features: {
      bookingSystem: process.env.NEXT_PUBLIC_ENABLE_BOOKING_SYSTEM === "true",
      photoshootBooking: process.env.NEXT_PUBLIC_ENABLE_PHOTOSHOOT_BOOKING === "true", 
      participantTracking: process.env.NEXT_PUBLIC_ENABLE_PARTICIPANT_TRACKING === "true"
    },
    
    // Contact Information
    contact: {
      email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@macfestival.com",
      phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "",
      facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "",
      instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
      website: process.env.NEXT_PUBLIC_WEBSITE_URL || ""
    }
  };
};

// Helper to get Google Sheets CSV URL
export const getGoogleSheetsCSV = () => {
  const config = getEventConfig();
  return `https://docs.google.com/spreadsheets/d/${config.googleSheetsId}/export?format=csv`;
};

// Helper to get booking CSV URL with specific gid
export const getBookingsCSV = (gid = "1652982192") => {
  const config = getEventConfig();
  return `https://docs.google.com/spreadsheets/d/${config.googleSheetsId}/export?format=csv&gid=${gid}`;
};