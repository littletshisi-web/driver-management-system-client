// src/controllers/helpController.js
const getTopics = (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, title: 'Adding a driver',     slug: 'add-driver' },
      { id: 2, title: 'Logging a trip',       slug: 'log-trip' },
      { id: 3, title: 'Exporting reports',    slug: 'export-report' },
      { id: 4, title: 'Managing partners',    slug: 'manage-partners' },
      { id: 5, title: 'Scheduling shifts',    slug: 'schedule-shifts' },
    ],
  });
};

module.exports = { getTopics };
