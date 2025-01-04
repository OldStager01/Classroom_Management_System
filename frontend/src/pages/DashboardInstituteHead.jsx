"use client";
import React, { useRef, useEffect, useState } from "react";
import Chart from "chart.js/auto";
import axios from "axios";
import { API_URL } from "../constants.js";
import { useSelector } from "react-redux";
import Loader from "../components/Loader.jsx";

export default function Dashboard() {
  const classroomActivityChartRef = useRef(null);
  const impairmentChartRef = useRef(null);
  const extracurricularChartRef = useRef(null);
  const alignmentChartRef = useRef(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const [infraSuggestions, setInfraSuggestions] = useState({});
  const institute = user.institute;

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        const response = await axios.get(`${API_URL}/analysis`, {
          params: { institute_id: institute._id },
        });
        setData(response.data.data);
        console.log("Data", response.data.data);
        setLoading(false); // Stop loading once data is fetched
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false); // Stop loading even in case of error
      }
    };
    getDashboardData();
  }, [institute._id]);

  useEffect(() => {
    if (data.infrastructure_suggestions) {
      setInfraSuggestions(data.infrastructure_suggestions);
    }
  }, [data]);

  useEffect(() => {
    if (loading || !data.classroom_activities) return; // Skip if loading or data is not available yet

    // Classroom Activity Chart
    const classroomActivityChart = new Chart(
      classroomActivityChartRef.current,
      {
        type: "bar",
        data: {
          labels: (data.classroom_activities || []).map(
            (activity) => activity?.activity
          ),
          datasets: [
            {
              label: "Activity Frequency",
              data: (data.classroom_activities || []).map(
                (activity) => activity?.count
              ),
              backgroundColor: [
                "rgba(255, 99, 132, 0.6)",
                "rgba(54, 162, 235, 0.6)",
                "rgba(255, 206, 86, 0.6)",
                "rgba(75, 192, 192, 0.6)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              max: 30,
            },
          },
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: "Classroom Activity Frequency",
            },
          },
        },
      }
    );

    // Impairment Analysis Chart
    const impairmentChart = new Chart(impairmentChartRef.current, {
      type: "doughnut",
      data: {
        labels: Object.keys(data.impairment_analysis || {}),
        datasets: [
          {
            data: Object.values(data.impairment_analysis || {}),
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(75, 192, 192, 0.6)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "right",
          },
          title: {
            display: true,
            text: "Impairment Analysis",
          },
        },
      },
    });

    // Extracurricular Activities Chart
    const extracurricularChart = new Chart(extracurricularChartRef.current, {
      type: "bar",
      data: {
        labels: data.extra_curricular
          ? data.extra_curricular.map((x) => x.activity)
          : [],
        datasets: [
          {
            label: "Average Score",
            data: data.extra_curricular
              ? data.extra_curricular.map((x) => x.count)
              : [],
            backgroundColor: "rgba(255, 99, 132, 0.6)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
          {
            label: "Benchmark",
            data: [10, 10, 10, 10, 10, 10],
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            max: 20,
          },
        },
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Extracurricular Activities",
          },
        },
      },
    });

    // Alignment Score Chart
    const alignmentChart = new Chart(alignmentChartRef.current, {
      type: "radar",
      data: {
        labels: [
          "Curriculum",
          "Industry Needs",
          "Student Goals",
          "Faculty Expertise",
          "Technology Integration",
        ],
        datasets: [
          {
            label: "Score",
            data: [85, 75, 90, 95, 80],
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            pointBackgroundColor: "rgba(255, 99, 132, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(255, 99, 132, 1)",
          },
          {
            label: "Benchmark",
            data: [80, 85, 85, 90, 85],
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            pointBackgroundColor: "rgba(54, 162, 235, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(54, 162, 235, 1)",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Alignment Score and Average Points",
          },
        },
      },
    });

    return () => {
      classroomActivityChart.destroy();
      impairmentChart.destroy();
      extracurricularChart.destroy();
      alignmentChart.destroy();
    };
  }, [loading, data]);

  if (loading) {
    return (
      <div className=" flex justify-center items-center h-screen">
        <Loader />
      </div>
    ); // Show loading message or spinner
  }

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Institute Monitoring Dashboard
      </h1>
      <h2 className="text-2xl mb-4">
        Institute Name: {user.institute ? user.institute.name ?? " " : ""}
      </h2>
      <div>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Institute Score:{" "}
          {data.institute_overall_score
            ? `${data.institute_overall_score}/100`
            : "Not Evaluated"}
        </h2>
        <div className="flex gap-6 mt-5 max-h-[70vh]">
          {/* Classroom Activity Analysis */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">
              Classroom Activity Analysis
            </h2>
            <canvas ref={classroomActivityChartRef}></canvas>
          </div>

          {/* Impairment Analysis */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">
              Impairment Analysis
            </h2>
            <canvas ref={impairmentChartRef} className="mx-auto"></canvas>
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-600">
                Infrastructure Suggestions
              </h3>
              <div className="space-y-2">
                {Object.keys(infraSuggestions).map((key) => (
                  <details key={key} className="bg-gray-50 rounded-lg">
                    <summary className="font-semibold p-2 cursor-pointer hover:bg-gray-100">
                      {key}
                    </summary>
                    <ul className="p-2 space-y-1">{infraSuggestions[key]}</ul>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6 mt-5">
          {/* Training Effectiveness */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">
              Training Effectiveness
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  name: "Attendance Score",
                  score:
                    data?.avg_attendance <= 100
                      ? data?.avg_attendance
                      : 200 - data?.avg_attendance || "N/A",
                },
                {
                  name: "Faculty Score",
                  score:
                    data?.total_lectures_assigned <= 100
                      ? data?.total_lectures_assigned
                      : 200 - data?.total_lectures_assigned || "N/A",
                },
                { name: "Marks Score", score: data?.avg_score || 72 },
                { name: "Student Score", score: 88 },
              ].map((item) => (
                <div key={item.name} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2 text-gray-600">
                    {item.name}
                  </h3>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                          {item.score}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                      <div
                        style={{ width: `${item.score}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Extracurricular Activities */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">
              Extracurricular Activities
            </h2>
            <canvas ref={extracurricularChartRef}></canvas>
          </div>
        </div>

        {/* Alignment Score and Average Points */}
        <div className="max-w-[40%] max-h-[30%] mt-5 mx-auto bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">
            Alignment Score and Average Points
          </h2>
          <canvas ref={alignmentChartRef}></canvas>
        </div>
      </div>
    </div>
  );
}
