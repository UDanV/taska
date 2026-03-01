import { motion } from "framer-motion";
import { AlertTriangle, ListX, ArrowDownUp, Puzzle } from "lucide-react";

const problems = [
  { icon: AlertTriangle, title: "Потерянные задачи", desc: "Забытые задачи и дедлайны приводят к провалам" },
  { icon: ListX, title: "Перегруженные списки", desc: "Бесконечные списки без структуры демотивируют" },
  { icon: ArrowDownUp, title: "Нет приоритетов", desc: "Всё кажется срочным, когда нет системы" },
  { icon: Puzzle, title: "Сложные интерфейсы", desc: "Инструменты, которые отвлекают вместо помощи" },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const Problems = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {problems.map((p) => (
              <motion.div
                key={p.title}
                variants={itemVariants}
                className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                  <p.icon size={20} className="text-destructive" />
                </div>
                <h3 className="font-bold mb-1">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
              Знакомо? <span className="text-gradient">Taska решает это</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Taska помогает структурировать, приоритизировать и доводить задачи до результата. Никакого хаоса — только фокус и продуктивность.
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Простота — наш главный принцип
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};