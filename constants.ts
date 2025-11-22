import { College } from './types';

export const COLLEGE_DATA: College[] = [
  {
    name: "IIT Madras",
    fees: "Approx. ₹2-3 Lakhs per year (varies by category)",
    courses: ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Aerospace", "Civil Engineering"],
    website: "https://www.iitm.ac.in",
    location: "Chennai, Tamil Nadu"
  },
  {
    name: "VIT Vellore",
    fees: "Approx. ₹1.98 - 7.8 Lakhs per year (based on category)",
    courses: ["CSE", "ECE", "IT", "Mechanical", "Biotech"],
    website: "https://vit.ac.in",
    location: "Vellore, Tamil Nadu"
  },
  {
    name: "SRM Institute of Science and Technology",
    fees: "Approx. ₹2.5 - 4.5 Lakhs per year",
    courses: ["CSE", "ECE", "Robotics", "Artificial Intelligence", "Cyber Security"],
    website: "https://www.srmist.edu.in",
    location: "Kattankulathur, Tamil Nadu"
  }
];

export const SYSTEM_INSTRUCTION = `
You are "CollegeSeraBot", a helpful assistant for Indian college inquiries. 
You have access to a specific dataset for IIT Madras, VIT, and SRM.

Rules:
1. If the user asks about IIT Madras, VIT, or SRM, prioritize the provided JSON data.
2. If the user asks about ANY other college (e.g., KCT, PSG, Anna University) or topic not in the JSON data, you MUST IMMEDIATELY use the 'googleSearch' tool to find the information. 
3. DO NOT say "I don't have information" or "Would you like me to search?". Just perform the search and provide the answer directly.
4. Always provide helpful, accurate details (fees, courses, location) regardless of the source (JSON or Search).

Data Context:
${JSON.stringify(COLLEGE_DATA)}
`;
