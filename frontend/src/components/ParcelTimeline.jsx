// src/components/ParcelTimeline.jsx
import React from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon
} from '@mui/icons-material';

const ParcelTimeline = ({ statusHistory }) => {
  if (!statusHistory || statusHistory.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography color="textSecondary">No status history available</Typography>
      </Paper>
    );
  }

  const statusOrder = {
    'created': 1,
    'in_transit': 2,
    'out_for_delivery': 3,
    'delivered': 4,
    'cancelled': 5
  };

  const sortedHistory = [...statusHistory].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  const getStatusIcon = (status, index) => {
    if (index === 0) {
      return <CheckCircleIcon color="primary" />;
    }
    return <RadioButtonUncheckedIcon color="disabled" />;
  };

  return (
    <Box sx={{ maxWidth: 400 }}>
      <Stepper orientation="vertical">
        {sortedHistory.map((status, index) => (
          <Step key={status._id || index} active={index === 0}>
            <StepLabel StepIconComponent={() => getStatusIcon(status.status, index)}>
              <Typography variant="subtitle1" fontWeight="bold">
                {status.status.replace('_', ' ').toUpperCase()}
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="textSecondary">
                Location: {status.location || 'Not specified'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {new Date(status.timestamp).toLocaleString()}
              </Typography>
              {status.notes && (
                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                  Notes: {status.notes}
                </Typography>
              )}
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default ParcelTimeline;