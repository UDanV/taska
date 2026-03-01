import { motion } from "framer-motion";
import { PlusCircle, FolderKanban, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: PlusCircle,
    step: "01",
    title: "Создай задачу",
    desc: "Добавь задачу за секунду — просто введи название и готово",
  },
  {
    icon: FolderKanban,
    step: "02",
    title: "Организуй",
    desc: "Расставь приоритеты, добавь теги и распредели по доскам",
  },
  {
    icon: CheckCircle2,
    step: "03",
    title: "Выполни",
    desc: "Отслеживай прогресс и отмечай завершённые задачи",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how" className="py-20 md:py-28 bg-muted">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Как это <span className="text-gradient">работает</span>
          </h2>
          <p className="text-lg text-muted-foreground">Три простых шага к продуктивности</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center"
            >
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-2xl bg-primary opacity-15 rotate-6" />
                <div className="relative w-full h-full rounded-2xl bg-primary/10 flex items-center justify-center">
                  <s.icon size={28} className="text-primary" />
                </div>
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                Шаг {s.step}
              </span>
              <h3 className="text-xl font-bold mt-2 mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};