const fs = require("fs");
const axios = require("axios");
const path = require("path");

const FILE_PATH = path.join(__dirname, "../data/lecturers_no_email.json");
const API_URL = "http://localhost:5000/api/lecturers";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

async function seedLecturers() {
  const lecturers = JSON.parse(fs.readFileSync(FILE_PATH, "utf8"));

  for (const lecturer of lecturers) {
    try {
      const res = await axios.post(
        API_URL,
        {
          name: lecturer.name,
          email: lecturer.email || "",
          department: lecturer.department,
        },
        {
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`,
          },
        }
      );
      console.log(`Lecturer "${lecturer.name}" added successfully`);
    } catch (err) {
      console.error(`❌ Error adding ${lecturer.name}:`);
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Response data:", err.response.data);
      } else if (err.request) {
        console.error("No response received. Request was:", err.request);
      } else {
        console.error("Error:", err.message);
      }
    }
  }
}

seedLecturers();
