import { useState } from "react";
import { Button } from "@heroui/button";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import AuthModal from "@/app/shared/components/modal/auth";

export const FinalCTA = () => {
  const { data: session } = useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      {session?.user && (
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
                  Присоединяйся к тысячам пользователей, которые уже управляют
                  задачами без хаоса
                </p>
                <Button
                  onPress={() => setIsAuthModalOpen(true)}
                  className="rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-all hover:scale-105 shadow-lg"
                >
                  Создать аккаунт бесплатно
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <AuthModal
        open={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        initialMode="register"
      />
    </>
  );
};
