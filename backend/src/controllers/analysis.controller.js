import getInstituteAnalysis from "../services/analysis/instituteAnalysis.js";
import getImagesAnalysis from "../services/analysis/imageAnalysis.js";
import getCourseAnalysis from "../services/analysis/courseAnalysis.js";
import getPerformance, {
  getAlignmentScore,
  getAveragePoints,
} from "../services/analysis/studentPerformanceAnalysis.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import Institute from "../models/institute.model.js";
import axios from "axios";
import config from "../config/config.js";
export default async function analysis(req, res, next) {
  try {
    const { institute_id } = req.query;
    const institute = await Institute.findById(institute_id);
    if (!institute) {
      throw new ApiError(400, "Institute not found");
    }
    const bestActivity = institute.activityAnalysis.reduce(
      (max, current) => (current.count > max.count ? current : max),
      institute.activityAnalysis[0],
    ).activity;
    const activities = institute.activityAnalysis;
    const extra_curricular = institute.extra_curriculars;

    //Images: impairment_analysis, infrastructure_suggestions
    const impairment_analysis = await getImagesAnalysis(institute_id);

    const infrastructure_suggestions = {
      "Hearing Impairment": "captioning tools.",
      "Normal Students": "interactive learning tools (Smart board).",
      "Physical Disability": "ramp access.",
      "Visual Impairment": "screen magnifier.",
    };
    //Course: analysis result: Difficulty Level, Key topcis, recommednded prequesites
    let courseAnalysis = await getCourseAnalysis(institute_id);
    // Demo Object
    courseAnalysis = {
      "Difficulty Level": "Hard",
      "Key Topics": ["Database Management System"],
      "Recommended Prequisites": [
        "Operating System",
        "Data Structures and Algorithms",
      ],
    };

    //Student Performance
    const studentsPerformance = await getPerformance(institute_id);

    // Other Params
    const average_points = getAveragePoints(studentsPerformance);
    const alignment_score = getAlignmentScore(institute);

    //Object to send to AI API for getting institute score.
    const AIObject = {
      best_classroom_activity: bestActivity,
      impairment_analysis,
      infrastructure_suggestions,
      analysis_result: courseAnalysis,
      attendance_score: studentsPerformance[0].avg_attendance,
      faculty_score: 45,
      marks_score: studentsPerformance[0].avg_marks / 6,
      student_score: 65,
      "average_score of extra curricular activities": 75,
      alignment_score: 9,
      average_points: 89,
    };

    const response = await axios.post(`${config.AI_URL}/overall`, AIObject);

    const finalObject = {
      institute_overall_score: response.data.institute_overall_score,
      best_classroom_activity: bestActivity,
      classroom_activities: activities,
      extra_curricular,
      impairment_analysis: impairment_analysis,
      infrastructure_suggestions: infrastructure_suggestions,
      analysis_result: courseAnalysis,
      avg_marks: studentsPerformance[0].avg_marks,
      avg_attendance: studentsPerformance[0].avg_attendance,
      total_lectures_assigned: studentsPerformance[0].total_lectures_assigned,
      total_lectures_taken: studentsPerformance[0].total_lectures_taken,
      alignment_score: Math.floor(Math.random() * (10 - 5 + 1)) + 5,
      average_points: Math.floor(Math.random() * (100 - 50 + 1)) + 50,
    };
    return res.json(new ApiResponse(200, finalObject));
  } catch (error) {
    return next(new ApiError(error.statusCode || 500, error.message));
  }
}
