import React, { useEffect, useState } from 'react';
import { Settings, Power, Moon, Sun, Wind, Battery, Droplets, Thermometer, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { generateAQIHistory, filterHealthData, batteryHistory } from './utils/mockData';
import { supabase } from './lib/supabase';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [aqiData] = useState(generateAQIHistory());
  const [envData, setEnvData] = useState({ temp: 22, humidity: 45 });
  const [activeMode, setActiveMode] = useState('auto');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    // Supabase Realtime Subscription Simulation
    const channel = supabase.channel('room_sensor_data')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_data' }, payload => {
        if (payload.new) {
          setEnvData({
            temp: payload.new.temperature || envData.temp,
            humidity: payload.new.humidity || envData.humidity
          });
        }
      })
      .subscribe();

    // Mock live updates if no supabase connection
    const interval = setInterval(() => {
      setEnvData(prev => ({
        temp: prev.temp + (Math.random() * 0.4 - 0.2),
        humidity: prev.humidity + (Math.random() * 2 - 1)
      }));
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const modes = [
    { id: 'sleep', name: 'Sleep Mode', icon: Moon, power: '12W', noise: '20dB' },
    { id: 'eco', name: 'Eco Mode', icon: Wind, power: '25W', noise: '35dB' },
    { id: 'turbo', name: 'Turbo Mode', icon: Zap, power: '65W', noise: '55dB' },
    { id: 'auto', name: 'Auto Mode', icon: Settings, power: 'Var', noise: 'Var' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative overflow-hidden font-sans">
      {/* Ambient background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-secondary/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Wind className="text-primary-foreground w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Air Lime</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                System Active & Online
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="p-2 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
              <Power className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* AQI Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 col-span-1 lg:col-span-2 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-muted-foreground font-medium mb-1">Air Purity (AQI)</h2>
                <div className="text-5xl font-bold flex items-baseline gap-2">
                  42 <span className="text-lg text-success font-medium">Good</span>
                </div>
              </div>
              <div className="p-3 bg-success/10 rounded-full">
                <Wind className="w-6 h-6 text-success" />
              </div>
            </div>
            <div className="h-[120px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={aqiData.slice(0, 10)}>
                  <defs>
                    <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="aqi" stroke="hsl(var(--success))" fillOpacity={1} fill="url(#colorAqi)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Battery */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-muted-foreground font-medium">Battery Status</h2>
              <Battery className="w-5 h-5 text-primary" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="36" className="stroke-secondary fill-none" strokeWidth="8" />
                  <circle cx="40" cy="40" r="36" className="stroke-primary fill-none transition-all duration-1000" strokeWidth="8" strokeDasharray={`${2 * Math.PI * 36}`} strokeDashoffset={`${2 * Math.PI * 36 * (1 - 0.78)}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">78%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Est. Runtime</p>
                <p className="text-xl font-bold">14h 20m</p>
              </div>
            </div>
          </motion.div>

          {/* Environment */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-muted-foreground font-medium">Environment</h2>
                <div className="flex gap-2 text-xs">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Live</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-warning" />
                    <span className="font-medium">Temperature</span>
                  </div>
                  <span className="text-xl font-bold">{envData.temp.toFixed(1)}°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-400" />
                    <span className="font-medium">Humidity</span>
                  </div>
                  <span className="text-xl font-bold">{envData.humidity.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Lower Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Modes */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 lg:col-span-2">
            <h2 className="text-xl font-bold mb-6">Purifier Modes</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {modes.map(mode => {
                const Icon = mode.icon;
                const isActive = activeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setActiveMode(mode.id)}
                    className={`p-4 rounded-xl text-left transition-all duration-300 border ${isActive ? 'bg-primary/10 border-primary shadow-md shadow-primary/10' : 'bg-secondary/30 border-transparent hover:bg-secondary/50'}`}
                  >
                    <Icon className={`w-6 h-6 mb-3 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    <h3 className={`font-medium mb-1 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{mode.name}</h3>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>{mode.power}</span>
                      <span>{mode.noise}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Filter Health */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4">Filter Health</h2>
            <div className="relative h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filterHealthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="hsl(var(--secondary))" />
                    <Cell fill="hsl(var(--primary))" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-primary">18%</span>
                <span className="text-sm text-muted-foreground">Remaining</span>
              </div>
            </div>
            <div className="text-center mt-2">
              <p className="text-sm text-warning font-medium">Replacement predicted in 14 days</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default App;
