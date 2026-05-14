export const generateAQIHistory = () => {
  const data = [];
  let currentAQI = 45;
  for (let i = 0; i < 24; i++) {
    data.push({
      time: `${i}:00`,
      aqi: currentAQI,
      predicted: i > 18 ? currentAQI - 5 + Math.random() * 10 : null,
    });
    currentAQI = Math.max(20, Math.min(250, currentAQI + (Math.random() * 20 - 10)));
  }
  return data;
};

export const filterHealthData = [
  { name: 'Used', value: 82 },
  { name: 'Remaining', value: 18 },
];

export const batteryHistory = [
  { time: '10:00', level: 100 },
  { time: '12:00', level: 90 },
  { time: '14:00', level: 75 },
  { time: '16:00', level: 60 },
  { time: '18:00', level: 45 },
];
