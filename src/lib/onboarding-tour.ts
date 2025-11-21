import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export interface TourStep {
  element?: string;
  popover: {
    title: string;
    description: string;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
  };
}

export const festivalDashboardTourSteps: TourStep[] = [
  {
    popover: {
      title: "Welcome to your festival dashboard! 🎉",
      description:
        "Let's take a quick 60-second tour to show you the key features. You can skip this anytime by pressing ESC or clicking outside.",
      side: "left",
      align: "start",
    },
  },
  {
    element: '[data-tour="festival-content"]',
    popover: {
      title: "Festival Content",
      description:
        "Add sessions, set times, and manage your festival details. Upload via CSV or add manually—it's completely flexible.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="branding-design"]',
    popover: {
      title: "Branding & Design",
      description:
        "Customize your festival's look, upload logos, and manage teacher/facilitator profiles and photos to make it uniquely yours.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="analytics"]',
    popover: {
      title: "Analytics & Insights",
      description:
        "Track page views, session popularity, and attendee engagement in real-time. See what's working and optimize your festival.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="festival-settings"]',
    popover: {
      title: "Festival Settings",
      description:
        "Configure visibility, timezone, registration options, and advanced features. Fine-tune everything to match your needs.",
      side: "left",
      align: "start",
    },
  },
  {
    element: '[data-tour="view-schedule"]',
    popover: {
      title: "View Live Schedule",
      description:
        "See your schedule exactly as attendees will see it—mobile-responsive, filterable, and beautiful. Share this link with your community!",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="back-to-dashboard"]',
    popover: {
      title: "Back to General Dashboard",
      description:
        "Return to your main dashboard to manage all your festivals and account settings. Access everything from one place.",
      side: "bottom",
      align: "start",
    },
  },
  {
    popover: {
      title: "You're all set! 🚀",
      description:
        'Your festival dashboard is ready to go! Next steps: <a href="/blog/qr-code-event-schedules" class="underline text-purple-600 hover:text-purple-700">Create QR codes for your schedule</a> or <a href="/blog/multi-day-festival-scheduling-tips" class="underline text-purple-600 hover:text-purple-700">explore scheduling best practices</a>. You can retake this tour anytime from the "Take Tour" button above.',
      side: "left",
      align: "start",
    },
  },
];

export const createFestivalTour = (onComplete?: () => void) => {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    overlayOpacity: 0.6,
    smoothScroll: true,
    allowClose: true,
    disableActiveInteraction: false,
    stagePadding: 10,
    stageRadius: 12,
    steps: festivalDashboardTourSteps,
    popoverClass: "flowgrid-tour-popover",
    progressText: "{{current}} of {{total}}",
    nextBtnText: "Next →",
    prevBtnText: "← Back",
    doneBtnText: "Done!",
    onDestroyed: () => {
      if (onComplete) {
        onComplete();
      }
    },
    onHighlightStarted: (element) => {
      if (element) {
        // Force highlighted element to be fully visible
        (element as HTMLElement).style.opacity = '1';
        (element as HTMLElement).style.filter = 'none';
      }
    },
  });

  return driverObj;
};

export const startFestivalTour = async (
  userId: string,
  onComplete?: () => void
) => {
  const tour = createFestivalTour(async () => {
    // Mark tour as completed
    try {
      await fetch("/api/user/complete-onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Failed to mark onboarding as complete:", error);
    }
  });

  tour.drive();
};
