import { Link } from "react-router-dom";

const Card = ({ number, title, color, icon, description }) => {
  const path = `/${title.toLowerCase()}`;

  return (
    <div
      className="dashboard-card"
      style={{ backgroundColor: color, color: "#fff" }}
    >
      <div className="card-content">
        <div className="icon-and-title">
          <div className="card-icon">{icon}</div>
          <h3 className="card-title">{title}</h3>
        </div>
        <div className="card-number-wrapper">
          <span className="card-number">{number}</span>
        </div>
      </div>
      <div className="card-footer">
        <Link to={path} className="more-info-link">
          More info <i className="fas fa-arrow-circle-right"></i>
        </Link>
      </div>
    </div>
  );
};

export default Card;
