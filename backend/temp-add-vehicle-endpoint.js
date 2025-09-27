// Add this to your server.js file temporarily for testing
// Add a test vehicle endpoint
app.get("/api/add-test-vehicle", async (req, res) => {
  try {
    const Vehicle = mongoose.model("Vehical");

    // Check if test vehicle already exists
    const existingVehicle = await Vehicle.findOne({ plateNumber: "tata" });
    if (existingVehicle) {
      return res.json({
        message: "Test vehicle 'tata' already exists",
        vehicle: existingVehicle,
      });
    }

    // Create test vehicle
    const vehicle = await Vehicle.create({
      plateNumber: "tata",
      vehicleType: "Bus",
      model: "Tata Marcopolo",
      capacity: 45,
      routeStatus: "Available",
    });

    res.json({
      message: "Test vehicle created successfully",
      vehicle,
    });
  } catch (error) {
    console.error("Error creating test vehicle:", error);
    res.status(500).json({
      message: "Error creating test vehicle",
      error: error.message,
    });
  }
});
