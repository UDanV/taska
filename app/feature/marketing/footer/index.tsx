import { LogoIcon } from "@/app/shared/components/icons/common";

export const Footer = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-lg font-bold text-gradient"><LogoIcon /></span>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Возможности</a>
            <a href="#how" className="hover:text-foreground transition-colors">Как это работает</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Отзывы</a>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Taska. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};