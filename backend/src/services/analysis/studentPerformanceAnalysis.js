import StudentsPerformance from "../../models/studentsPerformance.model.js";
import ApiError from "../../utils/ApiError.js";

export default async function getPerformance(institute_id) {
  try {
    if (!institute_id) {
      throw new ApiError(400, "Institute ID is required");
    }
    const performance = await StudentsPerformance.find({
      institute_id: institute_id,
    });
    if (!performance) {
      throw new ApiError(400, "Performance not found");
    }
    return performance;
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
}

export const getAlignmentScore = (param) =>
  Math.floor(Math.random() * (10 - 5 + 1)) + 5;
export const getAveragePoints = (param) =>
  Math.floor(Math.random() * (100 - 50 + 1)) + 100;
