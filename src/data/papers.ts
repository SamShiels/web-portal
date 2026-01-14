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
  }
];
