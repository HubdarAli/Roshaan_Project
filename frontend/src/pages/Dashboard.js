import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { REACT_APP_API_URL } from "../env";
import Chart from 'react-apexcharts';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const DashboardPage = () => {
  const co2ReductionRef = useRef(null);
  const co2EmissionsByDateRef = useRef(null);
  const co2EmissionsByCategoryRef = useRef(null);
  const co2EmissionsTrendRef = useRef(null);

  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [companyCount, setCompanyCount] = useState(0);
  const [emissionsCount, setEmissionsCount] = useState(0);

  const [co2Reduction, setco2Reduction] = useState({
    chart: {
      type: "line",
      zoom: { enabled: false },
    },
    title: {
      text: "CO₂ Reduction Over Time",
    },
    xaxis: {
      categories: [], // Initially empty, update dynamically
      labels: {
        rotate: -45, // Rotate labels for better visibility
      },
    },
    yaxis: {
      title: {
        text: "Total Records",
      },
    },
    tooltip: {
      valueSuffix: " MT",
    },
    series: [
      {
        name: "Total Records",
        data: [],
      },
    ],
    credits: {
      enabled: false,
    },
  });

  const [co2EmissionsByDate, setCo2EmissionsByDate] = useState({
    chart: {
      type: "bar",
      zoom: { enabled: false },
    },
    title: {
      text: "CO₂ Emissions by Date",
      align: "left",
      style: { fontWeight: "bold" },
    },
    xaxis: {
      labels: {
        format: "dd-mm-yyy", // Format dates correctly
        rotate: -45, // Rotates labels for better readability
      },
    },
    tooltip: {
      x: { format: "dd-mm-yyyy" },
    },
    plotOptions: {
      bar: {
        columnWidth: "50%",
        distributed: true, // Different colors for each bar
      },
    },
    colors: [
      "#E74C3C", "#3498DB", "#2ECC71", "#F1C40F", "#9B59B6",
      "#1ABC9C", "#E67E22", "#D35400", "#34495E", "#7F8C8D"
    ],
    // dataLabels: { enabled: false },
    legend: {
      show: false, // Show only series name
    },
  });

  const [co2EmissionsByDateSeries, setCo2EmissionsByDateSeries] = useState([]);

  // CO2 Emissions by Category 
  const [co2EmissionsByCategory, setco2EmissionsByCategory] = useState({
    chart: {
      type: "pie",
    },
    title: {
      text: "CO₂ Emissions by Category",
    },
    labels: [],
    tooltip: {
      y: {
        formatter: (val) => `${val} Tons`,
      },
    },
    legend: {
      position: "bottom",
    },

  });

  const [co2EmissionsByCategorySeries, setco2EmissionsByCategorySeries] = useState([]);

  const [co2EmissionsTrend, setCo2EmissionsTrend] = useState({
    chart: {
      scrollablePlotArea: {
        minWidth: 100,
      },
      zoom: { enabled: false },

    },
    title: {
      text: "CO2 Emissions Trend ",
      align: "left",
    },
    xAxis: {
      type: "datetime",
      tickInterval: 365 * 24 * 3600 * 1000, // 1 year interval
      labels: {
        format: "{value:%Y}", // Shows year (e.g., 2024, 2025)
      }
    },
    yAxis: [
      {
        title: {
          text: null,
        },
        labels: {
          align: "left",
          x: 3,
          y: 16,
          format: "{value:.,0f}",
        },
        showFirstLabel: false,
      },
      {
        linkedTo: 0,
        gridLineWidth: 0,
        opposite: true,
        title: {
          text: null,
        },
        labels: {
          align: "right",
          x: -3,
          y: 16,
          format: "{value:.,0f}",
        },
        showFirstLabel: false,
      },
    ],
    legend: {
      align: "left",
      verticalAlign: "top",
      borderWidth: 0,
    },
    tooltip: {
      shared: true,
      crosshairs: true,
    },
    plotOptions: {
      series: {
        cursor: "pointer",
        className: "popup-on-click",
        marker: {
          lineWidth: 1,
        },
      },
    },
    series: [
      {
        name: "CO₂ Emissions",
        data: [],
        // lineWidth: 4,
        // marker: {
        //   radius: 4,
        // },
      },

    ],
    stroke: {
      curve: "smooth",
      width: 3,
    },
  });


  useEffect(() => {
    document.body.className = `${theme}-theme`;

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userObj = JSON.parse(localStorage.getItem("userObj"));
        if (token && userObj) {
          setUserData(userObj);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // Helper function to fetch data
      const fetchData = async (url, errorMessage) => {
        try {
          const response = await fetch(url, { method: "GET", headers });
          if (!response.ok) {
            throw new Error(errorMessage);
          }
          return response.json();
        } catch (error) {
          console.error(errorMessage, error);
          return null;
        }
      };

      try {
        const [employeeData, companyData, emissionsData, redutionOverTime, emissionsByDate, emissionsByCategory, emissionsTrend] = await Promise.all([
          fetchData(
            `${REACT_APP_API_URL}/employees`,
            "Failed to fetch employee count"
          ),
          fetchData(
            `${REACT_APP_API_URL}/companies`,
            "Failed to fetch company count"
          ),
          fetchData(
            `${REACT_APP_API_URL}/emissions`,
            "Failed to fetch emissions count"
          ),

          //dashboard graphs services
          fetchData(
            `${REACT_APP_API_URL}/dashboard/redution-over-time`,
            "Failed to fetch redution-over-time count"
          ),
          fetchData(
            `${REACT_APP_API_URL}/dashboard/emissions-by-date`,
            "Failed to fetch emissions-by-date count"
          ),
          fetchData(
            `${REACT_APP_API_URL}/dashboard/emissions-by-category`,
            "Failed to fetch emissions-by-category count"
          ),
          fetchData(
            `${REACT_APP_API_URL}/dashboard/emissions-trend`,
            "Failed to fetch emissions-trend count"
          ),
        ]);

        console.log("emissionsTrend:", emissionsTrend);
        // Update state with fetched data
        setEmployeeCount(employeeData?.length || 0);
        setCompanyCount(companyData?.length || 0);
        setEmissionsCount(emissionsData?.length || 0);

        const dateArray = redutionOverTime.map(item => {
          const [year, month] = item.date.split("-");
          return new Date(year, month - 1).toLocaleString("en-US", { month: "short", year: "numeric" }).replace(" ", "-");
        });
        const recordsArray = redutionOverTime.map(item => item.total_emission);

        setco2Reduction(prev => ({
          ...prev,
          xaxis: { ...prev.xaxis, categories: dateArray },
          series: [{ name: "Total Records", data: recordsArray }]
        }));

        const dateByArray = emissionsByDate.map(item => {
          const fullDate = dateFormat(item.date);
          return { x: fullDate, y: item.total_emissions };
        });

        setCo2EmissionsByDateSeries([
          {
            name: "CO₂ Emissions",
            data: dateByArray,
          },
        ]);


        setco2EmissionsByCategory(prev => ({
          ...prev,
          labels: emissionsByCategory.map(item => item.categoryTitle),
        }));
        setco2EmissionsByCategorySeries(emissionsByCategory.map(item => item.totalEmissions));

        const emissionsDataArray = emissionsTrend.map(item => [item.year, item.totalEmissions]);
        setCo2EmissionsTrend(prevState => ({
          ...prevState,
          series: [{ ...prevState.series[0], data: emissionsDataArray }],
        }));
      } catch (error) {
        console.error("Error fetching stats", error);
      }
    };

    fetchUserData();
    fetchStats();
  }, [navigate, theme]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userObj");
    localStorage.clear();
    navigate("/");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = `${newTheme}-theme`;
  };

  // Function to download chart as PDF
  const downloadPDF = (chartRef, title) => {
    if (!chartRef.current) return;
    const chartElement = chartRef.current;

    html2canvas(chartElement).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape");
      pdf.addImage(imgData, "PNG", 10, 10, 280, 150);
      pdf.save(`${title}.pdf`);
    });
  };

  const downloadAllPDFs = async () => {
    const pdf = new jsPDF("portrait", "mm", "a4");
    const charts = [
      { ref: co2ReductionRef },
      { ref: co2EmissionsByDateRef },
      { ref: co2EmissionsByCategoryRef },
      { ref: co2EmissionsTrendRef},
    ];
  
    for (let i = 0; i < charts.length; i++) {
      const { ref } = charts[i];
  
      if (!ref.current) continue;
  
      const canvas = await html2canvas(ref.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
      if (i !== 0) pdf.addPage(); // Add a new page for each chart except the first
      pdf.setFontSize(16);
      pdf.addImage(imgData, "PNG", 10, 20, pdfWidth - 20, pdfHeight - 20);
    }
  
    pdf.save("All_CO2_Emissions_Charts.pdf");
  };

  const dateFormat = (date) => {
    const fullDate = new Date(date);
    const day = String(fullDate.getDate()).padStart(2, "0"); // Ensure two digits
    const month = String(fullDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = fullDate.getFullYear();

    return `${day}-${month}-${year}`;
  }
  
  return (
    <div className={`dashboard-container bg-${theme}`}>
      <nav
        className={`navbar navbar-expand-lg navbar-${theme} bg-${theme} mb-4`}
      >
        <div className="container">
          <div className="container">
            <span className="navbar-brand d-flex align-items-center">
              <i className="fas fa-hand-peace me-2"></i>
              <div>
                <span
                  className="d-block"
                  style={{ fontSize: "1.2rem", fontWeight: "bold" }}
                >
                  Welcome,{" "}
                  <span className="text-primary">{userData?.username}</span>
                </span>
                <span
                  className="d-block"
                  style={{ fontSize: "0.9rem", fontStyle: "italic" }}
                >
                  It's a great day to be productive! ✨
                </span>
              </div>
            </span>
          </div>
          <div className="d-flex">
            {/* Theme toggle button with icons */}
            <button
              className="btn btn-outline-primary me-2"
              onClick={toggleTheme}
            >
              {theme === "light" ? (
                <i className="fas fa-moon"></i> // Moon icon for Dark Mode
              ) : (
                <i className="fas fa-sun"></i> // Sun icon for Light Mode
              )}
            </button>
            <button className="btn btn-outline-primary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container text-center">
        {/* Dashboard stats */}
        <div className="row g-4">
          {/* Employees Card */}
          <div className="col-md-4">
            <div
              className={`card shadow-lg h-100 bg-${theme} text-${theme === "light" ? "dark" : "light"
                } rounded-3`}
            >
              <div className="card-header d-flex align-items-center">
                <i className="fas fa-users fa-2x me-3"></i>
                <h4 className="card-title mb-0">Employees</h4>
              </div>
              <div className="card-body text-center">
                <div className="display-4 font-weight-bold mt-2">
                  {employeeCount}
                </div>
                <p className="card-text mt-2">
                  <span className="text-muted">Employees</span>
                </p>
              </div>
              <div className="card-footer text-center">
                <button
                  className="btn btn-info w-100 rounded-pill shadow-sm"
                  onClick={() => navigate("/employees")}
                >
                  Manage Employees
                </button>
              </div>
            </div>
          </div>

          {/* Companies Card */}
          <div className="col-md-4">
            <div
              className={`card shadow-lg h-100 bg-${theme} text-${theme === "light" ? "dark" : "light"
                } rounded-3`}
            >
              <div className="card-header d-flex align-items-center">
                <i className="fas fa-users fa-2x me-3"></i>
                <h4 className="card-title mb-0">Companies</h4>
              </div>
              <div className="card-body text-center">
                <div className="display-4 font-weight-bold mt-2">
                  {companyCount}
                </div>
                <p className="card-text mt-2">
                  <span className="text-muted">Companies</span>
                </p>
              </div>
              <div className="card-footer text-center">
                <button
                  className="btn btn-info w-100"
                  onClick={() => navigate("/companies")}
                >
                  Manage Companies
                </button>
              </div>
            </div>
          </div>

          {/* Emission Records Card */}
          <div className="col-md-4">
            <div
              className={`card shadow-lg h-100 bg-${theme} text-${theme === "light" ? "dark" : "light"
                } rounded-3`}
            >
              <div className="card-header d-flex align-items-center">
                <i className="fas fa-chart-line fa-2x me-3"></i>
                <h4 className="card-title mb-0">Emission Records</h4>
              </div>
              <div className="card-body text-center">
                <div className="display-4 font-weight-bold mt-2">
                  {emissionsCount}
                </div>
                <p className="card-text mt-2">
                  <span className="text-muted">Emissions</span>
                </p>
              </div>
              <div className="card-footer text-center">
                <button
                  className="btn btn-info w-100"
                  onClick={() => navigate("/emissions")}
                >
                  View Emission Records
                </button>
              </div>
            </div>
          </div>
          {/* Emission Type Card */}
          <div className="col-md-4">
            <div
              className={`card shadow-lg h-100 bg-${theme} text-${theme === "light" ? "dark" : "light"
                } rounded-3`}
            >
              <div className="card-header d-flex align-items-center">
                <i className="fas fa-chart-line fa-2x me-3"></i>
                <h4 className="card-title mb-0">Emission Type</h4>
              </div>
              <div className="card-body text-center">
                <div className="display-4 font-weight-bold mt-2">
                  {emissionsCount}
                </div>
                <p className="card-text mt-2">
                  <span className="text-muted">Emissions</span>
                </p>
              </div>
              <div className="card-footer text-center">
                <button
                  className="btn btn-info w-100"
                  onClick={() => navigate("/emission-types")}
                >
                  View Emission Type
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* graph work */}

        <div className="row mt-3">
          <div className="col-12">
            <button onClick={downloadAllPDFs} className="btn btn-info float-end mx-3">
              <i className="fas fa-file-pdf"></i> Download All Graphs
            </button>
          </div>
        </div>
        <div className="row mt-3 mb-5">
          <div className="col-md-6">

            <div
              className={`card shadow-lg h-100 bg-${theme} text-${theme === "light" ? "dark" : "light"
                } rounded-3`}
            >
              <div className="card-body text-center">
                <div className="report-chart">
                  {/* <button onClick={() => downloadPDF(co2ReductionRef, "CO2 Reduction")} className="graph-pdf-btn">
                    <i className="fas fa-file-pdf"></i>
                  </button> */}
                  <div className="" ref={co2ReductionRef}>
                    <Chart
                      className="mt-6 -mb-6"
                      options={co2Reduction}
                      series={co2Reduction.series}
                      type="line"
                      height={350}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div
              className={`card shadow-lg h-100 bg-${theme} text-${theme === "light" ? "dark" : "light"
                } rounded-3`}
            >
              <div className="card-body text-center">
                <div className="report-chart">
                  {/* <button onClick={() => downloadPDF(co2EmissionsByDateRef, "CO2 Emissions By Date")} className="graph-pdf-btn">
                    <i className="fas fa-file-pdf"></i>
                  </button> */}
                  <div className="" ref={co2EmissionsByDateRef}>
                    <Chart
                      className="mt-6 -mb-6"
                      options={co2EmissionsByDate}
                      series={co2EmissionsByDateSeries}
                      type="bar"
                      height={350}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 mt-2">
            <div
              className={`card shadow-lg h-100 bg-${theme} text-${theme === "light" ? "dark" : "light"
                } rounded-3`}
            >
              <div className="card-body text-center">
                <div className="report-chart">
                  {/* <button onClick={() => downloadPDF(co2EmissionsByCategoryRef, "CO2 Emissions By Category")} className="graph-pdf-btn">
                    <i className="fas fa-file-pdf"></i>
                  </button> */}
                  <div className="" ref={co2EmissionsByCategoryRef}>
                    <Chart
                      className="mt-6 -mb-6"
                      options={co2EmissionsByCategory}
                      series={co2EmissionsByCategorySeries}
                      type="pie"
                      height={350}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 mt-2">
            <div
              className={`card shadow-lg h-100 bg-${theme} text-${theme === "light" ? "dark" : "light"
                } rounded-3`}
            >

              <div className="card-body text-center">

                <div className="report-chart">
                  {/* <button onClick={() => downloadPDF(co2EmissionsTrendRef, "CO2 Emissions Trend")} className="graph-pdf-btn">
                    <i className="fas fa-file-pdf"></i>
                  </button> */}
                  <div className="" ref={co2EmissionsTrendRef}>
                    <Chart options={co2EmissionsTrend} series={co2EmissionsTrend.series} type="line" height={350} />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
        {/* end graph work */}
      </div>
    </div>
  );
};

export default DashboardPage;
