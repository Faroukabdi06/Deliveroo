// src/components/ParcelMap.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const ParcelMap = ({ currentLocation, currentLat, currentLng, onLocationSelect }) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setMapLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleMapClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Simulate coordinates based on click position
    const lat = 40.7128 + (y / rect.height - 0.5) * 0.1;
    const lng = -74.0060 + (x / rect.width - 0.5) * 0.1;
    
    if (onLocationSelect) {
      onLocationSelect({ lat, lng });
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        backgroundColor: '#e3f2fd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed #1976d2',
        borderRadius: 1,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={handleMapClick}
    >
      {!mapLoaded ? (
        <Typography>Loading map...</Typography>
      ) : (
        <>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              height: '100%',
              background: `
                linear-gradient(90deg, #bbdefb 1px, transparent 1px),
                linear-gradient(180deg, #bbdefb 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />
          
          {/* Current location marker */}
          {(currentLat && currentLng) && (
            <Box
              sx={{
                position: 'absolute',
                left: `${((parseFloat(currentLng) + 74.0060) / 0.1 + 0.5) * 100}%`,
                top: `${((parseFloat(currentLat) - 40.7128) / 0.1 + 0.5) * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: 12,
                height: 12,
                backgroundColor: '#f44336',
                border: '2px solid white',
                borderRadius: '50%',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            />
          )}
          
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: 1,
              borderRadius: 1
            }}
          >
            <Typography variant="body2" color="textSecondary">
              Click on map to set location
            </Typography>
            {(currentLat && currentLng) && (
              <Typography variant="caption">
                Current: {currentLat}, {currentLng}
              </Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default ParcelMap;