import "./BaristaTeam.css";

const stats = [
  { id: 1, name: "Staff Members", value: "201+" },
  { id: 2, name: "Locations", value: "45" },
  { id: 3, name: "Founded", value: "2018" },
];

const BaristaTeam = () => {
  return (
    <div className="barista-team-container">
      <div className="barista-team-left">
        <div className="barista-team-text-content">
          <h1 className="barista-team-heading">The Team That Makes It Real.</h1>
          <p className="barista-team-paragraph">
            Our baristas are the heart of Half Million. They show up early, stay
            late, and pour everything they have into every cup. Trained with
            precision, driven by passion — they don't just make coffee, they
            make your day. Every order is personal, every interaction
            intentional. They are the reason people come back.
          </p>
          <div className="barista-team-stats-wrapper">
            <dl className="barista-team-stats-grid">
              {stats.map((stat) => (
                <div key={stat.id} className="barista-team-stat-item">
                  <dt className="barista-team-stat-name">{stat.name}</dt>
                  <dd className="barista-team-stat-value">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <img className="barista-team-right" src="./HMM.jpg" alt="Barista team" />
    </div>
  );
};

export default BaristaTeam;
