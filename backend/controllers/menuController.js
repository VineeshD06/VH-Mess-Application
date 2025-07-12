const { MenuItem } = require('../config/database');

const getCurrentMenu = async (req, res) => {
  try {
    const menu = await MenuItem.findAll({
      where: { is_active: true },
      order: [
        ['day_of_week', 'ASC'],
        ['meal_type', 'ASC'],
      ],
    });

    if (!menu || menu.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active menu found. Please ask the admin to upload one.',
      });
    }

    const lastUpdated = await MenuItem.max('updatedAt', {
      where: { is_active: true },
    });

    res.status(200).json({
      success: true,
      lastUpdated, 
      menu,
    });

  } catch (error) {
    console.error('Error fetching current menu:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
};

const getLastUpdatedTime = async (req, res) => {
  try {
    const lastUpdated = await MenuItem.max('updatedAt', {
      where: { is_active: true },
    });

    if (!lastUpdated) {
      return res.status(404).json({
        success: false,
        message: 'No active menu found.',
      });
    }

    res.status(200).json({
      success: true,
      lastUpdated,
    });
  } catch (error) {
    console.error('Error fetching last updated time:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
};


module.exports = {
    getCurrentMenu,
    getLastUpdatedTime
};

