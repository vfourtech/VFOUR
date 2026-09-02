import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import "./LoadingScreen.css";

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2800;
    const intervalTime = 20;

    const interval = setInterval(() => {
      setProgress((previous) => {
        const next = previous + 100 / (duration / intervalTime);

        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }

        return next;
      });
    }, intervalTime);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          className="loading-screen"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.02,
            filter: "blur(8px)",
            transition: {
              duration: 0.9,
              ease: "easeInOut",
            },
          }}
        >
          {/* Background Grid */}
          <div className="loading-grid" />

          {/* Ambient Glow */}
          <div className="loading-glow" />

          {/* Decorative Lines */}
          <div className="loading-orbit loading-orbit-one" />
          <div className="loading-orbit loading-orbit-two" />

          {/* Floating Particles */}
          <div className="loading-particles">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          {/* Main Content */}
          <div className="loading-content">

            {/* Top System Label */}
            <motion.div
              className="system-label"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              VFOUR / DIGITAL SYSTEM
            </motion.div>

            {/* V4 Mark */}
            <motion.div
              className="loading-mark-container"
              initial={{
                opacity: 0,
                scale: 0.65,
                rotate: -8,
                filter: "blur(12px)",
              }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: 0,
                filter: "blur(0px)",
              }}
              transition={{
                duration: 1.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="loading-mark">
                V<span>4</span>
              </div>

              <div className="mark-line" />
            </motion.div>

            {/* System Status */}
            <motion.div
              className="loading-status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <span className="status-dot" />
              SYSTEM INITIALIZING
            </motion.div>

            {/* Capabilities */}
            <motion.div
              className="system-capabilities"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.7 }}
            >
              <span>AI</span>
              <i />
              <span>SOFTWARE</span>
              <i />
              <span>DATA</span>
              <i />
              <span>CLOUD</span>
            </motion.div>

            {/* Progress */}
            <motion.div
              className="loading-progress-area"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <div className="progress-info">
                <span>LOADING EXPERIENCE</span>

                <span className="progress-number">
                  {Math.round(progress)
                    .toString()
                    .padStart(3, "0")}
                  %
                </span>
              </div>

              <div className="loading-track">
                <motion.div
                  className="loading-progress"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </motion.div>

            {/* Bottom Label */}
            <motion.div
              className="loading-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              BUILDING WHAT'S NEXT
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;