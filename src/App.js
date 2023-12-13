import "bootstrap/dist/css/bootstrap.min.css";
import $ from "jquery";
import Popper from "popper.js";
import "bootstrap/dist/js/bootstrap.bundle.min";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Component for static data
function StaticChart({ data, onClick }) {
  return (
    <div className="offset-3 container col-9">
      <h4 className="col-6 offset-4">Static Data Chart</h4>
      <button
        onClick={onClick}
        className="btn btn-primary col-4 col-sm-2 offset-1 offset-sm-4"
      >
        Update Static Data
      </button>
      <BarChart width={800} height={400} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="temperature" />
        <YAxis yAxisId="left" orientation="left" stroke="#5bc9c7" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="velocity" fill="#5bc9c7" />
        <Bar yAxisId="right" dataKey="altitude" fill="#82ca9d" />
      </BarChart>
    </div>
  );
}

// Component for live data
function LiveChart({ data }) {
  const [criticalAction, setCriticalAction] = useState(false);
  const [responseData, setResponseData] = useState(null);

  const handleActionResponse = async () => {
    // code for handling action response
    alert('data has been sent to the user');
    try {
      const dataToSend = [
        { action: "check critical status" }, 
      ];

      const response = await axios.post(
        "https://webfrontendassignment-isaraerospace.azurewebsites.net/api/ActOnSpectrum",
        dataToSend,
      );
      setResponseData(response.data);
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };
  useEffect(() => {
    if (data.length > 0 && data[0].isCriticalActionRequired) {
      setCriticalAction(true);
    } else {
      setCriticalAction(false);
    }
  }, [data]);

  const renderBars = () => {
    if (!data.length) {
      return null;
    }
    const keys = Object.keys(data[0]);

    return (
      <>
        <Bar key="velocity" dataKey={keys[0]} fill="#5bc9c7" yAxisId="left" />
        <Bar key="altitude" dataKey={keys[1]} fill="#82ca9d" yAxisId="right" />
        <XAxis dataKey={keys[2]} key="temperature" />
      </>
    );
  };

  return (
    <div className="offset-3 container col-9">
      <h4 className="col-6 offset-4">Live Data Chart</h4>
      <BarChart width={800} height={400} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <YAxis yAxisId="left" orientation="left" stroke="#5bc9c7" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <Tooltip />
        <Legend />
        {renderBars()}
      </BarChart>
      {criticalAction && (
        <div className="offset-4 col-8">
          <p>Critical action required!</p>
          <button onClick={handleActionResponse} className="btn btn-primary">
            Take Action
          </button>
        </div>
      )}
      {responseData && (
        <div>
          <h2>Response Received:</h2>
          <pre>{JSON.stringify(responseData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

function App() {
  const [staticData, setStaticData] = useState([]);
  const [liveData, setLiveData] = useState([]);

  // Fetch initial static data
  const fetchStaticData = async () => {
    try {
      const response = await axios.get(
        "https://webfrontendassignment-isaraerospace.azurewebsites.net/api/SpectrumStatus",
      );
      setStaticData([response.data]);
    } catch (error) {
      console.error("Error fetching static data:", error);
    }
  };

  // Fetch updated static data when button clicked
  const handleStaticDataUpdate = async () => {
    fetchStaticData();
  };

  useEffect(() => {
    fetchStaticData(); // Fetch initial static data
  }, []);

  // Create a WebSocket connection for live data
  useEffect(() => {
    const socket = new WebSocket(
      "wss://webfrontendassignment-isaraerospace.azurewebsites.net/api/SpectrumWS",
    );

    socket.addEventListener("open", () => {
      console.log("WebSocket connected");
    });

    socket.addEventListener("message", (event) => {
      const newData = JSON.parse(event.data);
      setLiveData((prevData) => [...prevData, newData]); // Update live data
    });

    socket.addEventListener("close", () => {
      console.log("WebSocket disconnected");
    });

    return () => {
      socket.close(); // Close WebSocket connection on component unmount
    };
  }, []);

  return (
    <div className="App container ms-2">
      <StaticChart data={staticData} onClick={handleStaticDataUpdate} />
      <LiveChart data={liveData} />
    </div>
  );
}

export default App;
