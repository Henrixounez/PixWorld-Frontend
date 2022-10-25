import axios from "axios";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react"
import { Line, Pie } from 'react-chartjs-2';
import styled, { css } from "styled-components";

import { API_URL } from "../constants/api";
import { BoxContainer, BoxRow, BoxTitle } from "../pagesComponents"

const RankingTable = styled.table`
  gap: 0;
  row-gap: 0;
  column-gap: 0;
  border-spacing: 0;
  border-collapse: collapse;
  width: 100%;
  td {
    padding: 0.5rem 1rem;
    margin: 0;
    text-align: center;
  }

  tr:nth-child(even) {
    background-color: rgba(0,0,0,0.3);
  }
`;
const RankingSwitchButton = styled.div<{selected: boolean}>`
  cursor: pointer;

  transition: .2s;
  font-size: 1.2rem;
  line-height: 2rem;
  width: 5rem;
  text-align: center;
  &:hover {
    color: #4bc0c0;
  }
  ${({ selected }) => selected && css`
    font-size: 1.5rem;
    color: #4bc0c0;
  `}
`;
const ChartWrapper = styled.div`
  max-height: 500px;

  canvas {
    max-width: 100% !important;
    height: 50vw !important;
    max-height: 500px !important;
  }
`;

enum RankingType {
  TOTAL = 'totalRanking',
  DAILY = 'dailyRanking',
}
interface Rankings {
  totalRanking: Array<{ username: string, dailyPixels: number, totalPixels: number }>
  dailyRanking: Array<{ username: string, dailyPixels: number, totalPixels: number }>
}
function Rankings() {
  const { t } = useTranslation('stats');
  const [currentRanking, setCurrentRanking] = useState(RankingType.TOTAL);
  const [rankings, setRankings] = useState<Rankings>({ totalRanking: [], dailyRanking: [] });

  const getRankings = async () => {
    try {
      const res = await axios.get(`${API_URL}/ranking`);
      setRankings(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getRankings();
  }, []);

  return (
    <BoxContainer>
      <BoxTitle style={{ marginBottom: 0 }}>
        {t('ranking.title')}
      </BoxTitle>
      <BoxRow style={{ justifyContent: "center", paddingTop: 0 }}>
        <RankingSwitchButton
          onClick={() => setCurrentRanking(RankingType.TOTAL)}
          selected={currentRanking === RankingType.TOTAL}
        >
          {t('ranking.totalRanking')}
        </RankingSwitchButton>
        <RankingSwitchButton
          onClick={() => setCurrentRanking(RankingType.DAILY)}
          selected={currentRanking === RankingType.DAILY}
        >
          {t('ranking.dailyRanking')}
        </RankingSwitchButton>
      </BoxRow>
      <BoxRow style={{ overflowY: "auto", maxHeight: "500px", paddingLeft: 0, paddingRight: 0, alignItems: "baseline" }}>
        <RankingTable>
          <thead>
            <tr>
              <th>#</th>
              <th style={{ wordBreak: "break-all" }}>{t('ranking.username')}</th>
              <th>{t('ranking.pixels')}</th>
            </tr>
          </thead>
          <tbody>
            {rankings[currentRanking].map((r, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{r.username}</td>
                <td>{currentRanking === RankingType.TOTAL ? r.totalPixels : r.dailyPixels}</td>
              </tr>
            ))}
          </tbody>
        </RankingTable>
      </BoxRow>
      <BoxRow style={{ paddingTop: 0 }}>
        <span style={{ fontWeight: "lighter", fontSize: "0.8rem", color: "#777" }}>
          {t('ranking.reset')}
        </span>
      </BoxRow>
    </BoxContainer>
  )
}

enum PixelActivityWindow {
  DAY = "d",
  WEEK = "w",
  MONTH = "m"
}
interface PixelActivity {
  id: number;
  pixelPlaced: number;
  createdAt: Date;
}

function PixelActivityGraph() {
  const { t } = useTranslation('stats');
  const [window, setWindow] = useState(PixelActivityWindow.DAY);
  const [pixelActivity, setPixelActivity] = useState<PixelActivity[]>([]);

  const getPixelActivity = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/activity/pixels/${window}`, { headers: { 'Authorization': token } });
      setPixelActivity(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getPixelActivity();
    const interval = setInterval(() => getPixelActivity(), 2 * 60 * 1000);
    return () => {
      clearInterval(interval);
    }
  }, [window]);

  return (
    <BoxContainer>
      <BoxTitle>
        {t('activity.pixels.title')}
      </BoxTitle>
      <BoxRow style={{ justifyContent: "center", paddingTop: 0 }}>
        <RankingSwitchButton
          onClick={() => setWindow(PixelActivityWindow.DAY)}
          selected={window === PixelActivityWindow.DAY}
        >
          {t('activity.pixels.day')}
        </RankingSwitchButton>
        <RankingSwitchButton
          onClick={() => setWindow(PixelActivityWindow.WEEK)}
          selected={window === PixelActivityWindow.WEEK}
        >
          {t('activity.pixels.week')}
        </RankingSwitchButton>
        <RankingSwitchButton
          onClick={() => setWindow(PixelActivityWindow.MONTH)}
          selected={window === PixelActivityWindow.MONTH}
        >
          {t('activity.pixels.month')}
        </RankingSwitchButton>
      </BoxRow>
      <ChartWrapper>
        <Line
          style={{
            padding: "1rem",
          }}
          options={{
            maintainAspectRatio: false,
            responsive: true,
            scales: {
              y: {
                beginAtZero: true
              }
            },
            animation: false,
          }}
          data={{
            labels: pixelActivity.map((e) => (new Date(e.createdAt)).toLocaleTimeString('fr-FR')),
            datasets: [
              {
                label: t('activity.pixels.legend'),
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
          height={500}
          width={1500}
        />
      </ChartWrapper>
    </BoxContainer>
  )
}



function PixelColorsGraph() {
  const { t } = useTranslation('stats');
  const [pixelColors, setPixelColors] = useState<Record<string, number>>({});

  const getPixelActivity = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/activity/colors`, { headers: { 'Authorization': token } });
      setPixelColors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getPixelActivity();
    const interval = setInterval(() => getPixelActivity(), 2 * 60 * 1000);
    return () => {
      clearInterval(interval);
    }
  }, []);

  return (
    <BoxContainer>
      <BoxTitle>
        {t('activity.colors.title')}
      </BoxTitle>
      <ChartWrapper>
        <Pie
          style={{
            padding: "1rem",
          }}
          options={{
            maintainAspectRatio: false,
            responsive: true,
          }}
          data={{
            datasets: [
              {
                label: 'Placed colors',
                data: Object.keys(pixelColors).map((e) => pixelColors[e]),
                backgroundColor: Object.keys(pixelColors),
                borderWidth: 0,
              }
            ]
          }}
          height={500}
          width={1500}
        />
      </ChartWrapper>
    </BoxContainer>
  )
}

export default function PageActivity() {
  return (
    <>
      <Rankings/>
      <PixelActivityGraph/>
      <PixelColorsGraph/>
    </>
  )
}