import Advance from "../models/advanceModel.js";
import Staff from "../models/staffModel.js"; // Needed to get staff name/salary

// @desc    Get all advance history
// @route   GET /api/advances
// @access  Private
export const getAdvances = async (req, res) => {
  try {
    const advances = await Advance.find().sort({ processedDate: -1 });
    res.status(200).json(advances);
  } catch (error) {
    console.error("Error fetching advances:", error);
    res.status(500).json({ message: "Server error fetching advance history." });
  }
};

// @desc    Create a new salary advance
// @route   POST /api/advances
// @access  Private
export const createAdvance = async (req, res) => {
  const { staffId, advanceAmount, reason, deductionMonth } = req.body;

  try {
    // 1. Get current staff details to save a snapshot
    const staff = await Staff.findById(staffId, 'name basicSalary');
    if (!staff) {
        return res.status(404).json({ message: "Staff member not found." });
    }

    // 2. Validate advance amount (re-do server-side for security)
    if (advanceAmount > staff.basicSalary / 2) {
        return res.status(400).json({ message: "Advance amount exceeds 50% of basic salary." });
    }

    // 3. Create the advance record
    const advance = new Advance({
      staffId,
      staffName: staff.name,
      basicSalarySnapshot: staff.basicSalary,
      advanceAmount,
      reason,
      deductionMonth,
      processedDate: new Date(),
      status: 'Active',
    });

    const createdAdvance = await advance.save();
    res.status(201).json(createdAdvance);
  } catch (error) {
    console.error("Error creating advance:", error);
    res.status(500).json({ message: "Server error creating advance record." });
  }
};

// @desc    Update an advance record
// @route   PUT /api/advances/:id
// @access  Private
export const updateAdvance = async (req, res) => {
  const { id } = req.params;
  const { advanceAmount, reason, deductionMonth, status } = req.body;
  
  try {
    const advance = await Advance.findById(id);
    if (!advance) {
        return res.status(404).json({ message: "Advance record not found." });
    }

    // Note: We update the advance using the saved basicSalarySnapshot for max calculation.
    if (advanceAmount > advance.basicSalarySnapshot / 2) {
        return res.status(400).json({ message: "Updated advance amount exceeds 50% of original basic salary." });
    }

    advance.advanceAmount = advanceAmount || advance.advanceAmount;
    advance.reason = reason || advance.reason;
    advance.deductionMonth = deductionMonth || advance.deductionMonth;
    advance.status = status || advance.status;
    advance.processedDate = new Date(); // Update processed date on edit

    const updatedAdvance = await advance.save();
    res.status(200).json(updatedAdvance);

  } catch (error) {
    console.error("Error updating advance:", error);
    res.status(500).json({ message: "Server error updating advance record." });
  }
};

// @desc    Delete an advance record
// @route   DELETE /api/advances/:id
// @access  Private
export const deleteAdvance = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAdvance = await Advance.findByIdAndDelete(id);

    if (!deletedAdvance) {
      return res.status(404).json({ message: "Advance record not found." });
    }

    res.status(200).json({ message: "Advance record deleted successfully." });
  } catch (error) {
    console.error("Error deleting advance:", error);
    res.status(500).json({ message: "Server error deleting advance record." });
  }
};