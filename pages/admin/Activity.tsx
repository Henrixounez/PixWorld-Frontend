import axios from "axios";
import { useEffect, useState } from "react"
import { Line } from 'react-chartjs-2';

import { API_URL } from "../constants/api";
import { BoxContainer, BoxTitle } from "../pagesComponents"

interface PixelActivity {
  id: number;
  pixelPlaced: number;
  createdAt: Date;
}

function PixelActivityGraph() {
  const [pixelActivity, setPixelActivity] = useState<PixelActivity[]>([]);

  const getPixelActivity = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/activity/pixels/d`, { headers: { 'Authorization': token } });
      setPixelActivity(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getPixelActivity();
    const interval = setInterval(() => getPixelActivity(), 30 * 1000);
    return () => {
      clearInterval(interval);
    }
  }, []);

  return (
    <BoxContainer>
      <BoxTitle>
        Pixel Activity
      </BoxTitle>
      <Line
        style={{
          padding: "1rem",
        }}
        options={{
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }}
        data={{
          labels: pixelActivity.map((e) => (new Date(e.createdAt)).toLocaleTimeString('fr-FR')),
          datasets: [
            {
              label: 'Nb Pixels Placed',
              fill: false,
              lineTension: 0.1,
              borderColor: 'rgba(75,192,192,1)',
              borderCapStyle: 'butt',
              borderDash: [],
              borderDashOffset: 0.0,
              borderJoinStyle: 'miter',
              pointBorderColor: 'rgba(75,192,192,1)',
              pointBackgroundColor: '#fff',
              pointBorderWidth: 1,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: 'rgba(75,192,192,1)',
              pointHoverBorderColor: 'rgba(220,220,220,1)',
              pointHoverBorderWidth: 2,
              pointRadius: 1,
              pointHitRadius: 10,
              data: pixelActivity.map((p) => p.pixelPlaced)
            }
          ]
        }}
      />
    </BoxContainer>
  )
}

export default function PageActivity() {
  return (
    <>
      <PixelActivityGraph/>
    </>
  )
}