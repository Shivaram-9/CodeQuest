import { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaUndoAlt, FaClock, FaStopwatch } from 'react-icons/fa';
import './PomodoroTimer.css';

const PomodoroTimer = ({ onComplete, onXpEarned }) => {
  const [timerActive, setTimerActive] = useState(false);
  const [timerMode, setTimerMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes in seconds
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const timerRef = useRef(null);

  // Pomodoro settings
  const pomodoroSettings = {
    work: 25 * 60, // 25 minutes
    shortBreak: 5 * 60, // 5 minutes
    longBreak: 15 * 60 // 15 minutes
  };

  // Handle timer toggle (start/pause)
  const toggleTimer = () => {
    if (timerActive) {
      clearInterval(timerRef.current);
    } else {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    setTimerActive(!timerActive);
  };

  // Handle timer mode change
  const changeTimerMode = (mode) => {
    clearInterval(timerRef.current);
    setTimerMode(mode);
    setTimeRemaining(pomodoroSettings[mode]);
    setTimerActive(false);
  };

  // Handle timer completion
  const handleTimerComplete = () => {
    clearInterval(timerRef.current);
    
    // Play notification sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 830;
      gainNode.gain.value = 0.5;
      
      oscillator.start();
      
      // Fade out
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);
      
      // Stop after 1 second
      setTimeout(() => {
        oscillator.stop();
      }, 1000);
    } catch (e) {
      console.log('Audio play failed:', e);
    }
    
    // Switch modes
    if (timerMode === 'work') {
      // Increment pomodoro count
      const newCount = pomodoroCount + 1;
      setPomodoroCount(newCount);
      
      // Every 4 pomodoros, take a long break
      if (newCount % 4 === 0) {
        changeTimerMode('longBreak');
      } else {
        changeTimerMode('shortBreak');
      }
      
      // Award XP for completing a work session
      if (onXpEarned) {
        onXpEarned(50);
      }
    } else {
      // After a break, go back to work mode
      changeTimerMode('work');
    }
    
    // Callback for parent component
    if (onComplete) {
      onComplete(timerMode);
    }
    
    // Notify user
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(timerMode === 'work' 
        ? 'Time for a break!' 
        : 'Break is over, back to work!');
    }
  };

  // Reset timer
  const resetTimer = () => {
    clearInterval(timerRef.current);
    setTimeRemaining(pomodoroSettings[timerMode]);
    setTimerActive(false);
  };

  // Format time for display
  const formatTimerDisplay = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Update document title
  useEffect(() => {
    if (timerActive) {
      document.title = `(${formatTimerDisplay(timeRemaining)}) CodeQuest`;
      
      // Request notification permission if not granted
      if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    } else {
      document.title = 'CodeQuest';
    }
    
    return () => {
      document.title = 'CodeQuest';
    };
  }, [timeRemaining, timerActive]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="pomodoro-panel">
      <div className="pomodoro-header">
        <h3><FaClock /> Pomodoro Timer</h3>
        <div className="pomodoro-tabs">
          <button 
            className={`pomodoro-tab ${timerMode === 'work' ? 'active' : ''}`}
            onClick={() => changeTimerMode('work')}
          >
            Work
          </button>
          <button 
            className={`pomodoro-tab ${timerMode === 'shortBreak' ? 'active' : ''}`}
            onClick={() => changeTimerMode('shortBreak')}
          >
            Short Break
          </button>
          <button 
            className={`pomodoro-tab ${timerMode === 'longBreak' ? 'active' : ''}`}
            onClick={() => changeTimerMode('longBreak')}
          >
            Long Break
          </button>
        </div>
      </div>
      
      <div className="pomodoro-timer">
        <div className="timer-display">
          {formatTimerDisplay(timeRemaining)}
        </div>
        <div className="timer-controls">
          <button 
            className="timer-btn"
            onClick={toggleTimer}
            title={timerActive ? "Pause" : "Start"}
          >
            {timerActive ? <FaPause /> : <FaPlay />}
          </button>
          <button 
            className="timer-btn"
            onClick={resetTimer}
            title="Reset"
          >
            <FaUndoAlt />
          </button>
        </div>
      </div>
      
      <div className="pomodoro-stats">
        <div className="pomodoro-count">
          <FaStopwatch /> {pomodoroCount} Pomodoros completed
        </div>
        <div className="pomodoro-mode">
          {timerMode === 'work' ? 'Focus time' : timerMode === 'shortBreak' ? 'Short break' : 'Long break'}
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer; 