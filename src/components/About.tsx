import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="page">
      <Link className="page-back" to="/">
        ← Back
      </Link>
      <section className="about">
        <p className="eyebrow">About</p>
        <h1>Open research, without barriers</h1>
        <p className="about-lede">
          We believe that dementia research should be available to all, immediately, without
          barriers, for free.
        </p>
        <div className="about-body">
          <p>
            Currently, scientific journals slow down publication by 6-12 months. Once published,
            the information is hidden behind a paywall, inaccessible to most humans and all AI. For
            the data to be open access, the scientist must pay $2000-8000 fees; money that could be
            used for more dementia research. Perhaps even more concerningly, publishing in this way
            creates a positivity bias that can corrupt the integrity of science.
          </p>
          <p>
            DementiaXchange can publish your research today, without any cost to you. It will be
            immediately accessible to everyone, without any cost to them. We use advanced AI to
            provide a virtual peer review and assign a debiased impact factor (DIF). The DIF shows
            what level of journal this work would have been accepted by in the old system, once
            positivity bias has been removed, validating the best research and helping funders and
            institutions move away from using journal impact factors to judge the best researchers;
            something most have committed to doing by signing the DORA declaration.
          </p>
          <p>
            Getting the information out there is the first step. Once published, DementiaXchange
            allows human interaction and ongoing human peer review, creating a conversation in the
            community and driving forward progress in dementia science.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
