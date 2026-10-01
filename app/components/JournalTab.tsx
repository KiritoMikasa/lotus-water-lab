import type { Experiment } from './WaterLab';

export default function JournalTab({ experiments, onDelete }: { experiments: Experiment[]; onDelete: (id: number) => void }) {
  return (
    <section>
      <h2 className="section-heading">Your brew journal</h2>
      {experiments.length === 0 ? (
        <div className="ruled-empty">
          <p className="narrative">Build a water profile and log your first cup.</p>
        </div>
      ) : (
        <div className="logbook">
          {experiments.map(e => (
            <article className="logbook-entry" key={e.id}>
              <div className="logbook-margin">
                <time className="footnote">{new Date(e.created_at).toLocaleDateString()}</time>
                <div className="stars" aria-label={`${e.rating || 0} of 5 stars`}>
                  {'★'.repeat(e.rating || 0)}
                  <span className="stars-empty">{'★'.repeat(5 - (e.rating || 0))}</span>
                </div>
              </div>
              <div className="logbook-main">
                <h3 className="entry-title">{e.title} <span className="meta">· {e.beans || 'beans not recorded'} · {e.brew_method}</span></h3>
                <p className="narrative">{e.notes}</p>
                <p className="mini-recipe">{e.drops.mg} Mg · {e.drops.ca} Ca · {e.drops.k} K · {e.drops.na} Na</p>
                <button className="text-link remove" onClick={() => onDelete(e.id)}>remove</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
