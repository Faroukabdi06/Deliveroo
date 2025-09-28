// routes/parcels.js
router.put('/:id/location', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const { currentLocation } = req.body;
  
      const parcel = await Parcel.findByIdAndUpdate(
        id,
        { 
          currentLocation,
          status: 'IN_TRANSIT', // Auto-update status
          updatedAt: new Date()
        },
        { new: true }
      );
  
      if (!parcel) {
        return res.status(404).json({ error: 'Parcel not found' });
      }
  
      res.json(parcel);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });