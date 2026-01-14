export type Paper = {
  id: string;
  title: string;
  authors: string;
  pdfUrl: string;
  dif: number;
  abstract: string;
  publishedAt: string;
};

export const PAPERS: Paper[] = [
  {
    id: "dx-2024-01",
    title: "Care Pathways for Cognitive Change",
    authors: "R. Anand, L. Mendez, S. Iwata",
    pdfUrl: "/papers/care-pathways.pdf",
    dif: 72,
    abstract:
      "A multi-site synthesis of care pathways that accelerate cognitive change triage, with a focus on community referrals and caregiver support loops.",
    publishedAt: "2024-07-18"
  },
  {
    id: "dx-2024-02",
    title: "Community Signals in Early Dementia Support",
    authors: "J. Kline, P. Sarkar",
    pdfUrl: "/papers/community-signals.pdf",
    dif: 58,
    abstract:
      "An exploration of neighborhood-scale indicators that correlate with early support engagement and longitudinal caregiver outcomes.",
    publishedAt: "2024-08-03"
  },
  {
    id: "dx-2024-03",
    title: "Scaling Memory Clinics with Shared Protocols",
    authors: "M. Cho, T. Riley, A. Gomez",
    pdfUrl: "/papers/memory-clinics.pdf",
    dif: 64,
    abstract:
      "A comparative study of shared intake protocols and telehealth follow-ups for scaling memory clinic capacity without compromising patient trust.",
    publishedAt: "2024-08-19"
  },
  {
    id: "dx-2024-04",
    title: "Caregiver Burnout Signals in Rural Networks",
    authors: "H. Patel, S. Okoro, D. Nguyen",
    pdfUrl: "/papers/caregiver-burnout.pdf",
    dif: 61,
    abstract:
      "Survey-driven indicators of caregiver strain in rural systems, with recommendations for rapid outreach based on service utilization patterns.",
    publishedAt: "2024-09-02"
  },
  {
    id: "dx-2024-05",
    title: "Memory Clinic Staffing Models: A Comparative Review",
    authors: "A. Herrera, M. Grewal",
    pdfUrl: "/papers/staffing-models.pdf",
    dif: 69,
    abstract:
      "A review of staffing ratios across community-based memory clinics and the operational trade-offs of nurse-led triage programs.",
    publishedAt: "2024-09-10"
  },
  {
    id: "dx-2024-06",
    title: "Designing Low-Friction Cognitive Screeners",
    authors: "T. Fields, R. Hassan, L. Voss",
    pdfUrl: "/papers/low-friction-screeners.pdf",
    dif: 55,
    abstract:
      "Prototype screening flows that reduce time-to-completion while preserving sensitivity, with results from a multi-clinic pilot.",
    publishedAt: "2024-09-18"
  },
  {
    id: "dx-2024-07",
    title: "Neighborhood Trust and Clinical Uptake",
    authors: "N. Foster, C. Ramirez",
    pdfUrl: "/papers/neighborhood-trust.pdf",
    dif: 63,
    abstract:
      "A mixed-methods analysis of trust-building levers that affect clinical uptake in underserved communities.",
    publishedAt: "2024-09-27"
  },
  {
    id: "dx-2024-08",
    title: "Telehealth Memory Visits: A 12-Month Follow-Up",
    authors: "B. Klein, P. Zhao, E. Walsh",
    pdfUrl: "/papers/telehealth-followup.pdf",
    dif: 66,
    abstract:
      "Longitudinal outcomes from telehealth visits, focusing on caregiver satisfaction, adherence, and referral completion.",
    publishedAt: "2024-10-05"
  },
  {
    id: "dx-2024-09",
    title: "Community Partner Playbooks for Early Detection",
    authors: "L. Stein, J. Alvarez",
    pdfUrl: "/papers/partner-playbooks.pdf",
    dif: 59,
    abstract:
      "Reusable playbooks for community partners that accelerate early detection and increase follow-through on clinical referrals.",
    publishedAt: "2024-10-12"
  },
  {
    id: "dx-2024-10",
    title: "Equity Benchmarks for Cognitive Care Access",
    authors: "D. Morgan, I. Bae, S. Collins",
    pdfUrl: "/papers/equity-benchmarks.pdf",
    dif: 70,
    abstract:
      "Benchmark metrics that track disparities in cognitive care access and spotlight operational gaps in regional systems.",
    publishedAt: "2024-10-20"
  },
  {
    id: "dx-2024-11",
    title: "Signal Routing for Memory Support Hotlines",
    authors: "K. Jonas, M. Ibrahim",
    pdfUrl: "/papers/support-hotlines.pdf",
    dif: 57,
    abstract:
      "Routing logic that improves hotline response times and triage accuracy using community partner inputs.",
    publishedAt: "2024-10-28"
  },
  {
    id: "dx-2024-12",
    title: "Rapid Pilot Playbook: From Draft to Deployment",
    authors: "S. Brooks, T. Morgan, R. Diaz",
    pdfUrl: "/papers/rapid-pilot.pdf",
    dif: 62,
    abstract:
      "A framework for moving pilot programs from draft to deployment in under 10 weeks, with recommended checkpoints.",
    publishedAt: "2024-11-04"
  }
];
