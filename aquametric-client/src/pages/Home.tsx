import { Link } from "react-router-dom";
import aquametricLogo from "../assets/aquamteric-logo.png"

export default function Landing() {
  return (
    <section className="page page--narrow page--center">
      <div className="stack-lg-2">
        <img className="brand-logo" src= {aquametricLogo}></img>
      </div>
      <div className="stack-lg">
        <div className="stack-sm text-center">
          <h1 className="display">Steward your fisheries data in one place</h1>
          <p className="text-muted">
            Welcome aboard! Create an account to join your organisation and start managing vessels, trips, and ingestion
            workflows, or jump back in if you already have an account.
          </p>
        </div>

        <div className="tile-grid">
          <article className="surface surface--interactive stack-sm">
            <h3>New to AquaMetric?</h3>
            <p className="text-muted">Create an account, join or create an organisation, and invite your crew.</p>
            <Link to="/register" className="button button--primary">Create account</Link>
          </article>

          <article className="surface surface--interactive stack-sm">
            <h3>Already on board?</h3>
            <p className="text-muted">Log in to continue where you left off with your latest trips and uploads.</p>
            <Link to="/login" className="button button--ghost">Log in</Link>
          </article>

        </div>
      </div>
    </section>
  );
}