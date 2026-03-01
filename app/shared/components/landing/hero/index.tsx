import { motion } from "motion/react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background">
        <div
          className="absolute inset-0 opacity-[0.15] dark:opacity-[0.12]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ x: -100, y: 0 }}
          animate={{ x: 100, y: 50 }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[140px]"
        />
        <motion.div
          initial={{ x: 0, y: -50 }}
          animate={{ x: -80, y: 30 }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-accent/5 dark:bg-accent/10 rounded-full blur-[180px]"
        />
        <motion.div
          initial={{ x: 50, y: 100 }}
          animate={{ x: -50, y: -100 }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="absolute bottom-1/4 left-1/2 w-[400px] h-[400px] bg-secondary/5 dark:bg-secondary/10 rounded-full blur-[120px]"
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 relative z-10">
        <div className="flex justify-center text-center items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col text-center items-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-xs font-semibold mb-4 border border-border/50 backdrop-blur-sm"
            >
              <span>Без ограничений. Бесплатно. Навсегда</span>
            </motion.div>

            <h1 className="text-4xl text-center md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Taska — управляй задачами {""}
              <span className="text-gradient">без хаоса</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg text-center mx-auto lg:mx-0">
              Минималистичный таск-менеджер для фокуса, продуктивности и
              командной работы
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-all hover:scale-105 shadow-lg hover:shadow-primary/25">
                Попробовать бесплатно
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
