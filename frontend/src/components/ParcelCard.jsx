// src/components/ParcelCard.jsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Divider
} from '@mui/material';
import {
  LocationOn,
  Person,
  LocalShipping,
  CalendarToday
} from '@mui/icons-material';

const ParcelCard = ({ parcel, onViewDetails, onUpdateStatus }) => {
  if (!parcel) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      case 'in_transit': return 'warning';
      case 'out_for_delivery': return 'info';
      default: return 'primary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
      elevation={2}
    >
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Header with Tracking Number and Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h3" noWrap sx={{ maxWidth: '60%' }}>
            {parcel.trackingNumber}
          </Typography>
          <Chip 
            label={parcel.status ? parcel.status.replace('_', ' ').toUpperCase() : 'N/A'}
            color={getStatusColor(parcel.status)}
            size="small"
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Customer Information */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Person sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
          <Box>
            <Typography variant="body2" color="textSecondary">
              Customer
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {parcel.customerName || 'N/A'}
            </Typography>
          </Box>
        </Box>

        {/* Destination */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
          <LocationOn sx={{ fontSize: 20, color: 'text.secondary', mr: 1, mt: 0.25 }} />
          <Box>
            <Typography variant="body2" color="textSecondary">
              Destination
            </Typography>
            <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
              {parcel.destination || 'N/A'}
            </Typography>
          </Box>
        </Box>

        {/* Current Location */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
          <LocalShipping sx={{ fontSize: 20, color: 'text.secondary', mr: 1, mt: 0.25 }} />
          <Box>
            <Typography variant="body2" color="textSecondary">
              Current Location
            </Typography>
            <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
              {parcel.currentLocation || 'Not specified'}
            </Typography>
          </Box>
        </Box>

        {/* Date Information */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CalendarToday sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
          <Box>
            <Typography variant="body2" color="textSecondary">
              Last Updated
            </Typography>
            <Typography variant="body1">
              {parcel.updatedAt ? formatDate(parcel.updatedAt) : 'N/A'}
            </Typography>
          </Box>
        </Box>

        {/* Additional Details */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Weight
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {parcel.weight || '0'} kg
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Dimensions
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {parcel.dimensions || 'N/A'}
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={() => onViewDetails && onViewDetails(parcel)}
          >
            View Details
          </Button>
          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={() => onUpdateStatus && onUpdateStatus(parcel)}
            disabled={parcel.status === 'delivered' || parcel.status === 'cancelled'}
          >
            Update
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ParcelCard;