import React from 'react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Tricolor Gradient Background with Blue */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF9933] via-[#ffffff] via-[#000080] to-[#138808]" />

      {/* Animated Particles (Blue Dots) */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-900 rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 bg-black/10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Floating Shapes */}
      <div className="absolute top-3/4 left-1/4 w-64 h-64 bg-orange-900/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-3/4 right-1/4 w-48 h-48 bg-green-900/20 rounded-full blur-2xl animate-pulse"
        style={{ animationDelay: '1s' }}
      />
    </div>
  );
};
export default AnimatedBackground;