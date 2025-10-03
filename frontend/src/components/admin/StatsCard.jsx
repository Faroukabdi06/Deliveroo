import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { Sparklines, SparklinesLine } from "react-sparklines";

const StatsCard = ({ label, value, icon, color, trend, sparklineData }) => {
  return (
    <div className="stats-card" style={{ borderTop: `4px solid ${color}` }}>
      <div className="stats-card-header">
        <div className="stats-icon">{icon}</div>
        <div className="stats-info">
          <p className="stats-label">{label}</p>
          <p className="stats-value">{value}</p>
        </div>
      </div>

      {/* Trend Indicator */}
      {trend !== undefined && (
        <div
          className={`stats-trend ${
            trend >= 0 ? "trend-up" : "trend-down"
          }`}
        >
          {trend >= 0 ? <FaArrowUp /> : <FaArrowDown />}
          <span>{Math.abs(trend)}%</span>
        </div>
      )}

      {/* Sparkline Mini Chart */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="stats-sparkline">
          <Sparklines data={sparklineData} width={100} height={30}>
            <SparklinesLine color={color} />
          </Sparklines>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
