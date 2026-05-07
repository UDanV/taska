import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Никита Светличный",
    role: "Мобильный разработчик",
    text: "Пользовался Жирой, но узнал о ее принадлежности к Украине и на работе посоветовали замену. Попользовался неделю, продуктивность изменилась! вниз правда!",
    avatar: "Н",
  },
  {
    name: "Егор Жилин",
    role: "Backend-разработчик",
    text: "Удобное реактивное решение. Выбрал под себя цветовую гамму в гибких настройках и глаз радуется! Как простая kanban доска реализует себя полностью. Если не нужны интеграции и глубокое ведение scrum-спринтов - это ваш выбор!",
    avatar: "Е",
  },
  {
    name: "Константин Зоренко",
    role: "Крутой дизайнер",
    text: "Дизайн отличный, очень удобно и быстро работать. В компании было впадлу разворачивать Жиру локально, поэтому мы перешли на Taska и не жалеем!",
    avatar: "К",
  },
];

export const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Что говорят <span className="text-gradient">пользователи</span>
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 md:items-stretch">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex h-full min-h-0 flex-col rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={16} className="fill-primary text-primary" />
                ))}
              </div>
              <p className="min-h-0 flex-1 text-sm leading-relaxed text-muted-foreground">
                «{t.text}»
              </p>
              <div className="mt-6 flex shrink-0 items-center gap-3 border-t border-border/60 pt-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};