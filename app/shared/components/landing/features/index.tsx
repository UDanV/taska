import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Zap,
  Users,
  Tags,
  BarChart3,
} from "lucide-react";

const features = [
  { icon: LayoutDashboard, title: "Канбан-доски", desc: "Визуальное управление задачами с перетаскиванием" },
  { icon: Zap, title: "Умные приоритеты", desc: "Автоматическая расстановка по важности и срочности" },
  { icon: Users, title: "Командная работа", desc: "Совместная работа над проектами в реальном времени" },
  { icon: Tags, title: "Теги и фильтры", desc: "Мгновенный поиск и группировка задач" },
  { icon: BarChart3, title: "Дашборд", desc: "Отслеживайте прогресс и продуктивность" },
];

export const Features = () => {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Всё, что нужно для <span className="text-gradient">продуктивности</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Мощные инструменты в простом и красивом интерфейсе
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="grid sm:grid-cols-2 lg:grid-cols-6 gap-5"
        >
          {features.map((f, index) => {
            const isTwoItemsInLastRow = features.length % 3 === 2 && index >= features.length - 2;
            const centeredLastRowClass = isTwoItemsInLastRow
              ? index === features.length - 2
                ? "lg:col-start-2"
                : "lg:col-start-4"
              : "";

            return (
            <motion.div
              key={f.title}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              className={`group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-shadow duration-300 cursor-default lg:col-span-2 ${centeredLastRowClass}`}
            >
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-primary/15">
                <f.icon size={22} className="text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};