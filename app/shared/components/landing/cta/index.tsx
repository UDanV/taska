import { motion } from "framer-motion";

export const FinalCTA = () => {
  return (
    <section id="cta" className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-card border border-border p-12 md:p-20 text-center"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary opacity-10 rounded-full blur-[100px]" />
          </div>

          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
              Начни использовать Taska{" "}
              <span className="text-gradient">уже сегодня</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Присоединяйся к тысячам пользователей, которые уже управляют задачами без хаоса
            </p>
            <a
              href="#"
              className="inline-flex items-center justify-center px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-opacity glow"
            >
              Создать аккаунт бесплатно
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};