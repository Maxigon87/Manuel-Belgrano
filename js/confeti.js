
      window.addEventListener("load", () => {
        const duration = 5 * 1000; // 5 segundos
        const animationEnd = Date.now() + duration;
        const defaults = {
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          zIndex: 1000,
        };

        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          confetti({
            ...defaults,
            particleCount: 20,
            origin: { x: 0, y: Math.random() - 0.2 },
          });

          confetti({
            ...defaults,
            particleCount: 20,
            origin: { x: 1, y: Math.random() - 0.2 },
          });
        }, 250);
      });
    