// server.js
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Mock database
let devices = [
  { id: "device-001", lastSync: "2025-05-27T10:30:00Z", status: "success" },
  { id: "device-002", lastSync: "2025-05-27T09:45:00Z", status: "failed" },
  { id: "device-003", lastSync: "2025-05-27T08:15:00Z", status: "pending" },
  { id: "device-004", lastSync: "2025-05-27T07:30:00Z", status: "success" },
  { id: "device-005", lastSync: "2025-05-27T06:45:00Z", status: "pending" },
  { id: "device-006", lastSync: "2025-05-27T05:15:00Z", status: "failed" },
  { id: "device-007", lastSync: "2025-05-27T04:30:00Z", status: "success" },
  { id: "device-008", lastSync: "2025-05-27T03:45:00Z", status: "success" },
  { id: "device-009", lastSync: "2025-05-27T02:15:00Z", status: "pending" },
  { id: "device-010", lastSync: "2025-05-27T01:30:00Z", status: "failed" },
  { id: "device-011", lastSync: "2025-05-26T23:45:00Z", status: "success" },
  { id: "device-012", lastSync: "2025-05-26T22:15:00Z", status: "pending" },
  { id: "device-013", lastSync: "2025-05-26T21:30:00Z", status: "success" },
  { id: "device-014", lastSync: "2025-05-26T20:45:00Z", status: "failed" },
  { id: "device-015", lastSync: "2025-05-26T19:15:00Z", status: "success" },
  { id: "device-016", lastSync: "2025-05-26T18:30:00Z", status: "pending" },
  { id: "device-017", lastSync: "2025-05-26T17:45:00Z", status: "failed" },
  { id: "device-018", lastSync: "2025-05-26T16:15:00Z", status: "success" },
  { id: "device-019", lastSync: "2025-05-26T15:30:00Z", status: "pending" },
  { id: "device-020", lastSync: "2025-05-26T14:45:00Z", status: "success" },
];

let errorLogs = [
  {
    deviceId: "device-002",
    message: "Connection timeout",
    date: "2025-05-27T09:45:00Z",
  },
  {
    deviceId: "device-004",
    message: "Invalid data format",
    date: "2025-05-26T18:20:00Z",
  },
];

// API: Fetch device list with sync status
app.get("/devices", (req, res) => {
  res.json(devices);
});

// API: Trigger sync for a device
app.post("/devices/:id/sync", (req, res) => {
  const deviceId = req.params.id;
  const device = devices.find((d) => d.id === deviceId);
  if (device) {
    device.lastSync = new Date().toISOString();
    // 15% chance of failure like in refresh endpoint
    if (Math.random() < 0.15) {
      device.status = "failed";
      const possibleErrors = [
        "Connection timeout",
        "Invalid data format",
        "Authentication failed",
        "Network error",
      ];
      const errorMessage =
        possibleErrors[Math.floor(Math.random() * possibleErrors.length)];
      errorLogs.push({
        deviceId: device.id,
        message: errorMessage,
        date: device.lastSync,
      });
      res.json({ message: `Sync failed for ${deviceId}`, error: errorMessage, device });
    } else {
      device.status = "success";
      res.json({ message: `Sync triggered for ${deviceId}`, device });
    }
  } else {
    res.status(404).json({ message: "Device not found" });
  }
});

// API: Fetch recent error logs
app.get("/errors", (req, res) => {
  res.json(errorLogs);
});

// API: Refresh all devices with random errors
app.post("/refresh", (req, res) => {
  const currentTime = new Date().toISOString();
  const possibleErrors = [
    "Connection timeout",
    "Invalid data format",
    "Authentication failed",
    "Network error",
  ];

  // Clear previous error logs
  errorLogs = [];

  // Update all devices with new sync time
  devices = devices.map((device) => {
    // 15% chance of failure
    if (Math.random() < 0.15) {
      device.status = "failed";
      // Add to error logs
      errorLogs.push({
        deviceId: device.id,
        message:
          possibleErrors[Math.floor(Math.random() * possibleErrors.length)],
        date: currentTime,
      });
    } else {
      device.status = "success";
    }
    device.lastSync = currentTime;
    return device;
  });

  res.json({
    message: "Refresh complete",
    devices,
    errors: errorLogs,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
