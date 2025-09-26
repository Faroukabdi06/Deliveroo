import React from 'react';

const statusConfig = {
  CREATED: {
    icon: '📝',
    label: 'Parcel Created',
    color: '#6366F1'
  },
  PICKED_UP: {
    icon: '📦',
    label: 'Picked Up',
    color: '#F59E0B'
  },
  IN_TRANSIT: {
    icon: '🚚',
    label: 'In Transit',
    color: '#3B82F6'
  },
  OUT_FOR_DELIVERY: {
    icon: '🏍️',
    label: 'Out for Delivery',
    color: '#8B5CF6'
  },
  DELIVERED: {
    icon: '✅',
    label: 'Delivered',
    color: '#10B981'
  },
  CANCELLED: {
    icon: '❌',
    label: 'Cancelled',
    color: '#EF4444'
  }
};

const ParcelTimeline = ({ statusHistory, currentStatus, isAdmin = false }) => {
  const allStatuses = Object.keys(statusConfig);
  const currentStatusIndex = allStatuses.indexOf(currentStatus);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Pending';
    
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusTime = (status) => {
    const statusEvent = statusHistory.find(event => event.status === status);
    return statusEvent ? statusEvent.timestamp : null;
  };

  const isStatusCompleted = (statusIndex) => {
    return statusIndex <= currentStatusIndex;
  };

  const isCurrentStatus = (statusIndex) => {
    return statusIndex === currentStatusIndex;
  };

  return (
    <div className="parcel-timeline">
      <div className="timeline-header">
        <h3>Delivery Progress</h3>
        <div className="current-status">
          Current Status: <span className="status-badge">{statusConfig[currentStatus]?.label}</span>
        </div>
      </div>

      <div className="timeline-steps">
        {allStatuses.map((status, index) => {
          const config = statusConfig[status];
          const isCompleted = isStatusCompleted(index);
          const isCurrent = isCurrentStatus(index);
          const timestamp = getStatusTime(status);

          return (
            <div key={status} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
              <div className="step-indicator">
                <div 
                  className="indicator-icon"
                  style={{ 
                    backgroundColor: isCompleted ? config.color : '#E5E7EB',
                    borderColor: config.color
                  }}
                >
                  {config.icon}
                </div>
                {index < allStatuses.length - 1 && (
                  <div 
                    className="step-connector"
                    style={{ 
                      backgroundColor: isCompleted ? config.color : '#E5E7EB'
                    }}
                  />
                )}
              </div>

              <div className="step-content">
                <div className="step-header">
                  <span className="step-label">{config.label}</span>
                  {isCurrent && <span className="current-badge">Current</span>}
                </div>
                
                <div className="step-timestamp">
                  {timestamp ? (
                    <span className="timestamp">{formatTimestamp(timestamp)}</span>
                  ) : (
                    <span className="timestamp-pending">Pending</span>
                  )}
                </div>

                {/* Show status update details if available */}
                {timestamp && statusHistory.find(event => event.status === status)?.notes && (
                  <div className="step-notes">
                    {statusHistory.find(event => event.status === status)?.notes}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status History Details */}
      <div className="status-history">
        <h4>Status Updates</h4>
        <div className="history-list">
          {statusHistory.map((event, index) => (
            <div key={index} className="history-item">
              <div className="history-status">
                <span className="status-icon">{statusConfig[event.status]?.icon}</span>
                <span className="status-label">{statusConfig[event.status]?.label}</span>
              </div>
              <div className="history-timestamp">
                {formatTimestamp(event.timestamp)}
              </div>
              {event.updatedBy && isAdmin && (
                <div className="history-updated-by">
                  Updated by: {event.updatedBy}
                </div>
              )}
              {event.notes && (
                <div className="history-notes">
                  {event.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Default props for the component
ParcelTimeline.defaultProps = {
  statusHistory: [],
  currentStatus: 'CREATED'
};

export default ParcelTimeline;