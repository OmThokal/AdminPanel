import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Settings.css";

const API_URL = "http://localhost:8080/api/settings";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "",
    email: "",
    theme: "light",
    notificationsEnabled: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(API_URL);
        if (res.data) setSettings(res.data);
      } catch (err) {
        console.error("Error fetching settings", err);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({ ...settings, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(API_URL, settings);
      setMessage("✅ Settings updated successfully!");
      setSettings(res.data);
    } catch (err) {
      setMessage("❌ Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <h2>⚙️ Admin Settings</h2>

      <form className="settings-form" onSubmit={handleSubmit}>
        <label>
          Site Name:
          <input
            type="text"
            name="siteName"
            value={settings.siteName}
            onChange={handleChange}
          />
        </label>

        <label>
          Admin Email:
          <input
            type="email"
            name="email"
            value={settings.email}
            onChange={handleChange}
          />
        </label>

        <label>
          Theme:
          <select
            name="theme"
            value={settings.theme}
            onChange={handleChange}
          >
            <option value="light">🌞 Light</option>
            <option value="dark">🌙 Dark</option>
          </select>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="notificationsEnabled"
            checked={settings.notificationsEnabled}
            onChange={handleChange}
          />
          Enable Notifications
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
}
